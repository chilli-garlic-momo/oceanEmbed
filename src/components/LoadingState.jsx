import React from 'react';

export function LoadingState({ message = 'Loading ocean field...', subMessage, inline = false }) {
  if (inline) {
    return (
      <div className="localized-inline-loader">
        <div className="spinner-ring micro" />
        <span className="loader-text">{message}</span>
      </div>
    );
  }

  return (
    <div className="micro-loader-overlay">
      <div className="spinner-ring" />
      <span className="loader-text">{message}</span>
      {subMessage && <span className="loader-sub-text">{subMessage}</span>}
    </div>
  );
}
