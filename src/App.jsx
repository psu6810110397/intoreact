import './App.css'
import axios from 'axios'
import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Spin } from 'antd';

// คอมโพเนนต์ต่างๆ (ต้องมั่นใจว่ามีไฟล์ Dashboard.js อยู่ที่ระดับเดียวกับ App.js)
import LoginScreen from './LoginScreen';
import BookScreen from './BookScreen';
import Dashboard from './Dashboard'; 

axios.defaults.baseURL = "http://localhost:3000"

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // ตรวจสอบ Token เมื่อแอปฯ โหลด (ฟังก์ชัน Remember Me)
  useEffect(() => {
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setIsAuthenticated(true);
    }
    
    setIsLoading(false); 
  }, []);

  // ฟังก์ชันล็อกอินสำเร็จ: รับ Token และสถานะ remember
  const handleLoginSuccess = (token, remember) => {
    if (remember) {
      localStorage.setItem('authToken', token); 
    } else {
      sessionStorage.setItem('authToken', token); 
    }
    
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setIsAuthenticated(true);
  };
  
  // ฟังก์ชัน Logout
  const handleLogout = () => {
    localStorage.removeItem('authToken');
    sessionStorage.removeItem('authToken');
    delete axios.defaults.headers.common['Authorization'];
    setIsAuthenticated(false);
  };

  // คอมโพเนนต์ ProtectedRoute
  const ProtectedRoute = ({ children }) => {
    if (isLoading) {
      return <div><Spin tip="Loading application..." /></div>;
    }
    
    if (!isAuthenticated) {
      return <Navigate to="/login" replace />; 
    }
    return children;
  };
  
  if (isLoading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><Spin size="large" tip="Loading application..." /></div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/login" 
          element={
            isAuthenticated ? (
              <Navigate to="/" replace />
            ) : (
              <LoginScreen onLoginSuccess={handleLoginSuccess} />
            )
          } 
        />

        <Route path="/" element={<ProtectedRoute><BookScreen onLogout={handleLogout} /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard onLogout={handleLogout} /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;