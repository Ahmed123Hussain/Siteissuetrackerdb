import React from 'react';

interface StatusBadgeProps {
  status: 'Open' | 'Work Ongoing' | 'Closed';
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'Open':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'Work Ongoing':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Closed':
        return 'bg-green-50 text-green-700 border-green-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium border ${getStatusColor()}`}>
      {status}
    </span>
  );
};

export default StatusBadge;
