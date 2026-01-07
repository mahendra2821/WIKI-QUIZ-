import { supabase } from '@/integrations/supabase/client';
import { Quiz, QuizAttempt, UserAnswer } from '@/types/quiz';

const FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-quiz`;

export async function generateQuiz(url: string, forceRefresh = false): Promise<Quiz> {
  const response = await fetch(FUNCTION_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify({ url, forceRefresh }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to generate quiz');
  }

  return response.json();
}

export async function fetchQuizHistory(): Promise<Quiz[]> {
  const { data, error } = await supabase
    .from('quizzes')
    .select('id, url, title, summary, key_entities, sections, quiz, related_topics, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data || []).map(item => ({
    ...item,
    key_entities: item.key_entities as unknown as Quiz['key_entities'],
    sections: item.sections || [],
    quiz: item.quiz as unknown as Quiz['quiz'],
    related_topics: item.related_topics || [],
  }));
}

export async function fetchQuizById(id: string): Promise<Quiz | null> {
  const { data, error } = await supabase
    .from('quizzes')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) return null;

  return {
    ...data,
    key_entities: data.key_entities as unknown as Quiz['key_entities'],
    sections: data.sections || [],
    quiz: data.quiz as unknown as Quiz['quiz'],
    related_topics: data.related_topics || [],
  };
}

export async function saveQuizAttempt(
  quizId: string,
  answers: UserAnswer[],
  score: number,
  totalQuestions: number
): Promise<QuizAttempt> {
  const { data, error } = await supabase
    .from('quiz_attempts')
    .insert([{
      quiz_id: quizId,
      score,
      total_questions: totalQuestions,
      answers: JSON.parse(JSON.stringify(answers)),
    }])
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return {
    ...data,
    answers: data.answers as unknown as UserAnswer[],
  };
}

export function validateWikipediaUrl(url: string): { valid: boolean; error?: string } {
  if (!url) {
    return { valid: false, error: 'Please enter a URL' };
  }

  try {
    const parsed = new URL(url);
    if (!parsed.hostname.includes('wikipedia.org')) {
      return { valid: false, error: 'Please enter a Wikipedia URL' };
    }
    if (!parsed.pathname.includes('/wiki/')) {
      return { valid: false, error: 'Please enter a valid Wikipedia article URL' };
    }
    return { valid: true };
  } catch {
    return { valid: false, error: 'Please enter a valid URL' };
  }
}