// src/pages/AboutApp.jsx
import React from "react";
import { Link } from "react-router-dom";

export default function AboutApp() {
  return (
    <div className="container py-5">
      <h2 className="text-center mb-4">How the App Works</h2>
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <ol className="list-group list-group-numbered mb-4">
                <li className="list-group-item">
                  <strong>Select Subject and Term:</strong> Start by choosing your child’s class, term, subject, and topic from the dropdowns on the homepage.
                </li>
                <li className="list-group-item">
                  <strong>Answer Questions:</strong> Your child answers multiple-choice questions tailored to the Nigerian curriculum.
                </li>
                <li className="list-group-item">
                  <strong>Get Score & Learn:</strong> Instantly see results, correct answers, and explanations for learning improvement.
                </li>
              </ol>
              <Link to="/setup" className="btn btn-primary mt-3">← Back to Quiz Setup</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
