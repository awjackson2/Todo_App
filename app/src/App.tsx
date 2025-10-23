import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TodoPage from './pages/TodoPage';
import TimelinePage from './pages/TimelinePage';
import HallOfQuotesPage from './pages/HallOfQuotesPage';

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

export default function App() {
  return <AppRouter />;
}


