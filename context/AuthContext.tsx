import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole, AuthState } from '../types';

interface AuthContextType extends AuthState {
  login: (email: string, role: UserRole) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock Users
const MOCK_USERS: Record<string, User> = {
  'admin@gcc.edu': { id: 'u1', name: 'Dr. Admin', email: 'admin@gcc.edu', role: UserRole.ADMIN },
  'teacher@gcc.edu': { id: 'u2', name: 'Prof. Junaid', email: 'teacher@gcc.edu', role: UserRole.TEACHER },
  'student@gcc.edu': { 
    id: 'u3', 
    name: 'Bilal Khan', 
    email: 'student@gcc.edu', 
    role: UserRole.STUDENT, 
    studentDetails: { rollNo: 'BS-2023-045', classId: 'c1', section: 'A' } 
  },
};

export const AuthProvider = ({ children }: React.PropsWithChildren<{}>) => {
  const [auth, setAuth] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
  });

  useEffect(() => {
    // Check local storage for persisted session
    const storedUser = localStorage.getItem('gcc_user');
    if (storedUser) {
      setAuth({ user: JSON.parse(storedUser), isAuthenticated: true });
    }
  }, []);

  const login = (email: string, role: UserRole) => {
    // Simulating login logic
    const user = Object.values(MOCK_USERS).find(u => u.email === email && u.role === role);
    if (user) {
      setAuth({ user, isAuthenticated: true });
      localStorage.setItem('gcc_user', JSON.stringify(user));
    } else {
      // Fallback for demo if exact email not typed, just create a mock based on role
      const mockUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        name: role === UserRole.ADMIN ? 'Administrator' : role === UserRole.TEACHER ? 'Demo Teacher' : 'Demo Student',
        email,
        role,
        ...(role === UserRole.STUDENT ? { studentDetails: { rollNo: 'DEMO-123', classId: 'c1', section: 'A' } } : {})
      };
      setAuth({ user: mockUser, isAuthenticated: true });
      localStorage.setItem('gcc_user', JSON.stringify(mockUser));
    }
  };

  const logout = () => {
    setAuth({ user: null, isAuthenticated: false });
    localStorage.removeItem('gcc_user');
  };

  return (
    <AuthContext.Provider value={{ ...auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};