export interface QuizQuestion {
  question: string;
  options: string[];
  answer: string;
  difficulty: 'easy' | 'medium' | 'hard';
  explanation: string;
}

export interface KeyEntities {
  people: string[];
  organizations: string[];
  locations: string[];
}

export interface Quiz {
  id: string;
  url: string;
  title: string;
  summary: string | null;
  key_entities: KeyEntities;
  sections: string[];
  quiz: QuizQuestion[];
  related_topics: string[];
  raw_html?: string;
  created_at: string;
  cached?: boolean;
}

export interface QuizAttempt {
  id: string;
  quiz_id: string;
  score: number;
  total_questions: number;
  answers: UserAnswer[];
  completed_at: string;
}

export interface UserAnswer {
  questionIndex: number;
  selectedAnswer: string;
  isCorrect: boolean;
}