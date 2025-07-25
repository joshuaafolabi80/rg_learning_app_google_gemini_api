import React, { useEffect, useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import SoundSettings from './pages/SoundSettings';
import { useSound } from './context/SoundContext.jsx';
import { Dropdown } from 'bootstrap';
import RetryComponent from './components/RetryComponent';
import allQuizData from './all_quiz_data.json';

const SetupPage = () => {
    // State for dropdown options
    const [classes, setClasses] = useState([]);
    const [terms, setTerms] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [topics, setTopics] = useState([]);

    // State for selected values
    const [selectedClass, setSelectedClass] = useState("");
    const [selectedTerm, setSelectedTerm] = useState("");
    const [selectedSubject, setSelectedSubject] = useState("");
    const [selectedTopic, setSelectedTopic] = useState("");

    // State for names
    const [selectedSubjectName, setSelectedSubjectName] = useState("");
    const [selectedTopicName, setSelectedTopicName] = useState("");

    // View dropdown states
    const [viewSelectedClass, setViewSelectedClass] = useState("");
    const [viewSelectedTerm, setViewSelectedTerm] = useState("");
    const [viewSelectedSubject, setViewSelectedSubject] = useState("");
    const [viewSelectedTopic, setViewSelectedTopic] = useState("");
    const [viewSelectedClassName, setViewSelectedClassName] = useState("");
    const [viewSelectedTermName, setViewSelectedTermName] = useState("");
    const [viewSelectedSubjectName, setViewSelectedSubjectName] = useState("");
    const [viewSelectedTopicName, setViewSelectedTopicName] = useState("");

    // Loading states
    const [loading, setLoading] = useState({
        classes: true,
        terms: false,
        subjects: false,
        topics: false
    });

    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const [showSoundSettingsModal, setShowSoundSettingsModal] = useState(false);
    const [showClassesDropdown, setShowClassesDropdown] = useState(false);
    const [showTermsDropdown, setShowTermsDropdown] = useState(false);
    const [showSubjectsDropdown, setShowSubjectsDropdown] = useState(false);
    const [showTopicsDropdown, setShowTopicsDropdown] = useState(false);
    const [isNavbarCollapsed, setIsNavbarCollapsed] = useState(true);
    const { playBgSound } = useSound();

    // Initialize dropdowns
    useEffect(() => {
        const dropdownElements = document.querySelectorAll('.dropdown-toggle');
        dropdownElements.forEach((dropdownElement) => {
            new Dropdown(dropdownElement);
        });

        return () => {
            dropdownElements.forEach((dropdownElement) => {
                const dropdownInstance = Dropdown.getInstance(dropdownElement);
                if (dropdownInstance) {
                    dropdownInstance.dispose();
                }
            });
        };
    }, []);

    // Load initial data
    useEffect(() => {
        try {
            setClasses(allQuizData.classes);
            setError(null);
        } catch (err) {
            console.error("Error loading classes:", err);
            setError("Failed to load quiz data. Please refresh the page.");
        } finally {
            setLoading(prev => ({ ...prev, classes: false }));
            playBgSound();
        }
    }, [playBgSound]);

    // Filter terms when class changes
    useEffect(() => {
        if (!selectedClass) {
            setTerms([]);
            return;
        }

        try {
            setLoading(prev => ({ ...prev, terms: true }));
            setError(null);
            const filteredTerms = allQuizData.terms.filter(term => term.classId == selectedClass);
            setTerms(filteredTerms);
        } catch (err) {
            console.error("Error loading terms:", err);
            setError("Failed to load terms data.");
        } finally {
            setLoading(prev => ({ ...prev, terms: false }));
        }
    }, [selectedClass]);

    // Filter subjects when class or term changes
    useEffect(() => {
        if (!selectedClass || !selectedTerm) {
            setSubjects([]);
            setSelectedSubject("");
            setSelectedSubjectName("");
            return;
        }

        try {
            setLoading(prev => ({ ...prev, subjects: true }));
            setError(null);
            const filteredSubjects = allQuizData.subjects.filter(
                subject => subject.classId == selectedClass && subject.termId == selectedTerm
            );
            setSubjects(filteredSubjects);
            setSelectedSubject("");
            setSelectedSubjectName("");
        } catch (err) {
            console.error("Error loading subjects:", err);
            setError("Failed to load subjects data.");
        } finally {
            setLoading(prev => ({ ...prev, subjects: false }));
        }
    }, [selectedClass, selectedTerm]);

    // Filter topics when class, term or subject changes
    useEffect(() => {
        if (!selectedClass || !selectedTerm || !selectedSubject) {
            setTopics([]);
            setSelectedTopic("");
            setSelectedTopicName("");
            return;
        }

        try {
            setLoading(prev => ({ ...prev, topics: true }));
            setError(null);
            const filteredTopics = allQuizData.topics.filter(
                topic => topic.classId == selectedClass && 
                        topic.termId == selectedTerm && 
                        topic.subjectId == selectedSubject
            );
            setTopics(filteredTopics);
            setSelectedTopic("");
            setSelectedTopicName("");
        } catch (err) {
            console.error("Error loading topics:", err);
            setError("Failed to load topics data.");
        } finally {
            setLoading(prev => ({ ...prev, topics: false }));
        }
    }, [selectedClass, selectedTerm, selectedSubject]);

    // View dropdown handlers
    const [viewTerms, setViewTerms] = useState([]);
    useEffect(() => {
        if (!viewSelectedClass) {
            setViewTerms([]);
            return;
        }

        try {
            setLoading(prev => ({ ...prev, terms: true }));
            setError(null);
            const filteredTerms = allQuizData.terms.filter(term => term.classId == viewSelectedClass);
            setViewTerms(filteredTerms);
        } catch (err) {
            console.error("Error loading view terms:", err);
            setError("Failed to load terms data.");
        } finally {
            setLoading(prev => ({ ...prev, terms: false }));
        }
    }, [viewSelectedClass]);

    const [viewSubjects, setViewSubjects] = useState([]);
    useEffect(() => {
        if (!viewSelectedClass || !viewSelectedTerm) {
            setViewSubjects([]);
            setViewSelectedSubject("");
            setViewSelectedSubjectName("");
            return;
        }

        try {
            setLoading(prev => ({ ...prev, subjects: true }));
            setError(null);
            const filteredSubjects = allQuizData.subjects.filter(
                subject => subject.classId == viewSelectedClass && subject.termId == viewSelectedTerm
            );
            setViewSubjects(filteredSubjects);
            setViewSelectedSubject("");
            setViewSelectedSubjectName("");
        } catch (err) {
            console.error("Error loading view subjects:", err);
            setError("Failed to load subjects data.");
        } finally {
            setLoading(prev => ({ ...prev, subjects: false }));
        }
    }, [viewSelectedClass, viewSelectedTerm]);

    const [viewTopics, setViewTopics] = useState([]);
    useEffect(() => {
        if (!viewSelectedClass || !viewSelectedTerm || !viewSelectedSubject) {
            setViewTopics([]);
            setViewSelectedTopic("");
            setViewSelectedTopicName("");
            return;
        }

        try {
            setLoading(prev => ({ ...prev, topics: true }));
            setError(null);
            const filteredTopics = allQuizData.topics.filter(
                topic => topic.classId == viewSelectedClass && 
                        topic.termId == viewSelectedTerm && 
                        topic.subjectId == viewSelectedSubject
            );
            setViewTopics(filteredTopics);
            setViewSelectedTopic("");
            setViewSelectedTopicName("");
        } catch (err) {
            console.error("Error loading view topics:", err);
            setError("Failed to load topics data.");
        } finally {
            setLoading(prev => ({ ...prev, topics: false }));
        }
    }, [viewSelectedClass, viewSelectedTerm, viewSelectedSubject]);

    // Selection handlers
    const handleClassChange = (e) => {
        const classId = e.target.value;
        setSelectedClass(classId);
        setSelectedTerm("");
        setSelectedSubject("");
        setSelectedTopic("");
        setSelectedSubjectName("");
        setSelectedTopicName("");
    };

    const handleTermChange = (e) => {
        const termId = e.target.value;
        setSelectedTerm(termId);
        setSelectedSubject("");
        setSelectedTopic("");
        setSelectedSubjectName("");
        setSelectedTopicName("");
    };

    const handleSubjectChange = (e) => {
        const subjectId = e.target.value;
        setSelectedSubject(subjectId);
        const subject = subjects.find(s => s._id == subjectId);
        setSelectedSubjectName(subject ? subject.name : "");
        setSelectedTopic("");
        setSelectedTopicName("");
    };

    const handleTopicChange = (e) => {
        const topicId = e.target.value;
        setSelectedTopic(topicId);
        const topic = topics.find(t => t._id == topicId);
        setSelectedTopicName(topic ? topic.name : "");
    };

    // View dropdown selection handlers
    const handleViewClassSelect = (classId, className) => {
        setViewSelectedClass(classId);
        setViewSelectedClassName(className);
        setViewSelectedTerm("");
        setViewSelectedTermName("");
        setViewSelectedSubject("");
        setViewSelectedSubjectName("");
        setViewSelectedTopic("");
        setViewSelectedTopicName("");
        setShowClassesDropdown(false);
        setShowTermsDropdown(true);
    };

    const handleViewTermSelect = (termId, termName) => {
        setViewSelectedTerm(termId);
        setViewSelectedTermName(termName);
        setViewSelectedSubject("");
        setViewSelectedSubjectName("");
        setViewSelectedTopic("");
        setViewSelectedTopicName("");
        setShowTermsDropdown(false);
        setShowSubjectsDropdown(true);
    };

    const handleViewSubjectSelect = (subjectId, subjectName) => {
        setViewSelectedSubject(subjectId);
        setViewSelectedSubjectName(subjectName);
        setViewSelectedTopic("");
        setViewSelectedTopicName("");
        setShowSubjectsDropdown(false);
        setShowTopicsDropdown(true);
    };

    const handleViewTopicSelect = (topicId, topicName) => {
        setViewSelectedTopic(topicId);
        setViewSelectedTopicName(topicName);
        setShowTopicsDropdown(false);
    };

    // Start quiz handler - UPDATED TO INCLUDE URL PARAMS
    const handleStartQuiz = () => {
        if (!selectedClass || !selectedTerm || !selectedSubject || !selectedTopic) {
            setError("Please select all options before starting the quiz");
            return;
        }

        // Get names for URL
        const subjectObj = subjects.find(s => s._id == selectedSubject);
        const topicObj = topics.find(t => t._id == selectedTopic);

        // Filter questions
        const filteredQuestions = allQuizData.questions.filter(
            q => q.classId == selectedClass &&
                 q.termId == selectedTerm &&
                 q.subjectId == selectedSubject &&
                 q.topicId == selectedTopic
        );

        if (filteredQuestions.length === 0) {
            setError("No questions found for the selected criteria. Please try different options.");
            return;
        }

        // Create query string
        const queryParams = new URLSearchParams({
            classId: selectedClass,
            termId: selectedTerm,
            subjectId: selectedSubject,
            topicId: selectedTopic,
            subjectName: subjectObj?.name || '',
            topicName: topicObj?.name || ''
        }).toString();

        // Navigate with query parameters
        navigate(`/quiz?${queryParams}`, {
            state: {
                questions: filteredQuestions,
                className: classes.find(c => c._id == selectedClass)?.name || '',
                termName: terms.find(t => t._id == selectedTerm)?.name || '',
                subjectName: subjectObj?.name || '',
                topicName: topicObj?.name || ''
            }
        });
    };

    // Other handlers
    const handleOpenSoundSettings = () => {
        setShowSoundSettingsModal(true);
    };
    const handleCloseSoundSettings = () => {
        setShowSoundSettingsModal(false);
    };

    const toggleClassesDropdown = () => {
        if (showClassesDropdown) {
            setViewSelectedClass("");
            setViewSelectedClassName("");
            setViewSelectedTerm("");
            setViewSelectedTermName("");
            setViewSelectedSubject("");
            setViewSelectedSubjectName("");
            setViewSelectedTopic("");
            setViewSelectedTopicName("");
        }
        setShowClassesDropdown(prev => !prev);
        setShowTermsDropdown(false);
        setShowSubjectsDropdown(false);
        setShowTopicsDropdown(false);
    };

    const toggleTermsDropdown = () => {
        if (showTermsDropdown) {
            setViewSelectedTerm("");
            setViewSelectedTermName("");
            setViewSelectedSubject("");
            setViewSelectedSubjectName("");
            setViewSelectedTopic("");
            setViewSelectedTopicName("");
        }
        setShowTermsDropdown(prev => !prev);
        setShowClassesDropdown(false);
        setShowSubjectsDropdown(false);
        setShowTopicsDropdown(false);
    };

    const toggleSubjectsDropdown = () => {
        if (showSubjectsDropdown) {
            setViewSelectedSubject("");
            setViewSelectedSubjectName("");
            setViewSelectedTopic("");
            setViewSelectedTopicName("");
        }
        setShowSubjectsDropdown(prev => !prev);
        setShowClassesDropdown(false);
        setShowTermsDropdown(false);
        setShowTopicsDropdown(false);
    };

    const toggleTopicsDropdown = () => {
        if (showTopicsDropdown) {
            setViewSelectedTopic("");
            setViewSelectedTopicName("");
        }
        setShowTopicsDropdown(prev => !prev);
        setShowClassesDropdown(false);
        setShowTermsDropdown(false);
        setShowSubjectsDropdown(false);
    };

    const toggleNavbar = () => {
        setIsNavbarCollapsed(prev => !prev);
        setShowClassesDropdown(false);
        setShowTermsDropdown(false);
        setShowSubjectsDropdown(false);
        setShowTopicsDropdown(false);
    };

    if (error) {
        return (
            <RetryComponent 
                error={error}
                onRetry={() => {
                    setError(null);
                    window.location.reload();
                }}
            />
        );
    }

    return (
        <div className="container mt-4">
            {/* Navigation Bar */}
            <nav className="navbar navbar-expand-lg navbar-light bg-light mb-4 rounded">
                <div className="container-fluid">
                    <button
                        className="navbar-toggler"
                        type="button"
                        onClick={toggleNavbar}
                        aria-controls="navbarNav"
                        aria-expanded={!isNavbarCollapsed}
                        aria-label="Toggle navigation"
                    >
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className={`collapse navbar-collapse ${isNavbarCollapsed ? '' : 'show'}`} id="navbarNav">
                        <ul className="navbar-nav me-auto">
                            <li className="nav-item">
                                <NavLink to="/about-app" className="nav-link" onClick={() => setIsNavbarCollapsed(true)}>About the App</NavLink>
                            </li>
                            <li className="nav-item">
                                <NavLink to="/benefit-app" className="nav-link" onClick={() => setIsNavbarCollapsed(true)}>Benefits</NavLink>
                            </li>
                            <li className="nav-item">
                                <NavLink to="/" className="nav-link" onClick={() => setIsNavbarCollapsed(true)}>Home</NavLink>
                            </li>
                            <li className="nav-item">
                                <NavLink to="/view-score" className="nav-link" onClick={() => setIsNavbarCollapsed(true)}>View Scores</NavLink>
                            </li>
                            <li className="nav-item">
                                <button className="nav-link" onClick={() => { handleOpenSoundSettings(); setIsNavbarCollapsed(true); }}>
                                    Set Sound
                                </button>
                            </li>
                        </ul>

                        <div className="d-none d-lg-flex align-items-center ms-auto">
                            <div className="view-section-container position-relative">
                                <div className="view-label-desktop text-center mb-1">
                                    <span className="text-muted fw-bold">View</span>
                                </div>
                                
                                <div className="view-dropdowns-wrapper d-flex gap-2">
                                    <div className="nav-item dropdown">
                                        <button
                                            className="nav-link dropdown-toggle"
                                            type="button"
                                            aria-expanded={showClassesDropdown}
                                            onClick={toggleClassesDropdown}
                                        >
                                            {viewSelectedClassName || "Classes"}
                                        </button>
                                        <div className={`dropdown-menu ${showClassesDropdown ? 'show' : ''}`}>
                                            {loading.classes ? (
                                                <div className="dropdown-item text-muted">Loading classes...</div>
                                            ) : classes.length > 0 ? (
                                                classes.map(cls => (
                                                    <div key={cls._id}>
                                                        <button
                                                            className={`dropdown-item ${viewSelectedClass === cls._id ? 'active' : ''}`}
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                handleViewClassSelect(cls._id, cls.name);
                                                            }}
                                                        >
                                                            {cls.name} {cls.gradeLevel ? `(Grade ${cls.gradeLevel})` : ''}
                                                        </button>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="dropdown-item text-muted">No classes found.</div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="nav-item dropdown">
                                        <button
                                            className="nav-link dropdown-toggle"
                                            type="button"
                                            aria-expanded={showTermsDropdown}
                                            onClick={toggleTermsDropdown}
                                            disabled={!viewSelectedClass || loading.terms}
                                        >
                                            {viewSelectedTermName || "Terms"}
                                        </button>
                                        <div className={`dropdown-menu ${showTermsDropdown ? 'show' : ''}`}>
                                            {!viewSelectedClass ? (
                                                <div className="dropdown-item text-muted">Select a Class first.</div>
                                            ) : loading.terms ? (
                                                <div className="dropdown-item text-muted">Loading terms...</div>
                                            ) : viewTerms.length > 0 ? (
                                                viewTerms.map(term => (
                                                    <div key={term._id}>
                                                        <button
                                                            className={`dropdown-item ${viewSelectedTerm === term._id ? 'active' : ''}`}
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                handleViewTermSelect(term._id, term.name);
                                                            }}
                                                        >
                                                            {term.name} {term.termNumber ? `(Term ${term.termNumber})` : ''}
                                                        </button>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="dropdown-item text-muted">No terms found for this class.</div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="nav-item dropdown">
                                        <button
                                            className="nav-link dropdown-toggle"
                                            type="button"
                                            aria-expanded={showSubjectsDropdown}
                                            onClick={toggleSubjectsDropdown}
                                            disabled={!viewSelectedClass || !viewSelectedTerm || loading.subjects}
                                        >
                                            {viewSelectedSubjectName || "Subjects"}
                                        </button>
                                        <div className={`dropdown-menu ${showSubjectsDropdown ? 'show' : ''}`}>
                                            {!viewSelectedClass || !viewSelectedTerm ? (
                                                <div className="dropdown-item text-muted">Select Class & Term first.</div>
                                            ) : loading.subjects ? (
                                                <div className="dropdown-item text-muted">Loading subjects...</div>
                                            ) : viewSubjects.length > 0 ? (
                                                viewSubjects.map(subject => (
                                                    <div key={subject._id}>
                                                        <button
                                                            className={`dropdown-item ${viewSelectedSubject === subject._id ? 'active' : ''}`}
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                handleViewSubjectSelect(subject._id, subject.name);
                                                            }}
                                                        >
                                                            {subject.name}
                                                        </button>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="dropdown-item text-muted">No subjects found for this selection.</div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="nav-item dropdown">
                                        <button
                                            className="nav-link dropdown-toggle"
                                            type="button"
                                            aria-expanded={showTopicsDropdown}
                                            onClick={toggleTopicsDropdown}
                                            disabled={!viewSelectedClass || !viewSelectedTerm || !viewSelectedSubject || loading.topics}
                                        >
                                            {viewSelectedTopicName || "Topics"}
                                        </button>
                                        <div className={`dropdown-menu ${showTopicsDropdown ? 'show' : ''}`}>
                                            {!viewSelectedClass || !viewSelectedTerm || !viewSelectedSubject ? (
                                                <div className="dropdown-item text-muted">Select Class, Term & Subject first.</div>
                                            ) : loading.topics ? (
                                                <div className="dropdown-item text-muted">Loading topics...</div>
                                            ) : viewTopics.length > 0 ? (
                                                viewTopics.map(topic => (
                                                    <div key={topic._id}>
                                                        <button
                                                            className={`dropdown-item ${viewSelectedTopic === topic._id ? 'active' : ''}`}
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                handleViewTopicSelect(topic._id, topic.name);
                                                            }}
                                                        >
                                                            {topic.name}
                                                        </button>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="dropdown-item text-muted">No topics found for this selection.</div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="d-lg-none w-100 mt-2">
                            <hr className="dropdown-divider" />
                            <span className="nav-link text-muted fw-bold mb-3">View Options</span>
                            
                            <div className="nav-item dropdown mb-3">
                                <button
                                    className="nav-link dropdown-toggle"
                                    type="button"
                                    aria-expanded={showClassesDropdown}
                                    onClick={toggleClassesDropdown}
                                >
                                    {viewSelectedClassName || "Classes"}
                                </button>
                                <div className={`dropdown-menu ${showClassesDropdown ? 'show' : ''}`}>
                                    {loading.classes ? (
                                        <div className="dropdown-item text-muted">Loading classes...</div>
                                    ) : classes.length > 0 ? (
                                        classes.map(cls => (
                                            <div key={cls._id}>
                                                <button
                                                    className={`dropdown-item ${viewSelectedClass === cls._id ? 'active' : ''}`}
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        handleViewClassSelect(cls._id, cls.name);
                                                    }}
                                                >
                                                    {cls.name} {cls.gradeLevel ? `(Grade ${cls.gradeLevel})` : ''}
                                                </button>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="dropdown-item text-muted">No classes found.</div>
                                    )}
                                </div>
                            </div>

                            <div className="nav-item dropdown mb-3">
                                <button
                                    className="nav-link dropdown-toggle"
                                    type="button"
                                    aria-expanded={showTermsDropdown}
                                    onClick={toggleTermsDropdown}
                                    disabled={!viewSelectedClass || loading.terms}
                                >
                                    {viewSelectedTermName || "Terms"}
                                </button>
                                <div className={`dropdown-menu ${showTermsDropdown ? 'show' : ''}`}>
                                    {!viewSelectedClass ? (
                                        <div className="dropdown-item text-muted">Select a Class first.</div>
                                    ) : loading.terms ? (
                                        <div className="dropdown-item text-muted">Loading terms...</div>
                                    ) : viewTerms.length > 0 ? (
                                        viewTerms.map(term => (
                                            <div key={term._id}>
                                                <button
                                                    className={`dropdown-item ${viewSelectedTerm === term._id ? 'active' : ''}`}
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        handleViewTermSelect(term._id, term.name);
                                                    }}
                                                >
                                                    {term.name} {term.termNumber ? `(Term ${term.termNumber})` : ''}
                                                </button>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="dropdown-item text-muted">No terms found for this class.</div>
                                    )}
                                </div>
                            </div>

                            <div className="nav-item dropdown mb-3">
                                <button
                                    className="nav-link dropdown-toggle"
                                    type="button"
                                    aria-expanded={showSubjectsDropdown}
                                    onClick={toggleSubjectsDropdown}
                                    disabled={!viewSelectedClass || !viewSelectedTerm || loading.subjects}
                                >
                                    {viewSelectedSubjectName || "Subjects"}
                                </button>
                                <div className={`dropdown-menu ${showSubjectsDropdown ? 'show' : ''}`}>
                                    {!viewSelectedClass || !viewSelectedTerm ? (
                                        <div className="dropdown-item text-muted">Select Class & Term first.</div>
                                    ) : loading.subjects ? (
                                        <div className="dropdown-item text-muted">Loading subjects...</div>
                                    ) : viewSubjects.length > 0 ? (
                                        viewSubjects.map(subject => (
                                            <div key={subject._id}>
                                                <button
                                                    className={`dropdown-item ${viewSelectedSubject === subject._id ? 'active' : ''}`}
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        handleViewSubjectSelect(subject._id, subject.name);
                                                    }}
                                                >
                                                    {subject.name}
                                                </button>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="dropdown-item text-muted">No subjects found for this selection.</div>
                                    )}
                                </div>
                            </div>

                            <div className="nav-item dropdown mb-3">
                                <button
                                    className="nav-link dropdown-toggle"
                                    type="button"
                                    aria-expanded={showTopicsDropdown}
                                    onClick={toggleTopicsDropdown}
                                    disabled={!viewSelectedClass || !viewSelectedTerm || !viewSelectedSubject || loading.topics}
                                >
                                    {viewSelectedTopicName || "Topics"}
                                </button>
                                <div className={`dropdown-menu ${showTopicsDropdown ? 'show' : ''}`}>
                                    {!viewSelectedClass || !viewSelectedTerm || !viewSelectedSubject ? (
                                        <div className="dropdown-item text-muted">Select Class, Term & Subject first.</div>
                                    ) : loading.topics ? (
                                        <div className="dropdown-item text-muted">Loading topics...</div>
                                    ) : viewTopics.length > 0 ? (
                                        viewTopics.map(topic => (
                                            <div key={topic._id}>
                                                <button
                                                    className={`dropdown-item ${viewSelectedTopic === topic._id ? 'active' : ''}`}
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        handleViewTopicSelect(topic._id, topic.name);
                                                    }}
                                                >
                                                    {topic.name}
                                                </button>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="dropdown-item text-muted">No topics found for this selection.</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            <h2 className="text-center mb-4">Setup Your Quiz</h2>

            <div className="mb-3">
                <label className="form-label">Select Class</label>
                <select
                    className={`form-select ${loading.classes ? 'is-loading' : ''}`}
                    value={selectedClass}
                    onChange={handleClassChange}
                    disabled={loading.classes}
                >
                    <option value="">
                        {loading.classes ? 'Loading classes...' : '-- Select Class --'}
                    </option>
                    {classes.map(cls => (
                        <option key={cls._id} value={cls._id}>
                            {cls.name} {cls.gradeLevel ? `(Grade ${cls.gradeLevel})` : ''}
                        </option>
                    ))}
                </select>
                {loading.classes && (
                    <div className="mt-2 text-muted">
                        <small>Loading classes...</small>
                    </div>
                )}
            </div>

            <div className="mb-3">
                <label className="form-label">Select Term</label>
                <select
                    className={`form-select ${loading.terms ? 'is-loading' : ''}`}
                    value={selectedTerm}
                    onChange={handleTermChange}
                    disabled={loading.terms || !selectedClass}
                >
                    <option value="">
                        {loading.terms ? 'Loading terms...' : '-- Select Term --'}
                    </option>
                    {terms.map(term => (
                        <option key={term._id} value={term._id}>
                            {term.name} {term.termNumber ? `(Term ${term.termNumber})` : ''}
                        </option>
                    ))}
                </select>
                {loading.terms && (
                    <div className="mt-2 text-muted">
                        <small>Loading terms...</small>
                    </div>
                )}
            </div>

            <div className="mb-3">
                <label className="form-label">Select Subject</label>
                <select
                    className={`form-select ${loading.subjects ? 'is-loading' : ''}`}
                    value={selectedSubject}
                    onChange={handleSubjectChange}
                    disabled={loading.subjects || !selectedClass || !selectedTerm}
                >
                    <option value="">
                        {loading.subjects ? 'Loading subjects...' : '-- Select Subject --'}
                    </option>
                    {subjects.map(subject => (
                        <option key={subject._id} value={subject._id}>
                            {subject.name}
                        </option>
                    ))}
                </select>
                {loading.subjects && (
                    <div className="mt-2 text-muted">
                        <small>Loading subjects...</small>
                    </div>
                )}
            </div>

            <div className="mb-3">
                <label className="form-label">Select Topic</label>
                <select
                    className={`form-select ${loading.topics ? 'is-loading' : ''}`}
                    value={selectedTopic}
                    onChange={handleTopicChange}
                    disabled={loading.topics || !selectedClass || !selectedTerm || !selectedSubject}
                >
                    <option value="">
                        {loading.topics ? 'Loading topics...' : '-- Select Topic --'}
                    </option>
                    {topics.map(topic => (
                        <option key={topic._id} value={topic._id}>
                            {topic.name}
                        </option>
                    ))}
                </select>
                {loading.topics && (
                    <div className="mt-2 text-muted">
                        <small>Loading topics...</small>
                    </div>
                )}
            </div>

            <div className="text-center my-4">
                <button
                    className="btn btn-primary btn-lg px-5"
                    onClick={handleStartQuiz}
                    disabled={
                        loading.classes ||
                        loading.terms ||
                        loading.subjects ||
                        loading.topics ||
                        !selectedClass ||
                        !selectedTerm ||
                        !selectedSubject ||
                        !selectedTopic
                    }
                >
                    {loading.classes || loading.terms || loading.subjects || loading.topics ? (
                        <>
                            <span
                                className="spinner-border spinner-border-sm me-2"
                                role="status"
                                aria-hidden="true"
                            ></span>
                            Loading Options...
                        </>
                    ) : (
                        "Start My Quiz"
                    )}
                </button>
            </div>

            <div className="text-center mb-4">
                <img
                    src="/cheering-child.png"
                    alt="Happy child cheering you on"
                    className="img-fluid"
                    style={{ maxWidth: "200px" }}
                />
                <p className="mt-2 text-muted">"You've got what it takes to succeed!"</p>
            </div>

            <footer className="text-center text-muted border-top pt-3 mt-4">
                <small>
                    RG Quiz App | <span title="Current year">©2025</span> | Gbenga Joshua Afolabi
                </small>
            </footer>

            <div className={`modal fade ${showSoundSettingsModal ? 'show d-block' : ''}`} tabIndex="-1" role="dialog" aria-labelledby="soundSettingsModalLabel" aria-hidden={!showSoundSettingsModal}>
                <div className="modal-dialog modal-dialog-centered modal-md" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="soundSettingsModalLabel">Sound Settings</h5>
                            <button type="button" className="btn-close" aria-label="Close" onClick={handleCloseSoundSettings}></button>
                        </div>
                        <div className="modal-body">
                            <SoundSettings />
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={handleCloseSoundSettings}>Close</button>
                        </div>
                    </div>
                </div>
            </div>
            {showSoundSettingsModal && <div className="modal-backdrop fade show"></div>}
        </div>
    );
};

export default SetupPage;