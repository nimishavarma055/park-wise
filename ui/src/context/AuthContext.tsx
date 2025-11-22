import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { logout as logoutAction, setCredentials } from '../store/slices/authSlice';
import { useLoginMutation, useSignupMutation } from '../store/api/authApi';
import type { User } from '../store/api/authApi';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, phone: string, password: string, role?: 'user' | 'owner' | 'admin') => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const [loginMutation] = useLoginMutation();
  const [signupMutation] = useSignupMutation();

  const login = async (email: string, password: string) => {
    try {
      const result = await loginMutation({ email, password }).unwrap();
      dispatch(setCredentials({ user: result.user, token: result.accessToken }));
    } catch (error: any) {
      throw new Error(error?.data?.message || 'Login failed');
    }
  };

  const signup = async (
    name: string,
    email: string,
    phone: string,
    password: string,
    role: 'user' | 'owner' | 'admin' = 'user'
  ) => {
    try {
      const result = await signupMutation({ name, email, phone, password, role }).unwrap();
      dispatch(setCredentials({ user: result.user, token: result.accessToken }));
    } catch (error: any) {
      throw new Error(error?.data?.message || 'Signup failed');
    }
  };

  const logout = () => {
    dispatch(logoutAction());
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        signup,
        logout,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

