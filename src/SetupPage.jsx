import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function SetupPage() {
  const [classes, setClasses] = useState([]);
  const [terms, setTerms] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [topics, setTopics] = useState([]);

  const [selectedClass, setSelectedClass] = useState("");
  const [selectedTerm, setSelectedTerm] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("");

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const BASE_URL = "http://localhost:3001";

  useEffect(() => {
    fetch(`${BASE_URL}/classes`)
      .then(res => res.json())
      .then(data => setClasses(data))
      .catch(err => console.error("Error fetching classes:", err));

    fetch(`${BASE_URL}/terms`)
      .then(res => res.json())
      .then(data => setTerms(data))
      .catch(err => console.error("Error fetching terms:", err));
  }, []);

  useEffect(() => {
    if (selectedClass && selectedTerm) {
      fetch(`${BASE_URL}/subjects?classId=${selectedClass}&termId=${selectedTerm}`)
        .then(res => res.json())
        .then(data => setSubjects(data))
        .catch(err => console.error("Error fetching subjects:", err));
    }
  }, [selectedClass, selectedTerm]);

  useEffect(() => {
    if (selectedClass && selectedTerm && selectedSubject) {
      fetch(`${BASE_URL}/topics?classId=${selectedClass}&termId=${selectedTerm}&subjectId=${selectedSubject}`)
        .then(res => res.json())
        .then(data => setTopics(data))
        .catch(err => console.error("Error fetching topics:", err));
    }
  }, [selectedClass, selectedTerm, selectedSubject]);

  const handleStartQuiz = () => {
    if (selectedClass && selectedTerm && selectedSubject && selectedTopic) {
      setLoading(true);
      setTimeout(() => {
        navigate(
          `/quiz?classId=${selectedClass}&termId=${selectedTerm}&subjectId=${selectedSubject}&topicId=${selectedTopic}`
        );
      }, 1000);
    }
  };

  return (
    <div className="container p-5">
      {/* Navigation Tabs */}
      <nav className="mb-4">
        <ul className="nav nav-tabs">
          <li className="nav-item">
            <Link to="/about-app" className="nav-link">About the App / How it Works</Link>
          </li>
          <li className="nav-item">
            <Link to="/benefit-app" className="nav-link">Benefits (for Adults)</Link>
          </li>
          <li className="nav-item">
            <Link to="/" className="nav-link">Home</Link>
          </li>
          <li className="nav-item">
            <Link to="/view-score" className="nav-link text-success fw-bold">View My Score / Performance</Link>
          </li>
        </ul>
      </nav>

      <h2 className="mb-4 text-center">Setup Your Quiz</h2>

      <div className="mb-3">
        <label className="form-label">Select Class</label>
        <select className="form-select" value={selectedClass} onChange={e => setSelectedClass(e.target.value)}>
          <option value="">-- Choose Class --</option>
          {classes.map(cls => (
            <option key={cls.id} value={cls.id}>{cls.name}</option>
          ))}
        </select>
      </div>

      <div className="mb-3">
        <label className="form-label">Select Term</label>
        <select className="form-select" value={selectedTerm} onChange={e => setSelectedTerm(e.target.value)}>
          <option value="">-- Choose Term --</option>
          {terms.map(term => (
            <option key={term.id} value={term.id}>{term.name}</option>
          ))}
        </select>
      </div>

      <div className="mb-3">
        <label className="form-label">Select Subject</label>
        <select
          className="form-select"
          value={selectedSubject}
          onChange={e => setSelectedSubject(e.target.value)}
          disabled={!subjects.length}
        >
          <option value="">-- Choose Subject --</option>
          {subjects.map(subject => (
            <option key={subject.id} value={subject.id}>{subject.name}</option>
          ))}
        </select>
      </div>

      <div className="mb-3">
        <label className="form-label">Select Topic</label>
        <select
          className="form-select"
          value={selectedTopic}
          onChange={e => setSelectedTopic(e.target.value)}
          disabled={!topics.length}
        >
          <option value="">-- Choose Topic --</option>
          {topics.map(topic => (
            <option key={topic.id} value={topic.id}>{topic.name}</option>
          ))}
        </select>
      </div>

      {/* Start Quiz Button */}
      <div className="text-center my-4">
        <button
          className="btn btn-lg btn-primary"
          disabled={!(selectedClass && selectedTerm && selectedSubject && selectedTopic)}
          onClick={handleStartQuiz}
        >
          {loading ? "Starting Quiz..." : "Start My Quiz"}
        </button>
      </div>

      {/* Child cheering image */}
      <div className="text-center mb-5">
        <img
          src="/cheering-child.png"
          alt="Cheering child"
          style={{ maxWidth: "200px", height: "auto" }}
        />
        <p className="mt-2 text-muted">"You can do it!"</p>
      </div>

      {/* Footer */}
     <footer className="text-center text-muted border-top pt-3 mt-4">
      <small>
        RG Tech. | <span title="Century Icon">©2025</span> | Gbenga Joshua Afolabi
      </small>
    </footer>


    </div>
  );
}
