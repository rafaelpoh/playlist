import { FC, memo, useState, useEffect, FormEvent, MouseEvent } from 'react';
import { X, Mail, Lock, User as UserIcon, AlertCircle, LogIn, UserCheck } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import styles from './AuthModal.module.css';

export interface AuthModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly initialPrompt?: string;
}

type AuthMode = 'login' | 'register';

export const AuthModal: FC<AuthModalProps> = memo(({
  isOpen,
  onClose,
  initialPrompt,
}) => {
  const {
    loginWithEmail,
    registerWithEmail,
    loginWithGoogle,
    loginAsGuest,
    error,
    clearError,
  } = useAuth();

  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [displayName, setDisplayName] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Escuta tecla Escape e trava o scroll
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Limpa erros ao alternar abas ou abrir/fechar modal
  useEffect(() => {
    clearError();
  }, [mode, isOpen, clearError]);

  if (!isOpen) return null;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;

    setIsSubmitting(true);
    try {
      if (mode === 'login') {
        await loginWithEmail({ email, password });
      } else {
        await registerWithEmail({ email, password, displayName: displayName.trim() || undefined });
      }
      onClose();
    } catch {
      // Erro tratado pelo AuthContext
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsSubmitting(true);
    try {
      await loginWithGoogle();
      onClose();
    } catch {
      // Erro tratado pelo AuthContext
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGuestLogin = async () => {
    setIsSubmitting(true);
    try {
      await loginAsGuest();
      onClose();
    } catch {
      // Erro tratado pelo AuthContext
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackdropClick = (e: MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className={styles.backdrop}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div className={styles.modalContent}>
        {/* Cabeçalho do Modal */}
        <div className={styles.modalHeader}>
          <div className={styles.tabs}>
            <button
              type="button"
              className={`${styles.tabBtn} ${mode === 'login' ? styles.tabActive : ''}`}
              onClick={() => setMode('login')}
            >
              Entrar
            </button>
            <button
              type="button"
              className={`${styles.tabBtn} ${mode === 'register' ? styles.tabActive : ''}`}
              onClick={() => setMode('register')}
            >
              Criar Conta
            </button>
          </div>

          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Fechar janela de login"
          >
            <X size={20} />
          </button>
        </div>

        {/* Corpo do Modal */}
        <div className={styles.modalBody}>
          {initialPrompt && (
            <div className={styles.promptBanner}>
              <span>{initialPrompt}</span>
            </div>
          )}

          <h2 id="auth-modal-title" className={styles.title}>
            {mode === 'login' ? 'Bem-vindo de volta!' : 'Crie sua conta no Playlist'}
          </h2>

          <p className={styles.subtitle}>
            {mode === 'login'
              ? 'Acesse para gerenciar sua lista de filmes, séries e animes.'
              : 'Cadastre-se para sincronizar seus títulos favoritos em qualquer dispositivo.'}
          </p>

          {/* Banner de Erro */}
          {error && (
            <div className={styles.errorAlert} role="alert">
              <AlertCircle size={18} className={styles.alertIcon} />
              <span>{error}</span>
            </div>
          )}

          {/* Formulário E-mail / Senha */}
          <form className={styles.form} onSubmit={handleSubmit}>
            {mode === 'register' && (
              <div className={styles.inputGroup}>
                <label htmlFor="auth-name" className={styles.label}>
                  Nome Completo
                </label>
                <div className={styles.inputWrapper}>
                  <UserIcon size={18} className={styles.inputIcon} />
                  <input
                    id="auth-name"
                    type="text"
                    className={styles.input}
                    placeholder="Seu nome"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div className={styles.inputGroup}>
              <label htmlFor="auth-email" className={styles.label}>
                E-mail
              </label>
              <div className={styles.inputWrapper}>
                <Mail size={18} className={styles.inputIcon} />
                <input
                  id="auth-email"
                  type="email"
                  required
                  className={styles.input}
                  placeholder="exemplo@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="auth-password" className={styles.label}>
                Senha
              </label>
              <div className={styles.inputWrapper}>
                <Lock size={18} className={styles.inputIcon} />
                <input
                  id="auth-password"
                  type="password"
                  required
                  minLength={6}
                  className={styles.input}
                  placeholder="Mínimo de 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              className={styles.submitBtn}
              disabled={isSubmitting}
            >
              <LogIn size={18} />
              <span>
                {isSubmitting
                  ? 'Processando...'
                  : mode === 'login'
                  ? 'Entrar'
                  : 'Cadastrar'}
              </span>
            </button>
          </form>

          {/* Divisor */}
          <div className={styles.divider}>
            <span className={styles.dividerLine} />
            <span className={styles.dividerText}>ou continue com</span>
            <span className={styles.dividerLine} />
          </div>

          {/* Botões de Acesso Alternativo */}
          <div className={styles.socialButtons}>
            <button
              type="button"
              className={styles.googleBtn}
              onClick={handleGoogleLogin}
              disabled={isSubmitting}
            >
              <svg className={styles.googleIcon} viewBox="0 0 24 24" width="18" height="18">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Google</span>
            </button>

            <button
              type="button"
              className={styles.guestBtn}
              onClick={handleGuestLogin}
              disabled={isSubmitting}
            >
              <UserCheck size={18} />
              <span>Modo Visitante</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

AuthModal.displayName = 'AuthModal';
