import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100 bg-gradient text-center text-black" style={{
      background: "linear-gradient(to bottom right, orange, pink, purple)"
    }}>
      <div className="p-4">
        <h1 className="display-4 fw-bold mb-3">RG Quiz & Learning System!</h1>
        <p className="lead mb-4">
          Fun & smart revision for all your subjects.
        </p>

        {/* Animated Waving Character */}
        <motion.div
          className="mb-4"
          animate={{ rotate: [0, 15, -10, 10, -5, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <img
            src="/child-waving-hand.webp"
            alt="Waving Child Character"
            className="img-fluid waving-hand"
            style={{ width: "200px" }}
          />
        </motion.div>

        <button
          className="btn btn-dark btn-lg"
          onClick={() => navigate("/setup")}
        >
          Get Started
        </button>
      </div>
    </div>
  );
};

export default HomePage;
