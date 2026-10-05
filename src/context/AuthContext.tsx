import React, { createContext, useContext, useState, useEffect } from 'react';
import { StudentUser, AdminUser } from '../types';
import { api, setStudentToken, setAdminToken, getStudentToken, getAdminToken } from '../services/api';

interface AuthContextType {
  student: StudentUser | null;
  admin: AdminUser | null;
  isStudentLoading: boolean;
  loginStudent: (data: { email: string; password: string }) => Promise<void>;
  registerStudent: (data: any) => Promise<void>;
  logoutStudent: () => void;
  loginAdmin: (data: { email: string; password: string }) => Promise<void>;
  logoutAdmin: () => void;
  refreshStudentProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [student, setStudent] = useState<StudentUser | null>(null);
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [isStudentLoading, setIsStudentLoading] = useState(true);

  // Initialize from saved tokens
  useEffect(() => {
    async function initAuth() {
      setIsStudentLoading(true);
      const studentToken = getStudentToken();
      if (studentToken) {
        try {
          const res = await api.studentProfile();
          if (res?.user) {
            setStudent(res.user);
          }
        } catch (err) {
          console.warn('Student token expired or invalid:', err);
          setStudentToken(null);
          setStudent(null);
        }
      }

      const adminToken = getAdminToken();
      if (adminToken) {
        try {
          const res = await api.adminProfile();
          if (res?.admin) {
            setAdmin(res.admin);
          }
        } catch (err) {
          console.warn('Admin token expired or invalid:', err);
          setAdminToken(null);
          setAdmin(null);
        }
      }

      setIsStudentLoading(false);
    }

    initAuth();
  }, []);

  const loginStudent = async (data: { email: string; password: string }) => {
    const res = await api.studentLogin(data);
    setStudentToken(res.token);
    setStudent(res.user);
  };

  const registerStudent = async (data: any) => {
    const res = await api.studentRegister(data);
    setStudentToken(res.token);
    setStudent(res.user);
  };

  const logoutStudent = () => {
    setStudentToken(null);
    setStudent(null);
  };

  const loginAdmin = async (data: { email: string; password: string }) => {
    const res = await api.adminLogin(data);
    setAdminToken(res.token);
    setAdmin(res.admin);
  };

  const logoutAdmin = () => {
    setAdminToken(null);
    setAdmin(null);
  };

  const refreshStudentProfile = async () => {
    try {
      const res = await api.studentProfile();
      if (res?.user) setStudent(res.user);
    } catch (err) {
      console.error('Failed to refresh profile:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        student,
        admin,
        isStudentLoading,
        loginStudent,
        registerStudent,
        logoutStudent,
        loginAdmin,
        logoutAdmin,
        refreshStudentProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
