import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { WifiOff, Wifi } from 'lucide-react';

// Sticky offline / back-online notification banner
function OfflineBanner() {
  const [online, setOnline] = useState(navigator.onLine);
  const [showBack, setShowBack] = useState(false);

  useEffect(() => {
    const handleOffline = () => { setOnline(false); setShowBack(false); };
    const handleOnline  = () => { setOnline(true);  setShowBack(true); setTimeout(() => setShowBack(false), 3000); };
    window.addEventListener('offline', handleOffline);
    window.addEventListener('online',  handleOnline);
    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online',  handleOnline);
    };
  }, []);

  if (online && !showBack) return null;

  return (
    <div className={`fixed top-0 left-0 right-0 z-[9999] flex items-center justify-center gap-2 py-2 px-4 text-xs font-semibold transition-all duration-500 ${
      online
        ? 'bg-emerald-500 text-white'
        : 'bg-amber-500 text-white'
    }`}>
      {online ? (
        <><Wifi className="w-3.5 h-3.5" /> Back online — syncing data…</>
      ) : (
        <><WifiOff className="w-3.5 h-3.5" /> No internet connection — some features may not work. Cached data is shown.</>
      )}
    </div>
  );
}

// Pages
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard';
import Members from './pages/Members';
import Events from './pages/Events';
import Gallery from './pages/Gallery';
import Announcements from './pages/Announcements';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import Donate from './pages/Donate';
import Expenditure from './pages/Expenditure';

function App() {
  return (
    <Router>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <div className="flex flex-col min-h-screen bg-cream-100/10">
              <div className="bg-blob-container">
                <div className="bg-blob-1" />
                <div className="bg-blob-2" />
              </div>
              <OfflineBanner />
              <Navbar />
          
          <main className="flex-grow flex flex-col">
            <Routes>
              {/* Public Routes */}
              <Route path="/signin" element={<SignIn />} />
              <Route path="/signup" element={<SignUp />} />

              {/* Protected Routes */}
              <Route 
                path="/" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/members" 
                element={
                  <ProtectedRoute>
                    <Members />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/events" 
                element={
                  <ProtectedRoute>
                    <Events />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/gallery" 
                element={
                  <ProtectedRoute>
                    <Gallery />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/announcements" 
                element={
                  <ProtectedRoute>
                    <Announcements />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/donate" 
                element={
                  <ProtectedRoute>
                    <Donate />
                  </ProtectedRoute>
                } 
              />
              
              {/* Admin Dashboard Protected Route */}
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute adminOnly={true}>
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />

              {/* Expenditure Management — all logged-in users can view */}
              <Route 
                path="/expenditure" 
                element={
                  <ProtectedRoute>
                    <Expenditure />
                  </ProtectedRoute>
                } 
              />

              {/* Fallback route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          <Footer />
        </div>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
      <Analytics />
    </Router>
  );
}

export default App;
