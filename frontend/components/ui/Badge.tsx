import React from 'react';

interface BadgeProps {
  status: 'ACTIVE' | 'BLOCKED' | 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'READY';
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({ status, className = '' }) => {
  const baseStyles = 'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium';
  
  const statusStyles = {
    ACTIVE: 'bg-green-100 text-green-800',
    BLOCKED: 'bg-red-100 text-red-800',
    PENDING: 'bg-yellow-100 text-yellow-800',
    ACCEPTED: 'bg-blue-100 text-blue-800',
    REJECTED: 'bg-red-100 text-red-800',
    READY: 'bg-green-100 text-green-800',
  };

  return (
    <span className={`${baseStyles} ${statusStyles[status]} ${className}`}>
      {status}
    </span>
  );
};

export default Badge;

