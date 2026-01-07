import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ExternalLink, Eye, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { QuizDisplay } from './QuizDisplay';
import { Quiz } from '@/types/quiz';
import { fetchQuizById } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface HistoryTableProps {
  quizzes: Quiz[];
  isLoading: boolean;
}

export function HistoryTable({ quizzes, isLoading }: HistoryTableProps) {
  const { toast } = useToast();
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleViewDetails = async (quiz: Quiz) => {
    setIsLoadingDetails(true);
    try {
      const fullQuiz = await fetchQuizById(quiz.id);
      if (fullQuiz) {
        setSelectedQuiz(fullQuiz);
        setIsModalOpen(true);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load quiz details',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingDetails(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (quizzes.length === 0) {
    return (
      <div className="text-center py-16 space-y-4">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
          <Eye className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-serif font-semibold">No quizzes yet</h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          Generate your first quiz from a Wikipedia article to see it here.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-card rounded-xl shadow-card border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold text-muted-foreground">
                  Article
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-muted-foreground">
                  Questions
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-muted-foreground">
                  Generated
                </th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {quizzes.map((quiz, index) => (
                <tr 
                  key={quiz.id} 
                  className="hover:bg-muted/30 transition-colors animate-fade-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <p className="font-medium text-foreground line-clamp-1">
                        {quiz.title}
                      </p>
                      <a
                        href={quiz.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-secondary transition-colors"
                      >
                        View source <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-medium">
                      {quiz.quiz?.length || 0}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(quiz.created_at), { addSuffix: true })}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetails(quiz)}
                      disabled={isLoadingDetails}
                    >
                      {isLoadingDetails ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <Eye className="w-4 h-4 mr-1" />
                          Details
                        </>
                      )}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-serif">Quiz Details</DialogTitle>
          </DialogHeader>
          {selectedQuiz && (
            <QuizDisplay quiz={selectedQuiz} mode="view" />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}