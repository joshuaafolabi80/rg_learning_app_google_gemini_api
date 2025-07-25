import React from "react";
import { Routes, Route } from "react-router-dom";
import HomePage from "./HomePage";
import './App.css';
import SetupPage from "./SetupPage";
import QuizPage from "./QuizPage";
import AboutApp from "./pages/AboutApp";
import BenefitApp from "./pages/BenefitApp";
import ViewScore from "./pages/ViewScore";
import SpeakerToggle from "./components/SpeakerToggle";
import { SoundProvider } from "./context/SoundContext";

function App() {
  return (
    <SoundProvider>
      <div className="App">
        {/* SpeakerToggle with fixed positioning, moved to the left */}
        <div className="fixed-top d-flex justify-content-end p-3">
          <SpeakerToggle />
        </div>

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/setup" element={<SetupPage />} />
          {/* Updated route to handle query parameters */}
          <Route path="/quiz" element={<QuizPage />} />
          <Route path="/about-app" element={<AboutApp />} />
          <Route path="/benefit-app" element={<BenefitApp />} />
          <Route path="/view-score" element={<ViewScore />} />
          <Route path="*" element={<HomePage />} />
        </Routes>
      </div>
    </SoundProvider>
  );
}

export default App;