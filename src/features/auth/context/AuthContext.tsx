import { createContext, useState, useEffect, useCallback, FC, ReactNode } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider,
  signInAnonymously,
  signOut,
  User as FirebaseUser,
} from 'firebase/auth';
import { auth } from '@/services/firebase';
import type { AuthUser, LoginCredentials, RegisterCredentials } from '../types';

export interface AuthContextType {
  readonly user: AuthUser | null;
  readonly isAuthenticated: boolean;
  readonly loading: boolean;
  readonly error: string | null;
  readonly loginWithEmail: (credentials: LoginCredentials) => Promise<void>;
  readonly registerWithEmail: (credentials: RegisterCredentials) => Promise<void>;
  readonly loginWithGoogle: () => Promise<void>;
  readonly loginAsGuest: () => Promise<void>;
  readonly logout: () => Promise<void>;
  readonly clearError: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

function mapFirebaseUser(user: FirebaseUser): AuthUser {
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName || (user.isAnonymous ? 'Visitante' : null),
    photoURL: user.photoURL,
    isAnonymous: user.isAnonymous,
  };
}

function parseAuthErrorMessage(errorCode: string): string {
  switch (errorCode) {
    case 'auth/invalid-credential':
    case 'auth/user-not-found':
    case 'auth/wrong-password':
      return 'E-mail ou senha inválidos.';
    case 'auth/email-already-in-use':
      return 'Este endereço de e-mail já está em uso.';
    case 'auth/weak-password':
      return 'A senha deve ter pelo menos 6 caracteres.';
    case 'auth/invalid-email':
      return 'Formato de e-mail inválido.';
    case 'auth/popup-closed-by-user':
      return 'O login com Google foi cancelado.';
    case 'auth/popup-blocked':
      return 'O navegador bloqueou a janela de autenticação.';
    case 'auth/operation-not-allowed':
      return 'Método de autenticação não habilitado.';
    default:
      return 'Ocorreu um erro ao processar a autenticação. Tente novamente.';
  }
}

export const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(mapFirebaseUser(firebaseUser));
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const loginWithEmail = useCallback(async ({ email, password }: LoginCredentials) => {
    setError(null);
    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      setUser(mapFirebaseUser(cred.user));
    } catch (err: unknown) {
      const code = typeof err === 'object' && err !== null && 'code' in err ? String(err.code) : '';
      setError(parseAuthErrorMessage(code));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const registerWithEmail = useCallback(async ({ email, password, displayName }: RegisterCredentials) => {
    setError(null);
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      if (displayName) {
        await updateProfile(cred.user, { displayName });
      }
      setUser(mapFirebaseUser(cred.user));
    } catch (err: unknown) {
      const code = typeof err === 'object' && err !== null && 'code' in err ? String(err.code) : '';
      setError(parseAuthErrorMessage(code));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const loginWithGoogle = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const cred = await signInWithPopup(auth, provider);
      setUser(mapFirebaseUser(cred.user));
    } catch (err: unknown) {
      const code = typeof err === 'object' && err !== null && 'code' in err ? String(err.code) : '';
      setError(parseAuthErrorMessage(code));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const loginAsGuest = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const cred = await signInAnonymously(auth);
      setUser(mapFirebaseUser(cred.user));
    } catch (err: unknown) {
      const code = typeof err === 'object' && err !== null && 'code' in err ? String(err.code) : '';
      if (code === 'auth/operation-not-allowed' || code === 'auth/admin-restricted-operation') {
        // Fallback resiliente: permite testar a experiência de visitante mesmo antes da ativação do switch no Console
        setUser({
          uid: 'guest-' + Date.now(),
          email: null,
          displayName: 'Visitante',
          photoURL: null,
          isAnonymous: true,
        });
        return;
      }
      setError(parseAuthErrorMessage(code));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setError(null);
    try {
      await signOut(auth);
      setUser(null);
    } catch (err: unknown) {
      setError('Falha ao desconectar.');
      throw err;
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: user !== null,
        loading,
        error,
        loginWithEmail,
        registerWithEmail,
        loginWithGoogle,
        loginAsGuest,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
