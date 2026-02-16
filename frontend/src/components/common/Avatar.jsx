import React from 'react';
import { getInitials } from '../../utils/helpers';
import './Avatar.css';

const Avatar = ({ name, src, size = 32, className = '' }) => {
  const initials = getInitials(name);

  if (src) {
    return (
      <img
        className={`avatar ${className}`}
        src={src}
        alt={name}
        style={{ width: size, height: size }}
        onError={(e) => {
          e.target.style.display = 'none';
          e.target.nextSibling.style.display = 'flex';
        }}
      />
    );
  }

  return (
    <div
      className={`avatar avatar-initials ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.4 }}
      title={name}
    >
      {initials}
    </div>
  );
};

export default Avatar;