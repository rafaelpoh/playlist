import { FC, memo } from 'react';
import { LogIn, LogOut, User as UserIcon } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import styles from './UserMenu.module.css';

export interface UserMenuProps {
  readonly onOpenAuthModal: () => void;
}

export const UserMenu: FC<UserMenuProps> = memo(({ onOpenAuthModal }) => {
  const { user, logout, loading } = useAuth();

  if (loading) {
    return <div className={styles.skeleton} aria-hidden="true" />;
  }

  if (!user) {
    return (
      <button
        type="button"
        className={styles.loginBtn}
        onClick={onOpenAuthModal}
        aria-label="Abrir janela de autenticação"
      >
        <LogIn size={16} />
        <span>Entrar</span>
      </button>
    );
  }

  const initial = (user.displayName?.[0] || user.email?.[0] || 'V').toUpperCase();
  const displayName = user.displayName || user.email?.split('@')[0] || 'Visitante';

  return (
    <div className={styles.userContainer}>
      <div className={styles.userInfo}>
        {user.photoURL ? (
          <img
            src={user.photoURL}
            alt={displayName}
            className={styles.avatarImg}
          />
        ) : (
          <div className={styles.avatarBadge}>
            {user.isAnonymous ? <UserIcon size={14} /> : initial}
          </div>
        )}
        <div className={styles.userDetails}>
          <span className={styles.userName}>{displayName}</span>
          {user.isAnonymous && <span className={styles.guestTag}>Visitante</span>}
        </div>
      </div>

      <button
        type="button"
        className={styles.logoutBtn}
        onClick={logout}
        title="Desconectar"
        aria-label="Desconectar da conta"
      >
        <LogOut size={16} />
      </button>
    </div>
  );
});

UserMenu.displayName = 'UserMenu';
