import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext();

const TOKEN_KEY = 'bafna_token';
const USER_KEY = 'bafna_user';

// ── Strict History Navigation Cleanup ───────────────────────────────────────
// 1. Detect if the user arrived via the browser's Back or Forward buttons.
// Since this is a React SPA, internal routing does not trigger full page loads.
// So if this script executes with 'back_forward' type, it guarantees they 
// returned from an external site (like Google's new tab page).
try {
  const navEntries = performance.getEntriesByType('navigation');
  if (navEntries.length > 0 && navEntries[0].type === 'back_forward') {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
  }
} catch (e) {
  // ignore older browsers
}

// 2. Handle aggressive bfcache restore (when Chrome instantly restores the page)
window.addEventListener('pageshow', (e) => {
  if (e.persisted) {
    // Page was restored instantly from browser history, force logout
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
    window.location.reload();
  }
});
// ────────────────────────────────────────────────────────────────────────────

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const cached = sessionStorage.getItem(USER_KEY);
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  // Clean obsolete localStorage from previous versions
  useEffect(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user_cache');
    sessionStorage.removeItem('bafna_left_at');
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      const token = sessionStorage.getItem(TOKEN_KEY);
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const { data } = await api.get('/auth/profile');
        setUser(data);
        sessionStorage.setItem(USER_KEY, JSON.stringify(data));
      } catch (error) {
        const status = error.response?.status;
        if (status === 401 || status === 403) {
          sessionStorage.removeItem(TOKEN_KEY);
          sessionStorage.removeItem(USER_KEY);
          setUser(null);
        }
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    sessionStorage.setItem(TOKEN_KEY, data.token);
    sessionStorage.setItem(USER_KEY, JSON.stringify(data));
    setUser(data);
    return data;
  };

  const register = async (name, email, password, phone) => {
    const { data } = await api.post('/auth/register', { name, email, password, phone });
    sessionStorage.setItem(TOKEN_KEY, data.token);
    sessionStorage.setItem(USER_KEY, JSON.stringify(data));
    setUser(data);
    return data;
  };

  const logout = () => {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
