import React, { useState, useCallback } from 'react';
import './SearchBar.css';

const SearchBar = ({ onSearch, placeholder = 'Search...' }) => {
  const [query, setQuery] = useState('');
  const timeoutRef = React.useRef(null);

  const debounceSearch = useCallback((value) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      onSearch(value);
    }, 300);
  }, [onSearch]);

  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    debounceSearch(value);
  };

  const handleClear = () => {
    setQuery('');
    onSearch('');
  };

  return (
    <div className="search-bar">
      <span className="search-icon">🔍</span>
      <input
        type="text"
        value={query}
        onChange={handleChange}
        placeholder={placeholder}
        className="search-input"
      />
      {query && (
        <button className="search-clear" onClick={handleClear}>✕</button>
      )}
    </div>
  );
};

export default SearchBar;