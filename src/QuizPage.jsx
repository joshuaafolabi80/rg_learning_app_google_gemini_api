import React, { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useSound } from "./context/SoundContext";
import { FaCheckCircle, FaTimesCircle, FaHome, FaCog } from "react-icons/fa"; // Removed unused FaVolumeUp, FaVolumeMute, FaLightbulb
import allQuizData from './all_quiz_data.json';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';


const TypingEffect = ({ text, speed = 30 }) => {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    if (!text) {
      setDisplayedText('');
      return;
    }
    let i = 0;
    setDisplayedText(''); // Clear previous text instantly
    const typingInterval = setInterval(() => {
      setDisplayedText((prev) => prev + text.charAt(i));
      i++;
      if (i >= text.length) clearInterval(typingInterval);
    }, speed);

    return () => clearInterval(typingInterval);
  }, [text, speed]);

  return <span>{displayedText}</span>;
};

const QuizPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { playSound } = useSound();

  const classId = searchParams.get('classId');
  const termId = searchParams.get('termId');
  const subjectId = searchParams.get('subjectId');
  const topicId = searchParams.get('topicId');
  const subjectNameParam = searchParams.get('subjectName') || '';
  const topicNameParam = searchParams.get('topicName') || '';

  const {
    questions: passedQuestions = [],
    className = '', // Unused, can be removed if not used elsewhere
    termName = '',   // Unused, can be removed if not used elsewhere
    subjectName: stateSubjectName = '',
    topicName: stateTopicName = ''
  } = location.state || {};

  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [score, setScore] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);
  const [feedback, setFeedback] = useState({ show: false, correct: false, message: "" });
  const [celebration, setCelebration] = useState(false);
  const [failure, setFailure] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [userName, setUserName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [subjectName, setSubjectName] = useState(stateSubjectName || subjectNameParam);
  const [topicName, setTopicName] = useState(stateTopicName || topicNameParam);
  const [loading, setLoading] = useState(true);
  const [explanationLevel, setExplanationLevel] = useState(0); // 0: None, 1: Basic, 2: Deep AI

  const [aiDeepExplanation, setAiDeepExplanation] = useState("");
  const [loadingAiDeepExplanation, setLoadingAiDeepExplanation] = useState(false);
  const [aiDeepExplanationError, setAiDeepExplanationError] = useState(null);

  const currentScore = Math.min(score * 5, 100);

  const saveScoreToLocal = (result) => {
    try {
      const existingScores = JSON.parse(localStorage.getItem('quizScores')) || [];
      const updatedScores = [result, ...existingScores];
      localStorage.setItem('quizScores', JSON.stringify(updatedScores));
      return updatedScores;
    } catch (error) {
      console.error("Error saving to local storage:", error);
      throw error;
    }
  };

  const handleSubmitScore = async () => {
    if (!userName.trim()) {
      setErrorMessage("Please enter your name to save your results.");
      setShowErrorModal(true);
      return;
    }

    setSubmitting(true);

    const totalQuestions = questions.length;
    const percentage = ((score / totalQuestions) * 100).toFixed(2);
    const remark =
      percentage >= 80
        ? "Excellent"
        : percentage >= 60
        ? "Good"
        : percentage >= 40
        ? "Fair"
        : "Needs Improvement";

    const result = {
      name: userName,
      classId: classId,
      termId: termId,
      subjectId: subjectId,
      topicId: topicId,
      subjectName: subjectName,
      topicName: topicName,
      score: score,
      totalQuestions: totalQuestions,
      percentage: percentage,
      remark: remark,
      date: new Date().toISOString()
    };

    try {
      const savedScores = saveScoreToLocal(result);
      navigate("/view-score", { state: { result } });
    } catch (error) {
      console.error("Error saving result:", error);
      setErrorMessage(`Failed to save your score. ${error.message}`);
      setShowErrorModal(true);
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (!classId || !termId || !subjectId || !topicId) {
      navigate("/setup");
      return;
    }

    setLoading(true);

    try {
      let loadedQuestions = passedQuestions.length > 0
        ? passedQuestions
        : allQuizData.questions.filter(q =>
            String(q.classId) === classId &&
            String(q.termId) === termId &&
            String(q.subjectId) === subjectId &&
            String(q.topicId) === topicId
          );

      if (loadedQuestions.length === 0) {
        throw new Error("No questions found for the selected criteria.");
      }

      if (!subjectName) {
        const currentSubjectName = allQuizData.subjects.find(s => String(s._id) === subjectId)?.name ||
          "Current Subject";
        setSubjectName(currentSubjectName);
      }

      if (!topicName) {
        const currentTopicName = allQuizData.topics.find(t => String(t._id) === topicId)?.name ||
          "Current Topic";
        setTopicName(currentTopicName);
      }

      setQuestions(loadedQuestions.map(q => ({
        ...q,
        id: q._id || q.id,
        question: q.question || "No question text available"
      })));

    } catch (error) {
      console.error("Error loading quiz data:", error);
      setErrorMessage(error.message || "Failed to load quiz data. Please try again.");
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  }, [classId, termId, subjectId, topicId, navigate, subjectName, topicName, passedQuestions]);

  const currentQuestion = questions[currentQuestionIndex];

  const fetchAiExplanation = useCallback(async () => {
    if (!currentQuestion) return;

    setLoadingAiDeepExplanation(true);
    setAiDeepExplanationError(null);
    setAiDeepExplanation(""); // Clear previous explanation

    try {
      const response = await fetch('http://localhost:3001/api/generate-explanation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: currentQuestion.question,
          options: currentQuestion.options.map(opt => ({ text: opt })), // Assuming options are simple strings in JSON
          correctAnswer: currentQuestion.correctAnswer,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch AI explanation from backend.');
      }

      const data = await response.json();
      setAiDeepExplanation(data.explanation);
    } catch (error) {
      console.error('Error fetching AI explanation:', error);
      setAiDeepExplanationError(`Failed to get AI explanation: ${error.message}`);
    } finally {
      setLoadingAiDeepExplanation(false);
    }
  }, [currentQuestion]);

  useEffect(() => {
    if (showExplanation && explanationLevel === 2 && currentQuestion && !aiDeepExplanation && !loadingAiDeepExplanation) {
      fetchAiExplanation();
    }
  }, [showExplanation, explanationLevel, currentQuestion, fetchAiExplanation, aiDeepExplanation, loadingAiDeepExplanation]); // Re-added aiDeepExplanation and loadingAiDeepExplanation for correct trigger logic.

  const handleExplain = () => {
    playSound('click');
    if (explanationLevel === 0) {
      setExplanationLevel(1);
    } else if (explanationLevel === 1) {
      setExplanationLevel(2);
      // Trigger fetch for AI explanation
      // The useEffect will handle the fetch if conditions are met
    } else {
      setExplanationLevel(0);
      setAiDeepExplanation(""); // Clear AI explanation when hiding
      setAiDeepExplanationError(null); // Clear any errors
    }
  };

  const handleOptionClick = (option) => {
    if (selectedOption !== null) return;

    playSound('click');
    const isCorrect = option === currentQuestion.correctAnswer;
    setSelectedOption(option);

    if (isCorrect) {
      setScore((prev) => prev + 1);
      setFeedback({
        show: true,
        correct: true,
        message: "Hurray! You got it right! 🎉"
      });
      setCelebration(true);
      playSound('correct');
      setTimeout(() => setCelebration(false), 2000);
    } else {
      setFeedback({
        show: true,
        correct: false,
        message: "Oops! Let's try again next time! 💪"
      });
      setFailure(true);
      playSound('wrong');
      setTimeout(() => setFailure(false), 2000);
    }

    setShowExplanation(true);
    setExplanationLevel(1); // Show basic explanation first
    setAiDeepExplanation(""); // Reset deep explanation for the new question
    setAiDeepExplanationError(null); // Reset deep explanation error
  };

  const handleNext = () => {
    playSound('click');
    setSelectedOption(null);
    setShowExplanation(false);
    setExplanationLevel(0);
    setFeedback({ ...feedback, show: false });
    setAiDeepExplanation(""); // Clear AI explanation for next question
    setAiDeepExplanationError(null); // Clear errors for next question

    if (currentQuestionIndex + 1 < questions.length) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      setQuizCompleted(true);
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p>Loading questions...</p>
        {showErrorModal && (
          <div className="alert alert-danger mt-3">
            {errorMessage}
            <button
              className="btn btn-sm btn-outline-danger ms-3"
              onClick={() => setShowErrorModal(false)}
            >
              Close
            </button>
          </div>
        )}
      </div>
    );
  }

  if (!currentQuestion && !loading) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger">
          <h4>No questions found</h4>
          <p>We couldn't find any questions for your selection.</p>
          <button
            className="btn btn-primary"
            onClick={() => navigate("/setup")}
          >
            Back to Setup
          </button>
        </div>
      </div>
    );
  }

  if (quizCompleted) {
    return (
      <div className="container mt-4">
        <div className="card shadow p-4 mb-4">
          <h3 className="text-center mb-4">Quiz Completed!</h3>

          <div className="alert alert-info mb-4">
            <h5>Your Results:</h5>
            <ul className="list-unstyled">
              <li><strong>Score:</strong> {score} out of {questions.length}</li>
              <li><strong>Percentage:</strong> {((score / questions.length) * 100).toFixed(2)}%</li>
              <li><strong>Subject:</strong> {subjectName}</li>
              <li><strong>Topic:</strong> {topicName}</li>
              <li><strong>Remark:</strong> {
                ((score / questions.length) * 100) >= 80 ? "Excellent" :
                ((score / questions.length) * 100) >= 60 ? "Good" :
                ((score / questions.length) * 100) >= 40 ? "Fair" : "Needs Improvement"
              }</li>
            </ul>
          </div>

          <div className="mb-3">
            <label htmlFor="userName" className="form-label">Enter your name:</label>
            <input
              type="text"
              className="form-control"
              id="userName"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Your name"
              disabled={submitting}
            />
          </div>

          <div className="text-end">
            <button
              className="btn btn-primary"
              onClick={handleSubmitScore}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Saving...
                </>
              ) : "Submit Results"}
            </button>
          </div>

          {showErrorModal && (
            <div className="modal" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
              <div className="modal-dialog">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">Quiz System Message</h5>
                    <button type="button" className="btn-close" onClick={() => setShowErrorModal(false)}></button>
                  </div>
                  <div className="modal-body">
                    {errorMessage}
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setShowErrorModal(false)}
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4" style={{ maxWidth: '800px' }}>
      {/* Celebration Effect */}
      {celebration && (
        <div className="celebration-overlay">
          {[...Array(100)].map((_, i) => {
            const colors = [
              '#FF5252', '#FF4081', '#E040FB', '#7C4DFF', '#536DFE',
              '#448AFF', '#40C4FF', '#18FFFF', '#64FFDA', '#69F0AE',
              '#B2FF59', '#EEFF41', '#FFFF00', '#FFD740', '#FFAB40',
              '#FF6E40', '#FF3D00', '#FF1744', '#F50057', '#D500F9'
            ];
            const color = colors[Math.floor(Math.random() * colors.length)];
            const size = Math.random() * 30 + 15;
            const duration = Math.random() * 3 + 2;
            const delay = Math.random() * 1.5;
            const rotation = Math.random() * 360;
            const startX = Math.random() * 40;
            const startY = Math.random() * 100;
            const petals = Math.floor(Math.random() * 5) + 5;

            return (
              <div
                key={i}
                className="flower"
                style={{
                  position: 'absolute',
                  left: `${startX}%`,
                  top: `${startY}%`,
                  width: `${size}px`,
                  height: `${size}px`,
                  animationDuration: `${duration}s`,
                  animationDelay: `${delay}s`,
                  transform: `rotate(${rotation}deg)`,
                  zIndex: 1000,
                }}
              >
                <div
                  className="flower-center"
                  style={{
                    position: 'absolute',
                    width: `${size * 0.3}px`,
                    height: `${size * 0.3}px`,
                    backgroundColor: '#FFD700',
                    borderRadius: '50%',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    zIndex: 1001,
                  }}
                ></div>

                {[...Array(petals)].map((_, p) => (
                  <div
                    key={p}
                    className="flower-petal"
                    style={{
                      position: 'absolute',
                      width: `${size * 0.6}px`,
                      height: `${size * 0.3}px`,
                      backgroundColor: color,
                      borderRadius: `${size * 0.3}px ${size * 0.3}px 0 0`,
                      top: '50%',
                      left: '50%',
                      transformOrigin: 'left center',
                      transform: `translate(0, -50%) rotate(${p * (360 / petals)}deg)`,
                      opacity: 0.9,
                    }}
                  ></div>
                ))}
              </div>
            );
          })}
        </div>
      )}

      {/* Failure Effect */}
      {failure && (
        <div className="failure-overlay">
          {[...Array(50)].map((_, i) => {
            const emojis = ['😢', '😭', '😞', '😔', '😟', '🙁', '☹️', '😣', '😫', '😩'];
            const emoji = emojis[Math.floor(Math.random() * emojis.length)];
            const size = Math.random() * 30 + 15;
            const duration = Math.random() * 3 + 2;
            const delay = Math.random() * 1.5;
            const rotation = Math.random() * 360;
            const startX = 60 + Math.random() * 40;
            const startY = Math.random() * 100;

            return (
              <div
                key={i}
                className="sad-emoji"
                style={{
                  position: 'absolute',
                  right: `${100 - startX}%`,
                  top: `${startY}%`,
                  fontSize: `${size}px`,
                  animationDuration: `${duration}s`,
                  animationDelay: `${delay}s`,
                  transform: `rotate(${rotation}deg)`,
                  zIndex: 1000,
                }}
              >
                {emoji}
              </div>
            );
          })}
        </div>
      )}

      <div className="card shadow p-4 mb-4 position-relative">
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div>
            <h5 className="mb-1">Question {currentQuestionIndex + 1} of {questions.length}</h5>
            <div className="text-muted">
              <div><strong>Subject:</strong> {subjectName}</div>
              <div><strong>Topic:</strong> {topicName}</div>
            </div>
          </div>
          <span className="badge bg-primary fs-6">Score: {currentScore}/100</span>
        </div>

        <div className="progress mb-3" style={{ height: '6px' }}>
          <div
            className="progress-bar bg-primary"
            role="progressbar"
            style={{ width: `${(currentQuestionIndex + 1) / questions.length * 100}%` }}
            aria-valuenow={currentQuestionIndex + 1}
            aria-valuemin="0"
            aria-valuemax={questions.length}
          ></div>
        </div>

        <div className="d-flex justify-content-center gap-3 mb-4">
          <button
            onClick={() => navigate("/setup")}
            className="btn btn-outline-primary d-flex align-items-center"
          >
            <FaCog className="me-2" />
            Setup
          </button>
          <button
            onClick={() => navigate("/")}
            className="btn btn-outline-secondary d-flex align-items-center"
          >
            <FaHome className="me-2" />
            Home
          </button>
        </div>

        {currentQuestion && currentQuestion.question && (
          <div className="question-text mb-4 p-3 bg-light rounded">
            <h4>{currentQuestion.question}</h4>
          </div>
        )}

        {feedback.show && (
          <div className={`alert ${feedback.correct ? 'alert-success' : 'alert-warning'} d-flex align-items-center mb-4`}>
            {feedback.correct ? (
              <FaCheckCircle className="me-2 fs-4" />
            ) : (
              <FaTimesCircle className="me-2 fs-4" />
            )}
            <div>
              <strong>{feedback.correct ? 'Great Job!' : 'Keep Trying!'}</strong> {feedback.message}
            </div>
          </div>
        )}

        <div className="options-container row g-3">
          {currentQuestion.options.map((option, index) => {
            let className = "option-btn btn btn-outline-primary text-start p-3";
            let icon = null;

            if (selectedOption !== null) {
              if (option === currentQuestion.correctAnswer) {
                className = "option-btn btn btn-success text-start p-3";
                icon = <FaCheckCircle className="me-2" />;
              } else if (option === selectedOption && option !== currentQuestion.correctAnswer) {
                className = "option-btn btn btn-danger text-start p-3";
                icon = <FaTimesCircle className="me-2" />;
              } else {
                className = "option-btn btn btn-outline-secondary text-start p-3 disabled";
              }
            }

            return (
              <div key={index} className="col-md-6">
                <button
                  className={`${className} h-100 w-100`}
                  onClick={() => handleOptionClick(option)}
                  disabled={selectedOption !== null}
                >
                  <div className="d-flex align-items-center">
                    {icon}
                    <span>{option}</span>
                  </div>
                </button>
              </div>
            );
          })}
        </div>

        {showExplanation && (
          <div className="mt-4">
            {explanationLevel > 0 && (
              <div className="explanation-box mt-3 p-2 bg-light rounded">
                {explanationLevel >= 1 && (
                  <div className="basic-explanation mb-2">
                    <strong>Explanation:</strong> {currentQuestion.explanation}
                  </div>
                )}

                {explanationLevel >= 2 && (
                  // Changed class here to ai-explanation-box for consistency with CSS
                  <div className="ai-explanation-box mt-2 p-1 bg-white rounded">
                    <div className="d-flex align-items-center mb-2">
                      <img
                        src="/ai-tutor.jpeg"
                        alt="AI Tutor"
                        className="me-2"
                        style={{ width: '20%', height: '', borderRadius: '0%' }}
                      />
                      <strong>AI Tutor:</strong>
                    </div>
                    <div className="explanation-text">
                      {loadingAiDeepExplanation ? (
                        <p>Loading deep explanation from AI...<span className="blinking-cursor">|</span></p>
                      ) : aiDeepExplanationError ? (
                        <p className="text-danger">{aiDeepExplanationError}</p>
                      ) : (
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {aiDeepExplanation}
                        </ReactMarkdown>
                      )}
                    </div>
                  </div>
                )}

                <button
                  onClick={handleExplain}
                  className={`btn btn-sm mt-2 ${
                    explanationLevel === 1 ? 'btn-info' : 'btn-outline-secondary'
                  }`}
                  disabled={loadingAiDeepExplanation}
                >
                  {explanationLevel === 1
                    ? "Still not clear? Get deeper explanation from AI"
                    : "Hide explanation"}
                </button>
              </div>
            )}
          </div>
        )}

        {selectedOption && (
          <div className="mt-4 d-flex justify-content-between align-items-center">
            <div className="score-display">
              <strong>Current Score:</strong> {currentScore}/100
            </div>
            <button className="btn btn-primary px-4 py-2" onClick={handleNext}>
              {currentQuestionIndex + 1 < questions.length ? "Next Question →" : "Finish Quiz"}
            </button>
          </div>
        )}
      </div>

      <style>{`
        .celebration-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 1000;
          overflow: hidden;
        }
        .failure-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 1000;
          overflow: hidden;
        }
        .explanation-box {
          border-left: 4px solid #0d6efd;
          transition: all 0.3s ease;
        }
        .blinking-cursor {
          animation: blink 1s infinite;
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        /* Adjusted deep-explanation for AI specific styling */
        .ai-explanation-box {
          border: 1px solid #dee2e6;
          position: relative;
          background-color: #f9f9f9; /* Applying the background from your suggested CSS */
          border-left: 4px solid #007bff; /* Applying the border from your suggested CSS */
          padding: 15px; /* Applying padding from your suggested CSS */
          margin-top: 20px;
          border-radius: 4px;
        }
        .ai-explanation-box::before {
          content: "";
          position: absolute;
          top: -10px;
          left: 20px;
          border-width: 0 10px 10px;
          border-style: solid;
          border-color: #f9f9f9 transparent; /* Adjust color to match ai-explanation-box background */
        }
        .option-btn {
          transition: all 0.2s ease;
          white-space: normal;
          text-align: left;
        }
        .option-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
        .question-text {
          border-left: 4px solid #0d6efd;
          background-color: #f8f9fa;
        }

        /* Styles for ReactMarkdown output */
        .ai-explanation-box h4 {
          color: #007bff;
          margin-bottom: 10px;
        }
        .ai-explanation-box strong {
            font-weight: bold;
            color: #333;
        }
        .ai-explanation-box p {
          margin-bottom: 0.5em;
        }
      `}</style>
    </div>
  );
};

export default QuizPage;