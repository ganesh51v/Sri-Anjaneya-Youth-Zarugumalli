import { useState, useEffect, useRef, Component } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { LanguageProvider } from "./context/LanguageContext";
import { ThemeProvider } from "./context/ThemeContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import UniverseBackground from "./components/UniverseBackground";
import { WifiOff, Wifi } from "lucide-react";
// Sticky offline / back-online notification banner
function OfflineBanner() {
  const [online, setOnline] = useState(navigator.onLine);
  const [showBack, setShowBack] = useState(false);
  const timerRef = useRef(null);
  useEffect(() => {
    const handleOffline = () => {
      setOnline(false);
      setShowBack(false);
    };
    const handleOnline = () => {
      setOnline(true);
      setShowBack(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setShowBack(false), 3000);
    };
    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);
    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);
  if (online && !showBack) return null;
  return (
    <div
      className={`fixed top-0 left-0 right-0 z-[9999] flex items-center justify-center gap-2 py-2 px-4 text-xs font-semibold transition-all duration-500 ${
        online ? "bg-emerald-500 text-white" : "bg-amber-500 text-white"
      }`}
    >
      {online ? (
        <>
          <Wifi className="w-3.5 h-3.5" /> Back online — syncing data…
        </>
      ) : (
        <>
          <WifiOff className="w-3.5 h-3.5" /> No internet connection — some
          features may not work. Cached data is shown.
        </>
      )}
    </div>
  );
}
// Components
import ChatbotWidget from "./components/chatbot/ChatbotWidget";
// Pages
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Dashboard from "./pages/Dashboard";
import Members from "./pages/Members";
import Events from "./pages/Events";
import Gallery from "./pages/Gallery";
import Announcements from "./pages/Announcements";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/AdminDashboard";
import Donate from "./pages/Donate";
import Expenditure from "./pages/Expenditure";
import NotFound from "./pages/NotFound";

// H6: Top-level error boundary — catches render errors that would otherwise blank the screen
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: "" };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, message: error?.message || "Unknown error" };
  }
  componentDidCatch(error, info) {
    console.error("ErrorBoundary caught:", error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center min-h-screen gap-4 p-8 text-center">
          <h2 className="text-2xl font-black text-slate-800">Something went wrong</h2>
          <p className="text-sm text-slate-500 max-w-md">{this.state.message}</p>
          <button
            onClick={() => this.setState({ hasError: false, message: "" })}
            className="px-4 py-2 bg-saffron-500 text-white rounded-lg font-bold text-sm hover:bg-saffron-600 transition-colors"
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  return (
    <Router>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <ErrorBoundary>
              <div className="app-shell flex flex-col">
              {/* Universe & Solar System Animation Layer */}
              <UniverseBackground />
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
                  {/* 404 Not Found route */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
              <ChatbotWidget />
              <Footer />
            </div>
            </ErrorBoundary>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </Router>
  );
}
export default App;
