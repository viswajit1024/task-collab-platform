import React from 'react';

const Loader = ({ fullScreen = false, size = 40 }) => {
  const style = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    ...(fullScreen ? { height: '100vh' } : { padding: '40px' })
  };

  const spinnerStyle = {
    width: size,
    height: size,
    border: '3px solid var(--gray-200)',
    borderTop: '3px solid var(--primary)',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  };

  return (
    <div style={style}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={spinnerStyle}></div>
    </div>
  );
};

export default Loader;