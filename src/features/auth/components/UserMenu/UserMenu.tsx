import { FC, memo, useState, useRef, useEffect, useCallback } from 'react';
import { LogIn, LogOut, User as UserIcon, Bookmark, ChevronDown } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import styles from './UserMenu.module.css';

export interface UserMenuProps {
  readonly onOpenAuthModal: () => void;
  readonly onNavigateToWatchlist?: () => void;
  readonly watchlistCount?: number;
}

export const UserMenu: FC<UserMenuProps> = memo(({
  onOpenAuthModal,
  onNavigateToWatchlist,
  watchlistCount = 0,
}) => {
  const { user, logout, loading } = useAuth();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Fecha o dropdown ao clicar fora ou apertar Escape
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleToggleMenu = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const handleSelectWatchlist = useCallback(() => {
    setIsOpen(false);
    onNavigateToWatchlist?.();
  }, [onNavigateToWatchlist]);

  const handleLogout = useCallback(async () => {
    setIsOpen(false);
    await logout();
  }, [logout]);

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
  const emailOrRole = user.isAnonymous ? 'Conta Visitante' : (user.email || 'Usuário Cadastrado');

  return (
    <div className={styles.container} ref={menuRef}>
      {/* Botão de Trigger do Perfil */}
      <button
        type="button"
        className={`${styles.profileTrigger} ${isOpen ? styles.triggerActive : ''}`}
        onClick={handleToggleMenu}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label="Menu do perfil do usuário"
      >
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
        <ChevronDown
          size={14}
          className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`}
          aria-hidden="true"
        />
      </button>

      {/* Menu Suspenso (Dropdown) */}
      {isOpen && (
        <div className={styles.dropdownMenu} role="menu">
          {/* Cabeçalho do Usuário */}
          <div className={styles.dropdownHeader}>
            <div className={styles.headerAvatar}>
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={displayName}
                  className={styles.headerAvatarImg}
                />
              ) : (
                <div className={styles.headerAvatarBadge}>
                  {user.isAnonymous ? <UserIcon size={18} /> : initial}
                </div>
              )}
            </div>
            <div className={styles.headerInfo}>
              <strong className={styles.headerName}>{displayName}</strong>
              <span className={styles.headerEmail}>{emailOrRole}</span>
            </div>
          </div>

          <div className={styles.menuDivider} />

          {/* Opção: Minha Lista */}
          <button
            type="button"
            className={styles.menuItem}
            onClick={handleSelectWatchlist}
            role="menuitem"
          >
            <Bookmark size={16} className={styles.itemIcon} />
            <span className={styles.itemText}>Minha Lista</span>
            {watchlistCount > 0 && (
              <span className={styles.watchlistBadge}>{watchlistCount}</span>
            )}
          </button>

          <div className={styles.menuDivider} />

          {/* Opção: Sair da Conta (Logout) */}
          <button
            type="button"
            className={`${styles.menuItem} ${styles.logoutItem}`}
            onClick={handleLogout}
            role="menuitem"
          >
            <LogOut size={16} className={styles.logoutIcon} />
            <span className={styles.itemText}>Sair da conta</span>
          </button>
        </div>
      )}
    </div>
  );
});

UserMenu.displayName = 'UserMenu';
