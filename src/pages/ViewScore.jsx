import React, { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import axios from "axios";

const ViewScore = () => {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const location = useLocation();
  const [expandedNames, setExpandedNames] = useState({});
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const loadScores = () => {
      try {
        // Get scores from local storage
        const storedScores = JSON.parse(localStorage.getItem('quizScores')) || [];
        
        // If we have a new result from navigation, check if it already exists
        if (location.state?.result) {
          const newScore = location.state.result;
          const scoreExists = storedScores.some(
            score => score.date === newScore.date && 
                    score.name === newScore.name &&
                    score.score === newScore.score
          );
          
          // Only add if it doesn't exist
          if (!scoreExists) {
            storedScores.unshift(newScore); // Add to beginning
            localStorage.setItem('quizScores', JSON.stringify(storedScores));
          }
        }
        
        setScores(storedScores);
        
        // Optional: Try to sync with server if available
        try {
          axios.get("http://localhost:3001/api/scores").then(response => {
            if (response.data && response.data.length > 0) {
              setScores(prev => {
                // Filter out any server scores that already exist locally
                const serverScores = response.data.filter(serverScore => 
                  !prev.some(localScore => 
                    localScore.date === serverScore.date && 
                    localScore.name === serverScore.name &&
                    localScore.score === serverScore.score
                  )
                );
                return [...serverScores, ...prev];
              });
            }
          });
        } catch (serverError) {
          console.log("Couldn't fetch scores from server:", serverError);
        }
      } catch (err) {
        setError(err.message);
      }
    };

    loadScores();
  }, [location.state]);

  const safeParsePercentage = (percentage) => {
    const num = parseFloat(percentage);
    return isNaN(num) ? 0 : num;
  };

  const groupedScores = scores.reduce((acc, score) => {
    if (!acc[score.name]) {
      acc[score.name] = [];
    }
    acc[score.name].push({
      ...score,
      safePercentage: safeParsePercentage(score.percentage)
    });
    return acc;
  }, {});

  const filteredGroups = Object.entries(groupedScores).filter(([name, attempts]) => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      name.toLowerCase().includes(searchLower) ||
      attempts.some(attempt => 
        attempt.subjectName?.toLowerCase().includes(searchLower) ||
        attempt.topicName?.toLowerCase().includes(searchLower) ||
        attempt.remark?.toLowerCase().includes(searchLower) ||
        attempt.score?.toString().includes(searchTerm) ||
        attempt.percentage?.toString().includes(searchTerm) ||
        new Date(attempt.date).toLocaleDateString().includes(searchTerm)
      )
    );
  });

  filteredGroups.sort((a, b) => {
    const aLatest = new Date(a[1][0].date);
    const bLatest = new Date(b[1][0].date);
    return bLatest - aLatest;
  });

  const calculateGroupStats = (attempts) => {
    const validAttempts = attempts.filter(a => !isNaN(a.safePercentage));
    const count = validAttempts.length;
    
    if (count === 0) return { average: 0, best: 0, hasValidScores: false };
    
    const sum = validAttempts.reduce((total, a) => total + a.safePercentage, 0);
    const best = Math.max(...validAttempts.map(a => a.safePercentage));
    
    return {
      average: sum / count,
      best,
      hasValidScores: true
    };
  };

  const calculateOverallStats = () => {
    const allAttempts = filteredGroups.flatMap(([_, attempts]) => attempts);
    const validAttempts = allAttempts.filter(a => !isNaN(a.safePercentage));
    const totalAttempts = validAttempts.length;
    
    if (totalAttempts === 0) return { average: 0, hasValidScores: false };
    
    const sum = validAttempts.reduce((total, a) => total + a.safePercentage, 0);
    return {
      average: sum / totalAttempts,
      hasValidScores: true
    };
  };

  const overallStats = calculateOverallStats();

  const toggleExpand = (name) => {
    setExpandedNames(prev => ({
      ...prev,
      [name]: !prev[name]
    }));
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p>Loading scores...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger mt-5 mx-auto" style={{ maxWidth: '600px' }}>
        <h4>Error Loading Scores</h4>
        <p>{error}</p>
        <button className="btn btn-primary" onClick={() => window.location.reload()}>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <h2 className="text-center mb-4">My Quiz Scores</h2>
      
      <div className="mb-4">
        <div className="input-group">
          <input
            type="text"
            className="form-control"
            placeholder="Search by name, subject, score, or date..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button 
            className="btn btn-outline-secondary" 
            type="button"
            onClick={() => setSearchTerm("")}
            disabled={!searchTerm}
          >
            Clear
          </button>
        </div>
      </div>

      <div className="table-responsive">
        <table className="table table-striped table-hover">
          <thead className="table-dark">
            <tr>
              <th></th>
              <th>Name</th>
              <th>Attempts</th>
              <th>Average Score</th>
              <th>Last Attempt</th>
              <th>Best Score</th>
            </tr>
          </thead>
          <tbody>
            {filteredGroups.length > 0 ? (
              filteredGroups.map(([name, attempts]) => {
                const { average, best, hasValidScores } = calculateGroupStats(attempts);
                const lastAttempt = attempts[0];

                return (
                  <React.Fragment key={name}>
                    <tr 
                      className="group-header" 
                      onClick={() => toggleExpand(name)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td>
                        <i className={`fas fa-chevron-${expandedNames[name] ? 'down' : 'right'}`} />
                      </td>
                      <td><strong>{name}</strong></td>
                      <td>
                        <span className="badge bg-primary rounded-pill">
                          {attempts.length}
                        </span>
                      </td>
                      <td>
                        <span className="badge bg-info">
                          {hasValidScores ? average.toFixed(1) : '0'}%
                        </span>
                      </td>
                      <td>
                        {new Date(lastAttempt.date).toLocaleDateString()}
                      </td>
                      <td>
                        <span className="badge bg-success">
                          {hasValidScores ? best.toFixed(1) : '0'}%
                        </span>
                      </td>
                    </tr>

                    {expandedNames[name] && attempts.map((attempt, index) => (
                      <tr key={`${name}-${index}`} className="attempt-detail">
                        <td></td>
                        <td colSpan="5">
                          <div className="attempt-detail-content">
                            <div className="row">
                              <div className="col-md-3">
                                <strong>Subject:</strong> {attempt.subjectName || 'N/A'}
                              </div>
                              <div className="col-md-3">
                                <strong>Topic:</strong> {attempt.topicName || 'N/A'}
                              </div>
                              <div className="col-md-2">
                                <strong>Score:</strong> {attempt.score || '0'}/{attempt.totalQuestions || 'N/A'}
                              </div>
                              <div className="col-md-2">
                                <strong>Percentage:</strong> {attempt.percentage || '0'}%
                              </div>
                              <div className="col-md-2">
                                <strong>Date:</strong> {new Date(attempt.date).toLocaleString()}
                              </div>
                            </div>
                            <div className="row mt-2">
                              <div className="col-md-12">
                                <strong>Remark:</strong> 
                                <span className={`badge ms-2 ${
                                  attempt.remark === 'Excellent' ? 'bg-success' :
                                  attempt.remark === 'Good' ? 'bg-primary' :
                                  attempt.remark === 'Fair' ? 'bg-warning text-dark' : 'bg-danger'
                                }`}>
                                  {attempt.remark || 'N/A'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                );
              })
            ) : (
              <tr>
                <td colSpan="6" className="text-center py-4">
                  {searchTerm ? 'No matching results found' : 'No scores available yet'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {filteredGroups.length > 0 && (
        <div className="mt-4 p-3 bg-light rounded">
          <div className="row">
            <div className="col-md-4">
              <h5>Total Students: <span className="badge bg-info">{filteredGroups.length}</span></h5>
            </div>
            <div className="col-md-4">
              <h5>Total Attempts: <span className="badge bg-primary">
                {filteredGroups.reduce((sum, [_, attempts]) => sum + attempts.length, 0)}
              </span></h5>
            </div>
            <div className="col-md-4">
              <h5>Overall Average: <span className="badge bg-success">
                {overallStats.hasValidScores ? overallStats.average.toFixed(1) : '0'}%
              </span></h5>
            </div>
          </div>
        </div>
      )}

      <div className="card-body text-center mt-4">
        <Link to="/setup" className="btn btn-primary">← Back to Quiz Setup</Link>
      </div>

      <style jsx>{`
        .group-header {
          background-color: #f8f9fa !important;
        }
        .group-header:hover {
          background-color: #e9ecef !important;
        }
        .attempt-detail {
          background-color: #f8f9fa;
        }
        .attempt-detail-content {
          padding: 10px;
          background-color: white;
          border-radius: 5px;
          border-left: 3px solid #0d6efd;
        }
        .badge {
          font-size: 0.85em;
          padding: 0.35em 0.65em;
        }
      `}</style>
    </div>
  );
};

export default ViewScore;