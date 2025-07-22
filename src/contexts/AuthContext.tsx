import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  userRole: string | null;
  userPhone: string | null;
  login: (token: string, role: string, phone: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userPhone, setUserPhone] = useState<string | null>(null);

  useEffect(() => {
    // Check for existing authentication on mount
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('userRole');
    const phone = localStorage.getItem('userPhone');
    
    if (token && role && phone) {
      setIsAuthenticated(true);
      setUserRole(role);
      setUserPhone(phone);
    }
  }, []);

  const login = useCallback((token: string, role: string, phone: string) => {
    localStorage.setItem('token', token);
    localStorage.setItem('userRole', role);
    localStorage.setItem('userPhone', phone);
    setIsAuthenticated(true);
    setUserRole(role);
    setUserPhone(phone);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userPhone');
    setIsAuthenticated(false);
    setUserRole(null);
    setUserPhone(null);
  }, []);

  const value: AuthContextType = {
    isAuthenticated,
    userRole,
    userPhone,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;