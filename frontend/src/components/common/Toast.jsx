import React from 'react';

const Toast = ({ message, type = 'info' }) => {
  const colors = {
    success: '#61bd4f',
    error: '#eb5a46',
    info: '#0079bf',
    warning: '#f2d600',
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    }}>
      <div style={{
        width: 8,
        height: 8,
        borderRadius: '50%',
        background: colors[type]
      }} />
      <span>{message}</span>
    </div>
  );
};

export default Toast;