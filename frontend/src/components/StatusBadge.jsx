import React from 'react';

const StatusBadge = ({ status }) => {
  if (!status) return null;

  // Format status display label (standardize quotation submitted)
  let displayLabel = status.toString().replace(/_/g, ' ');
  if (status === 'QUOTATION_RECEIVED' || status === 'QUOTATION_SUBMITTED') {
    displayLabel = 'QUOTATION SUBMITTED';
  }

  const normalized = status.toString().toLowerCase().replace(/-/g, '_');

  return (
    <span className={`badge badge-${normalized}`}>
      ● {displayLabel}
    </span>
  );
};

export default StatusBadge;

