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
            <span className={styles.dividerText}>ou acesse como</span>
            <span className={styles.dividerLine} />
          </div>

          {/* Acesso Alternativo */}
          <div className={styles.socialButtons}>
            <button
              type="button"
              className={styles.guestBtn}
              onClick={handleGuestLogin}
              disabled={isSubmitting}
            >
              <UserCheck size={18} />
              <span>Entrar como Visitante</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

AuthModal.displayName = 'AuthModal';
