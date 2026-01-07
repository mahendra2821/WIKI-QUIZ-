import { useState, useEffect } from 'react';
import { BookOpen, History, Sparkles } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UrlInput } from '@/components/UrlInput';
import { QuizDisplay } from '@/components/QuizDisplay';
import { HistoryTable } from '@/components/HistoryTable';
import { generateQuiz, fetchQuizHistory } from '@/lib/api';
import { Quiz } from '@/types/quiz';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('generate');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedQuiz, setGeneratedQuiz] = useState<Quiz | null>(null);
  const [historyQuizzes, setHistoryQuizzes] = useState<Quiz[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const loadHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const quizzes = await fetchQuizHistory();
      setHistoryQuizzes(quizzes);
    } catch (error) {
      console.error('Failed to load history:', error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'history') {
      loadHistory();
    }
  }, [activeTab]);

  const handleGenerateQuiz = async (url: string) => {
    setIsLoading(true);
    setGeneratedQuiz(null);

    try {
      const quiz = await generateQuiz(url);
      setGeneratedQuiz(quiz);
      toast({
        title: quiz.cached ? 'Quiz Loaded' : 'Quiz Generated!',
        description: quiz.cached 
          ? 'This quiz was loaded from cache.' 
          : `Created ${quiz.quiz.length} questions about "${quiz.title}"`,
      });
    } catch (error) {
      toast({
        title: 'Generation Failed',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setGeneratedQuiz(null);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Header */}
      <header className="bg-gradient-hero text-primary-foreground py-16 px-4">
        <div className="container mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-sm backdrop-blur-sm">
            <Sparkles className="w-4 h-4 text-secondary" />
            AI-Powered Learning
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold">
            Wiki Quiz
          </h1>
          <p className="text-lg text-primary-foreground/80 max-w-2xl mx-auto">
            Transform any Wikipedia article into an interactive quiz. 
            Learn faster with AI-generated questions tailored to the content.
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 -mt-8">
        <div className="bg-card rounded-2xl shadow-elevated border border-border overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="border-b border-border px-6 pt-4">
              <TabsList className="bg-muted/50 p-1 rounded-lg">
                <TabsTrigger 
                  value="generate" 
                  className="data-[state=active]:bg-card data-[state=active]:shadow-sm rounded-md px-6 py-2.5 flex items-center gap-2"
                >
                  <BookOpen className="w-4 h-4" />
                  Generate Quiz
                </TabsTrigger>
                <TabsTrigger 
                  value="history"
                  className="data-[state=active]:bg-card data-[state=active]:shadow-sm rounded-md px-6 py-2.5 flex items-center gap-2"
                >
                  <History className="w-4 h-4" />
                  Past Quizzes
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="p-6 md:p-8">
              <TabsContent value="generate" className="mt-0 space-y-8">
                {!generatedQuiz ? (
                  <div className="py-8">
                    <UrlInput onSubmit={handleGenerateQuiz} isLoading={isLoading} />
                  </div>
                ) : (
                  <QuizDisplay 
                    quiz={generatedQuiz} 
                    mode="view" 
                    onReset={handleReset} 
                  />
                )}
              </TabsContent>

              <TabsContent value="history" className="mt-0">
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-serif font-semibold">Quiz History</h2>
                    <p className="text-muted-foreground text-sm mt-1">
                      View and retake previously generated quizzes
                    </p>
                  </div>
                  <HistoryTable quizzes={historyQuizzes} isLoading={isLoadingHistory} />
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-16 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>
            Wiki Quiz uses AI to generate educational quizzes from Wikipedia content.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;