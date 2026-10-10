import React from 'react';

const StatCard = ({ icon: Icon, label, value, color = 'var(--color-primary)', bgColor = 'var(--color-primary-light)' }) => {
  return (
    <div className="stat-card">
      <div className="stat-icon-wrapper" style={{ backgroundColor: bgColor, color }}>
        {Icon && <Icon size={24} />}
      </div>
      <div>
        <div className="stat-value">{value !== undefined && value !== null ? value : 0}</div>
        <div className="stat-label">{label}</div>
      </div>
    </div>
  );
};

export default StatCard;
