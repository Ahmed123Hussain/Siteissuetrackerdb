import React from 'react';

interface StatusBadgeProps {
  status: 'Open' | 'Work Ongoing' | 'Closed';
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'Open':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'Work Ongoing':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'Closed':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'Open':
        return '⚠️';
      case 'Work Ongoing':
        return '🔄';
      case 'Closed':
        return '✓';
      default:
        return '•';
    }
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold border ${getStatusColor()}`}>
      <span>{getStatusIcon()}</span>
      <span>{status}</span>
    </span>
  );
};

export default StatusBadge;
