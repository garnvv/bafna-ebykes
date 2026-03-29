import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Layout
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Public Pages
import Home from './pages/public/Home';
import Bikes from './pages/public/Bikes';
import BikeDetail from './pages/public/BikeDetail';
import About from './pages/public/About';
import Contact from './pages/public/Contact';
import Compare from './pages/public/Compare';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';

// Dashboards
import Dashboard from './pages/customer/Dashboard';
import AdminDashboard from './pages/admin/Dashboard';

// Full-screen spinner shown while auth check is in progress
const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#f5f5f7]">
    <div className="flex flex-col items-center space-y-4">
      <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      <p className="text-gray-500 text-sm font-bold uppercase tracking-widest">Authenticating...</p>
    </div>
  </div>
);

// Redirects logged-in users away from /login, /register
const PublicOnlyRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (user) {
    // Replace so back button can't return to login
    return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />;
  }
  return children;
};

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/bikes" element={<Bikes />} />
              <Route path="/bikes/:id" element={<BikeDetail />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/feedback" element={<Contact />} />
              <Route path="/compare" element={<Compare />} />

              {/* Auth Routes — guarded: logged-in users get redirected away */}
              <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
              <Route path="/register" element={<PublicOnlyRoute><Register /></PublicOnlyRoute>} />
              <Route path="/forgot-password" element={<PublicOnlyRoute><ForgotPassword /></PublicOnlyRoute>} />

              {/* Protected Routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/admin/*" element={
                <ProtectedRoute adminOnly={true}>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
