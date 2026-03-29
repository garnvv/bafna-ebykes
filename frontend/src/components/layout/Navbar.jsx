import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Menu, X, User, LogOut, ChevronDown, LayoutDashboard } from 'lucide-react';
import Logo from '../common/Logo';

const Navbar = () => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();

  React.useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsOpen(false);
  };

  // NavLink className helper — active only on exact match
  const navClass = ({ isActive }) =>
    `text-sm font-semibold tracking-wide transition-colors px-3 py-2 ${
      isActive ? 'text-primary' : 'text-[#1d1d1f] hover:text-primary'
    }`;

  const dashboardPath = user?.role === 'admin' ? '/admin' : '/dashboard';

  return (
    <nav className={`fixed w-full z-[100] transition-all duration-500 ${isScrolled ? 'bg-white/90 backdrop-blur-xl border-b border-gray-200 shadow-sm' : 'bg-transparent py-2'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <Logo iconSize={42} className="hover:opacity-90 hover:scale-105 transition-all" />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-1">
            <NavLink to="/" end className={navClass}>Home</NavLink>
            <NavLink to="/bikes" className={navClass}>E-Bikes</NavLink>
            <NavLink to="/about" className={navClass}>About</NavLink>
            <NavLink to="/contact" className={navClass}>Contact</NavLink>

            {user && (
              <NavLink
                to={dashboardPath}
                className={({ isActive }) =>
                  `text-sm font-semibold tracking-wide transition-colors px-3 py-2 flex items-center space-x-1 ${
                    isActive ? 'text-primary' : 'text-[#1d1d1f] hover:text-primary'
                  }`
                }
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </NavLink>
            )}

            {user ? (
              <div className="relative group ml-2">
                <button className="flex items-center space-x-2 bg-white px-4 py-2.5 rounded-full border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all font-semibold text-sm text-[#1d1d1f]">
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                  <span className="max-w-[100px] truncate">{user.name.split(' ')[0]}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                </button>
                <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-100 rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Signed in as</p>
                    <p className="text-sm font-bold text-[#1d1d1f] truncate mt-0.5">{user.name}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-3 hover:bg-red-50 flex items-center space-x-2 text-red-500 font-semibold text-sm transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            ) : (
              <Link to="/login" className="btn-primary ml-2">Login</Link>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-[#1d1d1f] hover:text-primary p-2 transition-colors"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-b border-gray-200 shadow-lg">
          <div className="px-4 pt-3 pb-6 space-y-1">
            <NavLink to="/" end onClick={() => setIsOpen(false)}
              className={({ isActive }) => `block px-4 py-3 rounded-xl font-semibold transition-colors ${isActive ? 'bg-primary/10 text-primary' : 'text-[#1d1d1f] hover:bg-gray-50'}`}>
              Home
            </NavLink>
            <NavLink to="/bikes" onClick={() => setIsOpen(false)}
              className={({ isActive }) => `block px-4 py-3 rounded-xl font-semibold transition-colors ${isActive ? 'bg-primary/10 text-primary' : 'text-[#1d1d1f] hover:bg-gray-50'}`}>
              E-Bikes
            </NavLink>
            <NavLink to="/about" onClick={() => setIsOpen(false)}
              className={({ isActive }) => `block px-4 py-3 rounded-xl font-semibold transition-colors ${isActive ? 'bg-primary/10 text-primary' : 'text-[#1d1d1f] hover:bg-gray-50'}`}>
              About
            </NavLink>
            <NavLink to="/contact" onClick={() => setIsOpen(false)}
              className={({ isActive }) => `block px-4 py-3 rounded-xl font-semibold transition-colors ${isActive ? 'bg-primary/10 text-primary' : 'text-[#1d1d1f] hover:bg-gray-50'}`}>
              Contact
            </NavLink>
            {user ? (
              <>
                <NavLink to={dashboardPath} onClick={() => setIsOpen(false)}
                  className={({ isActive }) => `block px-4 py-3 rounded-xl font-semibold transition-colors ${isActive ? 'bg-primary/10 text-primary' : 'text-[#1d1d1f] hover:bg-gray-50'}`}>
                  Dashboard
                </NavLink>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 text-red-500 font-semibold hover:bg-red-50 rounded-xl transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                onClick={() => setIsOpen(false)}
                className="block px-4 py-3 text-white bg-primary text-center font-bold rounded-xl mt-4"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
