import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/auth/Login';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Subscriptions from './pages/Subscriptions';
import Gambling from './pages/Gambling';
import Travel from './pages/Travel';
import Accounts from './pages/Accounts';
import Goals from './pages/Goals';
import Budget from './pages/Budget';
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
        <Route path="/travel" element={<Travel />} />
        <Route path="/accounts" element={<Accounts />} />
        <Route path="/goals" element={<Goals />} />
        <Route path="/budget" element={<Budget />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;