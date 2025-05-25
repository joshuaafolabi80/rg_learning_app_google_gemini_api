import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";

// Typing effect component
const TypingEffect = ({ text, speed = 30 }) => {
  const [displayedText, setDisplayedText] = useState('');
  
  useEffect(() => {
    let i = 0;
    const typingInterval = setInterval(() => {
      setDisplayedText(text.slice(0, i));
      i++;
      if (i > text.length) clearInterval(typingInterval);
    }, speed);
    
    return () => clearInterval(typingInterval);
  }, [text, speed]);

  return <span>{displayedText}</span>;
};

const QuizPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const searchParams = new URLSearchParams(location.search);
  const classId = searchParams.get("classId");
  const termId = searchParams.get("termId");
  const subjectId = searchParams.get("subjectId");
  const topicId = searchParams.get("topicId");

  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [score, setScore] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);
  const [chatResponse, setChatResponse] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [feedback, setFeedback] = useState({ show: false, correct: false, message: "" });
  const [celebration, setCelebration] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [userName, setUserName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [subjectName, setSubjectName] = useState("");
  const [topicName, setTopicName] = useState("");
  
  // AI Explanation states
  const [explanationLevel, setExplanationLevel] = useState(0); // 0 = none, 1 = basic, 2 = deep
  const [isTyping, setIsTyping] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  // Fetch questions and related data
  useEffect(() => {
    if (!classId || !termId || !subjectId || !topicId) {
      navigate("/");
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch questions
        const questionsResponse = await axios.get(
          `http://localhost:3001/questions?classId=${classId}&termId=${termId}&subjectId=${subjectId}&topicId=${topicId}`
        );
        setQuestions(questionsResponse.data);

        // Fetch subject and topic names
        const subjectResponse = await axios.get(`http://localhost:3001/subjects/${subjectId}`);
        setSubjectName(subjectResponse.data.name || "");
        
        const topicResponse = await axios.get(`http://localhost:3001/topics/${topicId}`);
        setTopicName(topicResponse.data.name || "");
      } catch (error) {
        console.error("Error fetching data:", error);
        setErrorMessage("Failed to load quiz data. Please try again later.");
        setShowErrorModal(true);
      }
    };

    fetchData();
  }, [classId, termId, subjectId, topicId, navigate]);

  const currentQuestion = questions[currentQuestionIndex];

  const handleExplain = () => {
    if (explanationLevel === 0) {
      setExplanationLevel(1);
    } else if (explanationLevel === 1) {
      setIsTyping(true);
      setExplanationLevel(2);
      // Simulate AI thinking time
      setTimeout(() => setIsTyping(false), 2000);
    } else {
      setExplanationLevel(0);
    }
  };

  const handleOptionClick = (option) => {
    if (selectedOption !== null) return;

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
      setTimeout(() => setCelebration(false), 2000);
    } else {
      setFeedback({
        show: true,
        correct: false,
        message: "Oops! Let's try again next time! 💪"
      });
    }
    
    setShowExplanation(true);
    setExplanationLevel(1); // Show basic explanation by default
  };

  const handleNext = () => {
    setSelectedOption(null);
    setShowExplanation(false);
    setExplanationLevel(0);
    setFeedback({ ...feedback, show: false });
    
    if (currentQuestionIndex + 1 < questions.length) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      setQuizCompleted(true);
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
      classId: parseInt(classId),
      termId: parseInt(termId),
      subjectId: parseInt(subjectId),
      topicId: parseInt(topicId),
      subjectName: subjectName,
      topicName: topicName,
      score: score,
      totalQuestions: totalQuestions,
      percentage: percentage,
      remark: remark,
      date: new Date().toISOString()
    };

    try {
      const response = await axios.post("http://localhost:3001/scores", result);
      
      if (response.status === 201) {
        navigate("/view-score", { state: { result: response.data } });
      } else {
        throw new Error(`Server responded with status ${response.status}`);
      }
    } catch (error) {
      console.error("Error saving result:", error);
      setErrorMessage(`Failed to save your score. ${error.message}`);
      setShowErrorModal(true);
    } finally {
      setSubmitting(false);
    }
  };

  if (!currentQuestion) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p>Loading questions...</p>
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

          {/* Error Modal */}
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
    <div className="container mt-4">
      {celebration && (
        <div className="celebration-overlay">
          {[...Array(20)].map((_, i) => (
            <div key={i} className="confetti" style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              backgroundColor: `hsl(${Math.random() * 360}, 100%, 50%)`
            }}></div>
          ))}
        </div>
      )}
      
      <h3 className="text-center mb-4">Quiz Time!</h3>
      <div className="card shadow p-4 mb-4 position-relative">
        <h5>
          Question {currentQuestionIndex + 1} of {questions.length}
          {subjectName && topicName && (
            <span className="text-muted ms-2" style={{ fontSize: '0.8rem' }}>
              ({subjectName} - {topicName})
            </span>
          )}
        </h5>
        <p className="mt-3 fs-5">{currentQuestion.question}</p>

        {feedback.show && (
          <div className={`alert ${feedback.correct ? 'alert-success' : 'alert-warning'} d-flex align-items-center`}>
            <i className={`fas ${feedback.correct ? 'fa-check-circle' : 'fa-lightbulb'} me-2 fs-4`}></i>
            <div>
              <strong>{feedback.correct ? 'Great Job!' : 'Keep Trying!'}</strong> {feedback.message}
            </div>
          </div>
        )}

        <div className="options-container mt-3">
          {currentQuestion.options.map((option, index) => {
            let className = "option-btn btn btn-outline-primary w-100 text-start mb-2 p-3";

            if (selectedOption !== null) {
              if (option === currentQuestion.correctAnswer) {
                className = "option-btn btn btn-success w-100 text-start mb-2 p-3";
              } else if (option === selectedOption && option !== currentQuestion.correctAnswer) {
                className = "option-btn btn btn-danger w-100 text-start mb-2 p-3";
              } else {
                className = "option-btn btn btn-outline-primary w-100 text-start mb-2 p-3 disabled";
              }
            }

            return (
              <button
                key={index}
                className={className}
                onClick={() => handleOptionClick(option)}
                disabled={selectedOption !== null}
              >
                {option}
              </button>
            );
          })}
        </div>

        {showExplanation && (
          <div className="mt-3">
            {explanationLevel > 0 && (
              <div className="explanation-box mt-3 p-3 bg-light rounded">
                {explanationLevel >= 1 && (
                  <div className="basic-explanation mb-2">
                    <strong>Explanation:</strong> {currentQuestion.explanation}
                  </div>
                )}
                
                {explanationLevel >= 2 && (
                  <div className="deep-explanation mt-2 p-2 bg-white rounded">
                    <div className="d-flex align-items-center mb-2">
                      <div className="robot-avatar me-2">🤖</div>
                      <strong>AI Tutor:</strong>
                    </div>
                    <div className="explanation-text">
                      {isTyping ? (
                        <TypingEffect text={currentQuestion.deepExplanation || currentQuestion.explanation} />
                      ) : (
                        currentQuestion.deepExplanation || currentQuestion.explanation
                      )}
                      {isTyping && <span className="blinking-cursor">|</span>}
                    </div>
                  </div>
                )}
                
                <button 
                  onClick={handleExplain}
                  className={`btn btn-sm mt-2 ${
                    explanationLevel === 1 ? 'btn-info' : 'btn-outline-secondary'
                  }`}
                >
                  {explanationLevel === 1 
                    ? "Still not clear? Get deeper explanation" 
                    : "Hide explanation"}
                </button>
              </div>
            )}
            
            {explanationLevel === 0 && (
              <button 
                onClick={() => setExplanationLevel(1)}
                className="btn btn-outline-info mt-3"
              >
                Need help understanding?
              </button>
            )}
          </div>
        )}

        {selectedOption && (
          <div className="mt-4 text-end">
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
        }
        .confetti {
          position: absolute;
          width: 10px;
          height: 10px;
          opacity: 0.7;
          animation: confetti-fall 3s ease-in-out forwards;
        }
        @keyframes confetti-fall {
          0% { transform: translateY(-100px) rotate(0deg); }
          100% { transform: translateY(100vh) rotate(360deg); }
        }
        .explanation-box {
          border-left: 4px solid #0d6efd;
          transition: all 0.3s ease;
        }
        .robot-avatar {
          font-size: 1.5rem;
        }
        .blinking-cursor {
          animation: blink 1s infinite;
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        .deep-explanation {
          border: 1px solid #dee2e6;
          position: relative;
        }
        .deep-explanation::before {
          content: "";
          position: absolute;
          top: -10px;
          left: 20px;
          border-width: 0 10px 10px;
          border-style: solid;
          border-color: #ffffff transparent;
        }
      `}</style>
    </div>
  );
};

export default QuizPage;