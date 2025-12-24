import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/auth/Login';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Subscriptions from './pages/Subscriptions';
import Gambling from './pages/Gambling';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/subscriptions" element={<Subscriptions />} />
        <Route path="/gambling" element={<Gambling />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;