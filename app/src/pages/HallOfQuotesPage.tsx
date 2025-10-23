import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Modal, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { getPinnedQuotes, removePinnedQuote } from '../storage';
import type { Quote } from '../types';

export default function HallOfQuotesPage() {
  const navigate = useNavigate();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [removingQuote, setRemovingQuote] = useState<string | null>(null);

  useEffect(() => {
    loadQuotes();
  }, []);

  const loadQuotes = async () => {
    try {
      setLoading(true);
      const pinnedQuotes = await getPinnedQuotes();
      setQuotes(pinnedQuotes);
    } catch (error) {
      console.error('Error loading quotes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuoteClick = (quote: Quote) => {
    setSelectedQuote(quote);
    setShowModal(true);
  };

  const handleRemoveQuote = async (quoteId: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent modal from opening
    if (removingQuote) return;
    
    try {
      setRemovingQuote(quoteId);
      await removePinnedQuote(quoteId);
      setQuotes(quotes.filter(q => q.id !== quoteId));
    } catch (error) {
      console.error('Error removing quote:', error);
    } finally {
      setRemovingQuote(null);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <Container fluid className="my-4">
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <div className="mt-3 text-muted">Loading your pinned quotes...</div>
        </div>
      </Container>
    );
  }

  return (
    <>
      <Container fluid className="my-4">
        <Row className="mb-4">
          <Col>
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <h1 className="mb-1">Hall of Quotes</h1>
                <p className="text-muted mb-0">
                  Your collection of inspiring quotes
                  {quotes.length > 0 && (
                    <span className="ms-2 badge bg-primary">{quotes.length}</span>
                  )}
                </p>
              </div>
              <Button 
                variant="outline-secondary" 
                onClick={() => navigate('/')}
                className="d-flex align-items-center gap-2"
              >
                <span>←</span> Back to Tasks
              </Button>
            </div>
          </Col>
        </Row>

        {quotes.length === 0 ? (
          <Row>
            <Col>
              <Card className="text-center py-5">
                <Card.Body>
                  <div className="text-muted mb-3" style={{ fontSize: '3rem' }}>📌</div>
                  <h4 className="text-muted mb-2">No Pinned Quotes Yet</h4>
                  <p className="text-muted mb-4">
                    Start pinning inspiring quotes from the random quote section to build your collection!
                  </p>
                  <Button 
                    variant="primary" 
                    onClick={() => navigate('/')}
                    className="d-flex align-items-center gap-2 mx-auto"
                  >
                    <span>←</span> Go to Tasks
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        ) : (
          <Row xs={1} sm={2} lg={3} xl={4} className="g-4">
            {quotes.map((quote) => (
              <Col key={quote.id}>
                <Card 
                  className="h-100 quote-card clickable-card"
                  onClick={() => handleQuoteClick(quote)}
                  style={{ cursor: 'pointer' }}
                >
                  <Card.Body className="d-flex flex-column">
                    <div className="flex-grow-1">
                      <blockquote className="mb-3">
                        <p className="mb-2 fst-italic" style={{ fontSize: '0.9rem', lineHeight: '1.4' }}>
                          "{quote.text}"
                        </p>
                        <footer className="blockquote-footer">
                          <cite title="Source Title" className="text-muted">
                            {quote.author}
                          </cite>
                        </footer>
                      </blockquote>
                    </div>
                    <div className="d-flex justify-content-between align-items-center mt-auto">
                      <small className="text-muted">
                        Pinned {formatDate(quote.pinnedAt)}
                      </small>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={(e) => handleRemoveQuote(quote.id, e)}
                        disabled={removingQuote === quote.id}
                        className="flex-shrink-0"
                        style={{ fontSize: '0.7rem', padding: '0.25rem 0.5rem' }}
                      >
                        {removingQuote === quote.id ? (
                          <Spinner size="sm" animation="border" />
                        ) : (
                          '🗑️'
                        )}
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Container>

      {/* Fullscreen Quote Modal */}
      <Modal 
        show={showModal} 
        onHide={() => setShowModal(false)}
        centered
        size="lg"
        className="quote-modal"
      >
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="text-muted small">
            {selectedQuote && formatDate(selectedQuote.pinnedAt)}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center py-5">
          {selectedQuote && (
            <>
              <blockquote className="mb-4">
                <p 
                  className="mb-4 fst-italic" 
                  style={{ 
                    fontSize: '1.5rem', 
                    lineHeight: '1.6',
                    color: 'var(--color-text-primary)'
                  }}
                >
                  "{selectedQuote.text}"
                </p>
                <footer className="blockquote-footer">
                  <cite 
                    title="Source Title" 
                    style={{ 
                      fontSize: '1.1rem',
                      color: 'var(--color-text-secondary)'
                    }}
                  >
                    — {selectedQuote.author}
                  </cite>
                </footer>
              </blockquote>
              <div className="d-flex gap-3 justify-content-center">
                <Button
                  variant="outline-danger"
                  onClick={() => {
                    if (selectedQuote) {
                      handleRemoveQuote(selectedQuote.id, {} as React.MouseEvent);
                      setShowModal(false);
                    }
                  }}
                  disabled={removingQuote === selectedQuote?.id}
                >
                  {removingQuote === selectedQuote?.id ? (
                    <>
                      <Spinner size="sm" animation="border" className="me-2" />
                      Removing...
                    </>
                  ) : (
                    <>
                      🗑️ Remove from Collection
                    </>
                  )}
                </Button>
                <Button
                  variant="outline-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Close
                </Button>
              </div>
            </>
          )}
        </Modal.Body>
      </Modal>
    </>
  );
}
