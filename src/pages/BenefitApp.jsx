// src/pages/BenefitApp.jsx
import React from "react";
import { Link } from "react-router-dom";

export default function BenefitApp() {
  return (
    <div className="container py-5">
      <h2 className="text-center mb-4">Why Parents Love This App</h2>
      <div className="row justify-content-center">
        <div className="col-md-10">
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <ul className="list-group list-group-flush mb-4">
                <li className="list-group-item">
                  <strong>📘 Curriculum-Aligned Questions:</strong> Designed to reflect Nigeria's primary and secondary school curriculum accurately.
                </li>
                <li className="list-group-item">
                  <strong>⚡ Instant Feedback:</strong> You can see the correct answers, explanations and deep explanations (AI pre-built) immediately.
                </li>
                <li className="list-group-item">
                  <strong>🎨 User-Friendly Interface:</strong> Fun visuals and engaging layout with sound prompts that keep you motivated.
                </li>
                <li className="list-group-item">
                  <strong>📊 Performance Tracking:</strong> Helps you monitor your academic progress over time. This can also be used by Parents/Guardians to keep track of the learning progress of their children/wards in view to rewarding them (reinforced learning).
                </li>
                <li className="list-group-item">
                  <strong>📝 Customized learning path/curriculum:</strong> The system can be developed to align with your learning path/curriculum.
                </li>
              </ul>
              <Link to="/setup" className="btn btn-primary">← Back to Quiz Setup</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
