import React from 'react';

interface StatusTagProps {
  label: string;
  className?: string;
  variant?: 'completed' | 'action_required' | 'pending';
}

const variantClasses = {
  completed: 'bg-green-800/80 text-green-200',
  action_required: 'bg-yellow-800/80 text-yellow-200',
  pending: 'bg-blue-800/80 text-blue-200',
};

const StatusTag: React.FC<StatusTagProps> = ({ label, variant = 'completed', className = '' }) => (
  <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${variantClasses[variant]} ${className}`}>
    {label}
  </span>
);

export default StatusTag; 