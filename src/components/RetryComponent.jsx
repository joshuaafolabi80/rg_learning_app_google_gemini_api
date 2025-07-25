import React from 'react';

const RetryComponent = ({ error, onRetry }) => {
  return (
    <div className="container mt-5">
      <div className="alert alert-danger">
        <h4 className="alert-heading">Error Loading Data</h4>
        <p>{error}</p>
        <div className="d-flex justify-content-between mt-3">
          <button
            className="btn btn-primary"
            onClick={() => window.location.reload()}
          >
            Refresh Page
          </button>
          <button
            className="btn btn-secondary"
            onClick={onRetry}
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
};

export default RetryComponent;