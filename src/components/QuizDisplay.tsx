import { useState } from 'react';
import { ExternalLink, Users, Building2, MapPin, BookOpen, ArrowRight, Trophy, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { QuizCard } from './QuizCard';
import { Quiz, UserAnswer } from '@/types/quiz';
import { saveQuizAttempt } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface QuizDisplayProps {
  quiz: Quiz;
  mode?: 'view' | 'take';
  onReset?: () => void;
}

export function QuizDisplay({ quiz, mode = 'view', onReset }: QuizDisplayProps) {
  const { toast } = useToast();
  const [currentMode, setCurrentMode] = useState(mode);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  const handleSelectAnswer = (index: number, answer: string) => {
    if (!showResults) {
      setAnswers(prev => ({ ...prev, [index]: answer }));
    }
  };

  const handleSubmitQuiz = async () => {
    const userAnswers: UserAnswer[] = quiz.quiz.map((q, i) => ({
      questionIndex: i,
      selectedAnswer: answers[i] || '',
      isCorrect: answers[i] === q.answer,
    }));

    const correctCount = userAnswers.filter(a => a.isCorrect).length;
    setScore(correctCount);
    setShowResults(true);

    setIsSaving(true);
    try {
      await saveQuizAttempt(quiz.id, userAnswers, correctCount, quiz.quiz.length);
      toast({
        title: 'Quiz Completed!',
        description: `You scored ${correctCount} out of ${quiz.quiz.length}`,
      });
    } catch (error) {
      console.error('Failed to save quiz attempt:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRetakeQuiz = () => {
    setAnswers({});
    setShowResults(false);
    setScore(0);
  };

  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount === quiz.quiz.length;

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Article Header */}
      <div className="bg-card rounded-xl shadow-card border border-border p-6 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground">
              {quiz.title}
            </h2>
            <a 
              href={quiz.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-secondary transition-colors mt-1"
            >
              View on Wikipedia <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          {quiz.cached && (
            <span className="px-3 py-1 bg-muted text-muted-foreground text-xs rounded-full">
              Cached
            </span>
          )}
        </div>

        {quiz.summary && (
          <p className="text-muted-foreground leading-relaxed">
            {quiz.summary}
          </p>
        )}

        {/* Key Entities */}
        {quiz.key_entities && (
          <div className="grid md:grid-cols-3 gap-4 pt-4 border-t border-border">
            {quiz.key_entities.people?.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Users className="w-4 h-4" />
                  People
                </div>
                <div className="flex flex-wrap gap-1">
                  {quiz.key_entities.people.slice(0, 5).map((person, i) => (
                    <span key={i} className="px-2 py-1 bg-muted text-xs rounded-md">
                      {person}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {quiz.key_entities.organizations?.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Building2 className="w-4 h-4" />
                  Organizations
                </div>
                <div className="flex flex-wrap gap-1">
                  {quiz.key_entities.organizations.slice(0, 5).map((org, i) => (
                    <span key={i} className="px-2 py-1 bg-muted text-xs rounded-md">
                      {org}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {quiz.key_entities.locations?.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  Locations
                </div>
                <div className="flex flex-wrap gap-1">
                  {quiz.key_entities.locations.slice(0, 5).map((loc, i) => (
                    <span key={i} className="px-2 py-1 bg-muted text-xs rounded-md">
                      {loc}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Sections */}
        {quiz.sections?.length > 0 && (
          <div className="pt-4 border-t border-border">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
              <BookOpen className="w-4 h-4" />
              Article Sections
            </div>
            <div className="flex flex-wrap gap-2">
              {quiz.sections.map((section, i) => (
                <span key={i} className="px-3 py-1 bg-primary/10 text-primary text-xs rounded-full">
                  {section}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Quiz Mode Toggle */}
      {currentMode === 'view' && (
        <div className="flex justify-center">
          <Button 
            onClick={() => setCurrentMode('take')} 
            className="bg-gradient-amber text-foreground font-semibold px-8"
          >
            <Trophy className="w-4 h-4 mr-2" />
            Take This Quiz
          </Button>
        </div>
      )}

      {/* Results Banner */}
      {showResults && (
        <div className="bg-gradient-hero text-primary-foreground rounded-xl p-6 text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Trophy className="w-8 h-8 text-secondary" />
            <h3 className="text-2xl font-serif font-bold">Quiz Complete!</h3>
          </div>
          <p className="text-3xl font-bold">
            {score} / {quiz.quiz.length}
            <span className="text-lg font-normal ml-2">
              ({Math.round((score / quiz.quiz.length) * 100)}%)
            </span>
          </p>
          <Button 
            onClick={handleRetakeQuiz}
            variant="outline"
            className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Retake Quiz
          </Button>
        </div>
      )}

      {/* Progress indicator for take mode */}
      {currentMode === 'take' && !showResults && (
        <div className="bg-card rounded-lg p-4 border border-border">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Progress: {answeredCount} of {quiz.quiz.length} answered
            </span>
            <span className="font-medium">
              {Math.round((answeredCount / quiz.quiz.length) * 100)}%
            </span>
          </div>
          <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-amber transition-all duration-300"
              style={{ width: `${(answeredCount / quiz.quiz.length) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Quiz Questions */}
      <div className="space-y-6">
        <h3 className="text-xl font-serif font-semibold flex items-center gap-2">
          <span className="w-8 h-1 bg-secondary rounded-full" />
          Quiz Questions ({quiz.quiz.length})
        </h3>
        <div className="space-y-4">
          {quiz.quiz.map((question, index) => (
            <QuizCard
              key={index}
              question={question}
              index={index}
              mode={currentMode}
              selectedAnswer={answers[index]}
              onSelectAnswer={(answer) => handleSelectAnswer(index, answer)}
              showResult={showResults}
            />
          ))}
        </div>
      </div>

      {/* Submit Button */}
      {currentMode === 'take' && !showResults && (
        <div className="flex justify-center">
          <Button 
            onClick={handleSubmitQuiz}
            disabled={!allAnswered || isSaving}
            className="bg-gradient-hero text-primary-foreground font-semibold px-12 py-6 text-lg"
          >
            {isSaving ? 'Saving...' : 'Submit Answers'}
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      )}

      {/* Related Topics */}
      {quiz.related_topics?.length > 0 && (
        <div className="bg-card rounded-xl shadow-card border border-border p-6 space-y-4">
          <h3 className="text-lg font-serif font-semibold">Related Topics</h3>
          <div className="flex flex-wrap gap-2">
            {quiz.related_topics.map((topic, i) => (
              <a
                key={i}
                href={`https://en.wikipedia.org/wiki/${encodeURIComponent(topic.replace(/ /g, '_'))}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-4 py-2 bg-accent/10 text-accent hover:bg-accent/20 rounded-full text-sm transition-colors"
              >
                {topic}
                <ExternalLink className="w-3 h-3" />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Back button */}
      {onReset && (
        <div className="flex justify-center pt-4">
          <Button variant="outline" onClick={onReset}>
            Generate Another Quiz
          </Button>
        </div>
      )}
    </div>
  );
}