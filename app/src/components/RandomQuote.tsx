import { useState, useEffect } from 'react';
import { Button } from 'react-bootstrap';
import { addPinnedQuote, getPinnedQuotes } from '../storage';

interface CurrentQuote {
  text: string;
  author: string;
}

export default function RandomQuote() {
  const [currentQuote, setCurrentQuote] = useState<CurrentQuote>({
    text: "Loading inspiration...",
    author: "Please wait"
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPinned, setIsPinned] = useState(false);
  const [isPinning, setIsPinning] = useState(false);

  const fetchQuote = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Try API Ninjas quotes API first, then fallback to local quotes
      try {
        console.log('Trying API Ninjas quotes API...');
        const response = await fetch('https://api.api-ninjas.com/v1/quotes', {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'X-Api-Key': import.meta.env.VITE_X_API_KEY, 
          },
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();
        console.log('API Ninjas Response:', data);
        
        if (data && data.length > 0 && data[0].quote && data[0].author) {
          setCurrentQuote({
            text: data[0].quote,
            author: data[0].author
          });
          console.log('Successfully loaded API quote:', data[0].quote, 'by', data[0].author);
          return; // Success, exit the function
        } else {
          throw new Error('Unexpected API response format');
        }
        
      } catch (apiError) {
        console.error('API Ninjas failed:', apiError);
        // Fall back to local quotes
        throw apiError;
      }
      
    } catch (err) {
      console.error('API failed:', err);
      setError('Failed to load quote');
      // No fallback quotes - just show error state
      setCurrentQuote({
        text: "Unable to load quote",
        author: "System"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const checkIfPinned = async (quote: CurrentQuote) => {
    try {
      const pinnedQuotes = await getPinnedQuotes();
      const exists = pinnedQuotes.some(q => 
        q.text === quote.text && q.author === quote.author
      );
      setIsPinned(exists);
    } catch (error) {
      console.error('Error checking if quote is pinned:', error);
    }
  };

  const handlePinQuote = async () => {
    if (isPinning || isPinned || isLoading || error) return;
    
    try {
      setIsPinning(true);
      await addPinnedQuote({
        text: currentQuote.text,
        author: currentQuote.author
      });
      setIsPinned(true);
    } catch (error) {
      console.error('Error pinning quote:', error);
    } finally {
      setIsPinning(false);
    }
  };

  useEffect(() => {
    fetchQuote();
  }, []); // Empty dependency array ensures it runs on every mount/refresh

  useEffect(() => {
    if (currentQuote.text && currentQuote.author && !isLoading && !error) {
      checkIfPinned(currentQuote);
    }
  }, [currentQuote, isLoading, error]);

  return (
    <div className="random-quote mt-3 p-3 border-top">
      <div className="d-flex justify-content-between align-items-start mb-2">
        <blockquote className="mb-0 flex-grow-1">
          <p className="mb-1" style={{ fontSize: '0.75rem', lineHeight: '1.2' }}>
            {isLoading ? (
              <span className="text-muted">Loading inspiration...</span>
            ) : error ? (
              <span className="text-warning">"{currentQuote.text}"</span>
            ) : (
              <span className="text-muted fst-italic">"{currentQuote.text}"</span>
            )}
          </p>
          <footer className="blockquote-footer small">
            <cite title="Source Title">
              {isLoading ? "Please wait" : currentQuote.author}
            </cite>
          </footer>
        </blockquote>
        {!isLoading && !error && (
          <Button
            variant={isPinned ? "success" : "outline-primary"}
            size="sm"
            onClick={handlePinQuote}
            disabled={isPinning || isPinned}
            className="ms-2 flex-shrink-0"
            style={{ fontSize: '0.7rem', padding: '0.25rem 0.5rem' }}
          >
            {isPinning ? (
              <span>📌</span>
            ) : isPinned ? (
              <span>📌</span>
            ) : (
              <span>📌</span>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
