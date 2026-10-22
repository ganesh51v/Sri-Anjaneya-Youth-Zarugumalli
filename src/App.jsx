import { useState, useEffect, useRef, Component, lazy, Suspense } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { LanguageProvider } from "./context/LanguageContext";
import { ThemeProvider } from "./context/ThemeContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import UniverseBackground from "./components/UniverseBackground";
import { WifiOff, Wifi } from "lucide-react";

// ScrollToTop: Smoothly resets viewport to top or target hash on every route change
function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const el = document.querySelector(hash);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
        return;
      }
    }
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname, hash]);

  return null;
}

// Lightweight, zero-layout-shift branded fallback during route transitions
function PageLoadingFallback() {
  return (
    <div
      className="flex-1 flex flex-col items-center justify-center min-h-[60vh] py-16 animate-fade-in"
      role="status"
      aria-label="Loading page content"
    >
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 border-4 border-saffron-500/20 rounded-full" />
        <div className="absolute inset-0 border-4 border-t-saffron-500 border-r-gold-500 rounded-full animate-spin" />
      </div>
      <p className="mt-4 text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] animate-pulse">
        Jai Hanuman...
      </p>
    </div>
  );
}

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

// Lazy-loaded Components & Pages
import ChatbotWidget from "./components/chatbot/ChatbotWidget";

const Landing = lazy(() => import("./pages/Landing"));
const SignIn = lazy(() => import("./pages/SignIn"));
const SignUp = lazy(() => import("./pages/SignUp"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Members = lazy(() => import("./pages/Members"));
const Events = lazy(() => import("./pages/Events"));
const Gallery = lazy(() => import("./pages/Gallery"));
const Announcements = lazy(() => import("./pages/Announcements"));
const Profile = lazy(() => import("./pages/Profile"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const Donate = lazy(() => import("./pages/Donate"));
const Expenditure = lazy(() => import("./pages/Expenditure"));
const NotFound = lazy(() => import("./pages/NotFound"));

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

// HomeRoute: Renders Dashboard if user is authenticated; renders Landing before login
function HomeRoute() {
  const { user, loading } = useAuth();
  if (loading) {
    return <PageLoadingFallback />;
  }
  return user ? <Dashboard /> : <Landing />;
}

function App() {
  return (
    <Router>
      <ScrollToTop />
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
                <Suspense fallback={<PageLoadingFallback />}>
                  <Routes>
                    {/* Root Route: Shows Landing before login, Dashboard when authenticated */}
                    <Route path="/" element={<HomeRoute />} />

                  {/* Public Routes */}
                  <Route path="/landing" element={<Landing />} />
                  <Route path="/welcome" element={<Landing />} />
                  <Route path="/signin" element={<SignIn />} />
                  <Route path="/signup" element={<SignUp />} />

                  {/* Explicit Dashboard Protected Route */}
                  <Route
                    path="/dashboard"
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
                </Suspense>
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
