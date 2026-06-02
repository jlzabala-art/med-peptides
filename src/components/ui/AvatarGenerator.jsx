import React from 'react';

const AvatarGenerator = ({ name, email, size = 36, onClick }) => {
  const getInitials = () => {
    if (name) {
      const parts = name.split(' ').filter(p => p.length > 0);
      if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
      }
      return name.slice(0, 2).toUpperCase();
    }
    if (email) {
      return email.slice(0, 2).toUpperCase();
    }
    return 'U';
  };

  const getBackgroundColor = () => {
    const text = name || email || 'U';
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = text.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash % 360);
    return `hsl(${hue}, 70%, 40%)`; // Rich, deep color
  };

  return (
    <div
      onClick={onClick}
      title={name || email || 'Mi Perfil'}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '50%',
        backgroundColor: getBackgroundColor(),
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: onClick ? 'pointer' : 'default',
        fontWeight: 600,
        fontSize: `${size * 0.4}px`,
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        flexShrink: 0,
        textTransform: 'uppercase',
        userSelect: 'none'
      }}
    >
      {getInitials()}
    </div>
  );
};

export default AvatarGenerator;
