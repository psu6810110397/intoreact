import './App.css'
import axios from 'axios'
import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Spin } from 'antd';
import LoginScreen from './LoginScreen';
import BookScreen from './BookScreen';
import Dashboard from './Dashboard'; 

axios.defaults.baseURL = "http://localhost:3000"

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setIsAuthenticated(true);
    }
    setIsLoading(false); 
  }, []);

  const handleLoginSuccess = (token, remember) => {
    if (remember) {
      localStorage.setItem('authToken', token); 
    } else {
      sessionStorage.setItem('authToken', token); 
    }
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setIsAuthenticated(true);
  };
  
  const handleLogout = () => {
    localStorage.removeItem('authToken');
    sessionStorage.removeItem('authToken');
    delete axios.defaults.headers.common['Authorization'];
    setIsAuthenticated(false);
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" tip="Loading..." />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/login" 
          element={isAuthenticated ? <Navigate to="/" replace /> : <LoginScreen onLoginSuccess={handleLoginSuccess} />} 
        />
        <Route 
          path="/" 
          element={isAuthenticated ? <BookScreen onLogout={handleLogout} /> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/dashboard" 
          element={isAuthenticated ? <Dashboard onLogout={handleLogout} /> : <Navigate to="/login" replace />} 
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;