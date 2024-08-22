import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import SignupPage from './components/signup';
import LoginPage from './components/login';
import MainPage from './components/MainPage';
import ReportsPage from './components/Reports';
import IncomeReport from './components/IncomeReport';
import ExpenseReport from './components/ExpenseReport';
import InventoryReport from './components/InventoryReport';
import Dashboard from './components/Dashboard';
import { auth } from './fb/firebase.js';
import './App.css';

const AppRouter = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
      }
    });

    return unsubscribe;
  }, []);

  const handleReportSelection = (reportType) => {
    setSelectedReport(reportType);
  };

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/mainpage" element={currentUser ? <MainPage /> : <Navigate to="/login" state={{ from: location }} replace />} />
      <Route path="/reports" element={currentUser ? <ReportsPage onReportSelect={handleReportSelection} /> : <Navigate to="/login" state={{ from: location }} replace />} />
      <Route path="/income-report" element={selectedReport === 'income' ? <IncomeReport /> : <Navigate to="/reports" replace />} />
      <Route path="/expense-report" element={selectedReport === 'expense' ? <ExpenseReport /> : <Navigate to="/reports" replace />} />
      <Route path="/inventory-report" element={selectedReport === 'inventory' ? <InventoryReport /> : <Navigate to="/reports" replace />} />
      <Route path="/dashboard" element={currentUser ? <Dashboard /> : <Navigate to="/login" state={{ from: location }} replace />} />
      <Route path="/" element={<Navigate to={currentUser ? '/mainpage' : '/signup'} replace />} />
    </Routes>
  );
};

function App() {
  return (
    <Router>
      <AppRouter />
    </Router>
  );
}

export default App;