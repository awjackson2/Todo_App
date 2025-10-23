import { useState } from 'react';
import { Button, Modal, Row, Col, ToggleButton, ToggleButtonGroup } from 'react-bootstrap';
import { useTheme } from '../hooks/useTheme';

type Props = {
  currentLevel: number;
};

export default function ThemeSelector({ currentLevel }: Props) {
  const [showModal, setShowModal] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState('');
  
  const { 
    currentTheme, 
    currentThemeId, 
    isDarkMode, 
    changeTheme, 
    toggleDarkMode, 
    getAvailableThemes, 
    getLockedThemes 
  } = useTheme();

  const availableThemes = getAvailableThemes(currentLevel);
  const lockedThemes = getLockedThemes(currentLevel);

  const handleThemeSelect = (themeId: string) => {
    setSelectedTheme(themeId);
  };

  const handleClose = () => {
    setShowModal(false);
    setSelectedTheme('');
  };

  const handleSave = () => {
    if (selectedTheme) {
      changeTheme(selectedTheme);
    }
    setShowModal(false);
    setSelectedTheme('');
  };

  return (
    <>
      <Button
        variant="outline-secondary"
        size="sm"
        onClick={() => setShowModal(true)}
        title="Change theme"
        className="d-flex align-items-center justify-content-center"
        style={{ width: '36px', height: '36px', padding: 0 }}
      >
        🎨
      </Button>

      <Modal show={showModal} onHide={handleClose} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Theme Selector</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* Dark Mode Toggle */}
          <div className="mb-4">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <h6 className="mb-1">Dark Mode</h6>
                <small className="text-muted">Toggle between light and dark appearance</small>
              </div>
              <ToggleButtonGroup type="checkbox" value={isDarkMode ? ['dark'] : []}>
                <ToggleButton 
                  id="dark-mode-toggle" 
                  value="dark" 
                  variant={isDarkMode ? 'outline-primary' : 'outline-secondary'}
                  onClick={toggleDarkMode}
                  style={{
                    backgroundColor: isDarkMode ? 'var(--color-bg-secondary)' : 'transparent',
                    borderColor: isDarkMode ? 'var(--color-primary)' : 'var(--color-border)',
                    color: isDarkMode ? 'var(--color-text-primary)' : 'var(--color-text-secondary)'
                  }}
                >
                  {isDarkMode ? '🌙' : '☀️'} {isDarkMode ? 'Dark' : 'Light'}
                </ToggleButton>
              </ToggleButtonGroup>
            </div>
          </div>

          <div className="mb-4">
            <h6>Available Themes (Level {currentLevel})</h6>
            <Row className="g-3">
              {availableThemes.map(theme => (
                <Col md={6} key={theme.id}>
                  <div 
                    className={`theme-card ${selectedTheme === theme.id ? 'selected' : ''} ${currentThemeId === theme.id ? 'current' : ''}`}
                    onClick={() => handleThemeSelect(theme.id)}
                  >
                    <div className="theme-preview" style={{
                      background: `linear-gradient(135deg, ${theme.colors.light.primary}, ${theme.colors.light.accent})`
                    }}>
                      <span className="theme-emoji">{theme.preview}</span>
                      {currentThemeId === theme.id && <div className="current-badge">Current</div>}
                    </div>
                    <div className="theme-info">
                      <h6 className="mb-1">{theme.name}</h6>
                      <p className="mb-0 small text-muted">{theme.description}</p>
                    </div>
                  </div>
                </Col>
              ))}
            </Row>
          </div>

          {lockedThemes.length > 0 && (
            <div>
              <h6>Locked Themes</h6>
              <Row className="g-3">
                {lockedThemes.map(theme => (
                  <Col md={6} key={theme.id}>
                    <div className="theme-card locked">
                      <div className="theme-preview" style={{
                        background: `linear-gradient(135deg, ${theme.colors.light.primary}, ${theme.colors.light.accent})`
                      }}>
                        <span className="theme-emoji">{theme.preview}</span>
                        <div className="lock-overlay">🔒</div>
                      </div>
                      <div className="theme-info">
                        <h6 className="mb-1">{theme.name}</h6>
                        <p className="mb-0 small text-muted">{theme.description}</p>
                        <small className="text-warning">Requires Level {theme.levelRequired}</small>
                      </div>
                    </div>
                  </Col>
                ))}
              </Row>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSave}
            disabled={!selectedTheme || selectedTheme === currentThemeId}
          >
            Apply Theme
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
