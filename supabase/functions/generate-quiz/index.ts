import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface QuizQuestion {
  question: string;
  options: string[];
  answer: string;
  difficulty: 'easy' | 'medium' | 'hard';
  explanation: string;
}

interface QuizData {
  url: string;
  title: string;
  summary: string;
  key_entities: {
    people: string[];
    organizations: string[];
    locations: string[];
  };
  sections: string[];
  quiz: QuizQuestion[];
  related_topics: string[];
  raw_html?: string;
}

async function scrapeWikipedia(url: string): Promise<{ html: string; text: string; title: string; sections: string[] }> {
  console.log('Scraping Wikipedia URL:', url);
  
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'WikiQuizApp/1.0 (Educational Quiz Generator)',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch Wikipedia page: ${response.status}`);
  }

  const html = await response.text();
  
  // Extract title from HTML
  const titleMatch = html.match(/<h1[^>]*id="firstHeading"[^>]*>(.*?)<\/h1>/s);
  const title = titleMatch ? titleMatch[1].replace(/<[^>]*>/g, '').trim() : 'Unknown Title';
  
  // Extract main content - simplified parsing for edge function
  const contentMatch = html.match(/<div[^>]*id="mw-content-text"[^>]*>(.*?)<\/div>\s*<!--\s*\/mw-content-text/s);
  let contentHtml = contentMatch ? contentMatch[1] : html;
  
  // Extract section headings
  const sectionMatches = contentHtml.matchAll(/<h2[^>]*><span[^>]*class="mw-headline"[^>]*id="([^"]*)"[^>]*>([^<]*)<\/span>/g);
  const sections: string[] = [];
  for (const match of sectionMatches) {
    const sectionName = match[2].trim();
    if (!['See_also', 'References', 'External_links', 'Notes', 'Further_reading', 'Bibliography'].includes(sectionName.replace(/ /g, '_'))) {
      sections.push(sectionName);
    }
  }
  
  // Strip HTML tags for text content
  const text = contentHtml
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/\[\d+\]/g, '') // Remove citation references
    .trim()
    .slice(0, 15000); // Limit text length for LLM context

  console.log(`Extracted ${text.length} chars, ${sections.length} sections`);
  
  return { html, text, title, sections };
}

async function generateQuizWithLLM(text: string, title: string, sections: string[]): Promise<{
  summary: string;
  key_entities: { people: string[]; organizations: string[]; locations: string[] };
  quiz: QuizQuestion[];
  related_topics: string[];
}> {
  const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
  if (!LOVABLE_API_KEY) {
    throw new Error('LOVABLE_API_KEY is not configured');
  }

  const systemPrompt = `You are an expert educational quiz generator. Your task is to create high-quality quiz questions from Wikipedia article content. 

CRITICAL INSTRUCTIONS:
1. Generate EXACTLY what is requested - no more, no less
2. Base ALL questions strictly on the provided article content - NO hallucination
3. Ensure questions test factual knowledge from the article
4. Create a balanced mix of difficulty levels
5. Each question must have exactly 4 options with only ONE correct answer
6. Explanations should reference which part of the article contains the answer`;

  const userPrompt = `Analyze this Wikipedia article about "${title}" and generate a comprehensive quiz.

ARTICLE CONTENT:
${text}

ARTICLE SECTIONS:
${sections.join(', ')}

Generate a JSON response with this EXACT structure:
{
  "summary": "A 2-3 sentence summary of the article",
  "key_entities": {
    "people": ["list of important people mentioned"],
    "organizations": ["list of organizations mentioned"],
    "locations": ["list of locations mentioned"]
  },
  "quiz": [
    {
      "question": "Clear, specific question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "answer": "The correct option (exact text from options)",
      "difficulty": "easy|medium|hard",
      "explanation": "Brief explanation referencing the article section"
    }
  ],
  "related_topics": ["5-7 related Wikipedia topics for further reading"]
}

Generate 8-10 questions with this distribution:
- 2-3 easy questions (basic facts, names, dates)
- 4-5 medium questions (relationships, causes, effects)
- 2-3 hard questions (analysis, comparisons, implications)

IMPORTANT: Return ONLY valid JSON, no markdown formatting or extra text.`;

  console.log('Calling Lovable AI for quiz generation...');

  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${LOVABLE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('AI API error:', response.status, errorText);
    
    if (response.status === 429) {
      throw new Error('Rate limit exceeded. Please try again in a moment.');
    }
    if (response.status === 402) {
      throw new Error('AI credits exhausted. Please add credits to continue.');
    }
    throw new Error(`AI generation failed: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  
  if (!content) {
    throw new Error('No content returned from AI');
  }

  console.log('AI response received, parsing...');

  // Clean and parse JSON response
  let cleanedContent = content
    .replace(/```json\n?/g, '')
    .replace(/```\n?/g, '')
    .trim();

  try {
    return JSON.parse(cleanedContent);
  } catch (parseError) {
    console.error('JSON parse error:', parseError);
    console.log('Raw content:', cleanedContent.slice(0, 500));
    throw new Error('Failed to parse AI response as JSON');
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url, forceRefresh } = await req.json();

    if (!url) {
      return new Response(
        JSON.stringify({ error: 'Wikipedia URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate Wikipedia URL
    if (!url.includes('wikipedia.org/wiki/')) {
      return new Response(
        JSON.stringify({ error: 'Please provide a valid Wikipedia article URL' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check cache (unless force refresh)
    if (!forceRefresh) {
      const { data: existingQuiz } = await supabase
        .from('quizzes')
        .select('*')
        .eq('url', url)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (existingQuiz) {
        console.log('Returning cached quiz for:', url);
        return new Response(
          JSON.stringify({ ...existingQuiz, cached: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Scrape Wikipedia
    const { html, text, title, sections } = await scrapeWikipedia(url);

    // Generate quiz with LLM
    const llmResult = await generateQuizWithLLM(text, title, sections);

    // Prepare quiz data
    const quizData: Omit<QuizData, 'id' | 'created_at'> = {
      url,
      title,
      summary: llmResult.summary,
      key_entities: llmResult.key_entities,
      sections,
      quiz: llmResult.quiz,
      related_topics: llmResult.related_topics,
      raw_html: html,
    };

    // Store in database
    const { data: savedQuiz, error: insertError } = await supabase
      .from('quizzes')
      .insert(quizData)
      .select()
      .single();

    if (insertError) {
      console.error('Database insert error:', insertError);
      throw new Error('Failed to save quiz to database');
    }

    console.log('Quiz generated and saved successfully');

    return new Response(
      JSON.stringify({ ...savedQuiz, cached: false }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error generating quiz:', error);
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});