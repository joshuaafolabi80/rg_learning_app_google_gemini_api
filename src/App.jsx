import React from "react";
import { Routes, Route } from "react-router-dom";
import HomePage from "./HomePage";
import SetupPage from "./SetupPage";
import QuizPage from "./QuizPage"; // ✅ Import your new quiz page
import AboutApp from "./pages/AboutApp";
import BenefitApp from "./pages/BenefitApp";
import ViewScore from "./pages/ViewScore"; // adjust the path as needed


function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/setup" element={<SetupPage />} />
      <Route path="/quiz" element={<QuizPage />} /> {/* ✅ Add route here */}
      <Route path="/about-app" element={<AboutApp />} />
      <Route path="/benefit-app" element={<BenefitApp />} />
      <Route path="/view-score" element={<ViewScore />} />
    </Routes>
  );
}

export default App;
