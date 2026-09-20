import { FC, memo } from 'react';
import { Search, X } from 'lucide-react';
import styles from './SearchBar.module.css';

export interface SearchBarProps {
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly onClear: () => void;
  readonly placeholder?: string;
}

export const SearchBar: FC<SearchBarProps> = memo(({
  value,
  onChange,
  onClear,
  placeholder = 'Buscar filmes, séries e animes...',
}) => {
  return (
    <div className={styles.searchContainer}>
      <Search className={styles.searchIcon} size={18} aria-hidden="true" />
      <input
        type="text"
        className={styles.input}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Campo de busca"
      />
      {value.trim().length > 0 && (
        <button
          type="button"
          className={styles.clearButton}
          onClick={onClear}
          aria-label="Limpar busca"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
});

SearchBar.displayName = 'SearchBar';
