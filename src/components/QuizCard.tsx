import { useState } from 'react';
import { Check, X, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { QuizQuestion } from '@/types/quiz';

interface QuizCardProps {
  question: QuizQuestion;
  index: number;
  mode: 'view' | 'take';
  selectedAnswer?: string;
  onSelectAnswer?: (answer: string) => void;
  showResult?: boolean;
}

export function QuizCard({ 
  question, 
  index, 
  mode, 
  selectedAnswer, 
  onSelectAnswer,
  showResult = false 
}: QuizCardProps) {
  const [showExplanation, setShowExplanation] = useState(mode === 'view');

  const getDifficultyStyles = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-difficulty-easy text-white';
      case 'medium':
        return 'bg-difficulty-medium text-foreground';
      case 'hard':
        return 'bg-difficulty-hard text-white';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getOptionStyles = (option: string) => {
    if (mode === 'view') {
      return option === question.answer 
        ? 'border-success bg-success/10 text-foreground' 
        : 'border-border bg-card';
    }

    if (showResult) {
      if (option === question.answer) {
        return 'border-success bg-success/10 text-foreground';
      }
      if (option === selectedAnswer && option !== question.answer) {
        return 'border-destructive bg-destructive/10 text-foreground';
      }
      return 'border-border bg-card opacity-60';
    }

    return option === selectedAnswer
      ? 'border-secondary bg-secondary/10 text-foreground'
      : 'border-border bg-card hover:border-muted-foreground/40 cursor-pointer';
  };

  return (
    <div 
      className="bg-card rounded-xl shadow-card border border-border overflow-hidden animate-fade-up"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="p-6 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-semibold">
              {index + 1}
            </span>
            <span className={cn(
              'px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wide',
              getDifficultyStyles(question.difficulty)
            )}>
              {question.difficulty}
            </span>
          </div>
        </div>

        {/* Question */}
        <h3 className="text-lg font-serif font-medium leading-relaxed">
          {question.question}
        </h3>

        {/* Options */}
        <div className="grid gap-3">
          {question.options.map((option, optIndex) => (
            <button
              key={optIndex}
              onClick={() => mode === 'take' && !showResult && onSelectAnswer?.(option)}
              disabled={mode === 'view' || showResult}
              className={cn(
                'w-full text-left px-4 py-3 rounded-lg border-2 transition-all flex items-center gap-3',
                getOptionStyles(option)
              )}
            >
              <span className="flex-shrink-0 w-6 h-6 rounded-full border-2 border-current flex items-center justify-center text-xs font-medium">
                {String.fromCharCode(65 + optIndex)}
              </span>
              <span className="flex-1">{option}</span>
              {mode === 'view' && option === question.answer && (
                <Check className="w-5 h-5 text-success flex-shrink-0" />
              )}
              {showResult && option === question.answer && (
                <Check className="w-5 h-5 text-success flex-shrink-0" />
              )}
              {showResult && option === selectedAnswer && option !== question.answer && (
                <X className="w-5 h-5 text-destructive flex-shrink-0" />
              )}
            </button>
          ))}
        </div>

        {/* Explanation toggle */}
        {(mode === 'view' || showResult) && (
          <div className="pt-2">
            <button
              onClick={() => setShowExplanation(!showExplanation)}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {showExplanation ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              {showExplanation ? 'Hide' : 'Show'} explanation
            </button>
            {showExplanation && (
              <div className="mt-3 p-4 bg-muted/50 rounded-lg text-sm text-muted-foreground">
                <strong className="text-foreground">Explanation:</strong> {question.explanation}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}