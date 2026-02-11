import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TodoPage from './pages/TodoPage';
import TimelinePage from './pages/TimelinePage';
import HallOfQuotesPage from './pages/HallOfQuotesPage';
import { useAuthInit } from './hooks/useAuthInit';

function AppRouter() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<TodoPage />} />
        <Route path="/timeline" element={<TimelinePage />} />
        <Route path="/quotes" element={<HallOfQuotesPage />} />
      </Routes>
    </Router>
  );
}

function AuthInitializer() {
  const { isReady } = useAuthInit();

  if (!isReady) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#f5f5f5'
      }}>
        <div style={{ fontSize: '1.2rem', color: '#333' }}>
          Initializing...
        </div>
      </div>
    );
  }

  return <AppRouter />;
}

export default function App() {
  return <AuthInitializer />;
}


