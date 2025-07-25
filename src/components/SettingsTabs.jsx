// SettingsTabs.jsx
import React, { useState } from 'react';
import { useSound } from '../context/SoundContext'; // Correct import
import { FaCog, FaVolumeUp, FaInfoCircle } from 'react-icons/fa';

const SettingsTabs = ({ activeTab = 'general', onTabChange }) => {
  // Destructure playSound directly from useSound
  const { playSound } = useSound(); // <-- Changed from playClickSound
  const [localActiveTab, setLocalActiveTab] = useState(activeTab);

  const handleTabClick = (tab) => {
    playSound('click'); // <-- Call playSound with 'click' type
    setLocalActiveTab(tab);
    if (onTabChange) {
      onTabChange(tab);
    }
  };

  return (
    <div className="settings-tabs mb-4">
      <ul className="nav nav-tabs">
        <li className="nav-item">
          <button
            className={`nav-link ${localActiveTab === 'general' ? 'active' : ''}`}
            onClick={() => handleTabClick('general')}
          >
            <FaCog className="me-2" />
            General
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${localActiveTab === 'sound' ? 'active' : ''}`}
            onClick={() => handleTabClick('sound')}
          >
            <FaVolumeUp className="me-2" />
            Sound
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${localActiveTab === 'about' ? 'active' : ''}`}
            onClick={() => handleTabClick('about')}
          >
            <FaInfoCircle className="me-2" />
            About
          </button>
        </li>
      </ul>

      <style jsx>{`
        .settings-tabs {
          border-bottom: 1px solid #dee2e6;
        }
        .nav-tabs .nav-link {
          color: #495057;
          background-color: transparent;
          border: none;
          border-bottom: 3px solid transparent;
          padding: 0.75rem 1.25rem;
          transition: all 0.2s;
          display: flex;
          align-items: center;
        }
        .nav-tabs .nav-link:hover {
          border-bottom-color: #dee2e6;
        }
        .nav-tabs .nav-link.active {
          color: #0d6efd;
          border-bottom-color: #0d6efd;
          font-weight: 500;
        }
        .nav-tabs .nav-link:focus {
          outline: none;
          box-shadow: none;
        }
      `}</style>
    </div>
  );
};

export default SettingsTabs;