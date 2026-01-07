import { useState, useEffect } from 'react';
import { Search, Loader2, ExternalLink, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { validateWikipediaUrl } from '@/lib/api';

interface UrlInputProps {
  onSubmit: (url: string) => void;
  isLoading: boolean;
}

export function UrlInput({ onSubmit, isLoading }: UrlInputProps) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (url) {
      const validation = validateWikipediaUrl(url);
      if (validation.valid) {
        // Extract article title for preview
        try {
          const parsed = new URL(url);
          const articlePath = parsed.pathname.split('/wiki/')[1];
          const title = decodeURIComponent(articlePath).replace(/_/g, ' ');
          setPreview(title);
          setError('');
        } catch {
          setPreview(null);
        }
      } else {
        setPreview(null);
        if (url.length > 10) {
          setError(validation.error || '');
        }
      }
    } else {
      setPreview(null);
      setError('');
    }
  }, [url]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateWikipediaUrl(url);
    if (!validation.valid) {
      setError(validation.error || 'Invalid URL');
      return;
    }
    onSubmit(url);
  };

  const exampleUrls = [
    { title: 'Alan Turing', url: 'https://en.wikipedia.org/wiki/Alan_Turing' },
    { title: 'Marie Curie', url: 'https://en.wikipedia.org/wiki/Marie_Curie' },
    { title: 'World War II', url: 'https://en.wikipedia.org/wiki/World_War_II' },
  ];

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
            <Search className="h-5 w-5" />
          </div>
          <Input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste a Wikipedia article URL..."
            className="pl-12 pr-4 py-6 text-lg bg-card shadow-card border-2 border-transparent focus:border-secondary transition-colors"
            disabled={isLoading}
          />
        </div>
        
        {error && (
          <p className="text-destructive text-sm flex items-center gap-2">
            <span className="inline-block w-1 h-1 rounded-full bg-destructive" />
            {error}
          </p>
        )}

        {preview && !error && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-4 py-2 rounded-lg">
            <ExternalLink className="h-4 w-4" />
            <span>Article preview:</span>
            <span className="font-medium text-foreground">{preview}</span>
          </div>
        )}

        <Button 
          type="submit" 
          disabled={isLoading || !url} 
          className="w-full py-6 text-lg font-semibold bg-gradient-hero hover:opacity-90 transition-opacity"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Generating Quiz...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-5 w-5" />
              Generate Quiz
            </>
          )}
        </Button>
      </form>

      <div className="space-y-3">
        <p className="text-sm text-muted-foreground text-center">Try an example:</p>
        <div className="flex flex-wrap justify-center gap-2">
          {exampleUrls.map((example) => (
            <button
              key={example.url}
              onClick={() => setUrl(example.url)}
              disabled={isLoading}
              className="px-4 py-2 text-sm bg-card border border-border rounded-full hover:bg-muted hover:border-secondary transition-colors disabled:opacity-50"
            >
              {example.title}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}