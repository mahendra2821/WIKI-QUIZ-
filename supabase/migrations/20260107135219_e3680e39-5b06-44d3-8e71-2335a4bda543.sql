-- Create quizzes table to store all quiz data
CREATE TABLE public.quizzes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  url TEXT NOT NULL,
  title TEXT NOT NULL,
  summary TEXT,
  key_entities JSONB DEFAULT '{}',
  sections TEXT[] DEFAULT '{}',
  quiz JSONB DEFAULT '[]',
  related_topics TEXT[] DEFAULT '{}',
  raw_html TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index on URL for faster lookups and caching
CREATE INDEX idx_quizzes_url ON public.quizzes(url);

-- Enable RLS (public access for this demo app)
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;

-- Allow public read access to all quizzes
CREATE POLICY "Anyone can read quizzes" 
ON public.quizzes 
FOR SELECT 
USING (true);

-- Allow public insert for new quizzes
CREATE POLICY "Anyone can create quizzes" 
ON public.quizzes 
FOR INSERT 
WITH CHECK (true);

-- Create quiz_attempts table for Take Quiz mode
CREATE TABLE public.quiz_attempts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_id UUID REFERENCES public.quizzes(id) ON DELETE CASCADE,
  score INTEGER NOT NULL DEFAULT 0,
  total_questions INTEGER NOT NULL DEFAULT 0,
  answers JSONB DEFAULT '[]',
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;

-- Allow public access for quiz attempts
CREATE POLICY "Anyone can read quiz attempts" 
ON public.quiz_attempts 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create quiz attempts" 
ON public.quiz_attempts 
FOR INSERT 
WITH CHECK (true);