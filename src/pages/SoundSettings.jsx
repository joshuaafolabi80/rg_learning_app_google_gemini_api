// src/pages/SoundSettings.jsx
import React from 'react';
import { useSound } from '../context/SoundContext'; // Adjust path if needed
import { Link, NavLink } from 'react-router-dom'; // For navigation tabs
import SettingsTabs from '../components/SettingsTabs'; // If you plan to use this for general settings navigation

/**
 * SoundSettings Component
 * This component provides a user interface for customizing various sound aspects
 * of the application, including overall sound toggle, global volume control,
 * and selection of specific sound effects for different events (click, correct, wrong, background).
 */
const SoundSettings = () => {
  // Destructure relevant state and functions from the SoundContext
  const {
    soundOn,             // Boolean: indicates if overall sound is enabled
    toggleSound,         // Function: toggles the overall sound state
    volume,              // Number: global volume level (0-100)
    setVolume,           // Function: sets the global volume level
    soundSettings,       // Object: current selected sound files for each type (e.g., {click: 'click1.mp3'})
    updateSoundSetting,  // Function: updates a specific sound setting (e.g., updateSoundSetting('click', 'new-click.mp3'))
    availableSounds,     // Object: categorized list of all available sound files
    playSound,           // Function: plays a specific sound type (e.g., playSound('click'))
  } = useSound();

  return (
    // Main container for sound settings, with Bootstrap padding
    <div className="container p-5">
      {/* Navigation Tabs - These tabs are typical for full page layouts.
          If this component is primarily used within a modal, these tabs
          might be redundant or styled differently. Keeping them for completeness
          based on previous structure. */}
      <nav className="mb-4">
        <ul className="nav nav-tabs">
          <li className="nav-item">
            <NavLink to="/about-app" className="nav-link">About the App / How it Works</NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/benefit-app" className="nav-link">Benefits (for Adults)</NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/" className="nav-link">Home</NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/view-score" className="nav-link text-success fw-bold">View My Score / Performance</NavLink>
          </li>
          <li className="nav-item">
            {/* NavLink for Sound Settings itself, marked active when on this page */}
            <NavLink to="/sound-settings" className="nav-link active">Sound Settings</NavLink>
          </li>
        </ul>
      </nav>

      <h2 className="mb-4 text-center">Sound Settings</h2>

      {/* Card container for the main sound control elements */}
      <div className="card shadow p-4 mb-4">
        <p className="lead text-center mb-4">Customize the sounds for your quiz experience.</p>

        {/* Overall Sound Toggle Switch */}
        <div className="mb-4 d-flex justify-content-center align-items-center">
          <span className="me-3 fs-5">Overall Sound:</span>
          <div className="form-check form-switch">
            <input
              className="form-check-input"
              type="checkbox"
              id="soundToggleSwitch"
              checked={soundOn} // Binds to the `soundOn` state
              onChange={toggleSound} // Toggles sound on/off when changed
              style={{ transform: 'scale(1.5)' }} // Makes the switch larger
            />
            <label className="form-check-label ms-2 fs-5" htmlFor="soundToggleSwitch">
              Sound {soundOn ? "On" : "Off"} {/* Displays current sound status */}
            </label>
          </div>
        </div>

        {/* Global Volume Control Range Slider */}
        <div className="mb-4">
          <label htmlFor="volumeRange" className="form-label">Global Volume: {volume}%</label>
          <input
            type="range"
            className="form-range"
            id="volumeRange"
            min="0"
            max="100"
            value={volume} // Binds to the `volume` state
            onChange={(e) => setVolume(parseInt(e.target.value))} // Updates volume, parsing value to integer
            disabled={!soundOn} // Disables if overall sound is off
          />
        </div>

        {/* Individual Sound Type Selectors - Dynamically rendered based on `availableSounds` */}
        {Object.keys(availableSounds).map((type) => (
          <div className="mb-3 row align-items-center" key={type}>
            <label htmlFor={`${type}Sound`} className="col-sm-4 col-form-label text-capitalize">
              {/* Formats the sound type string (e.g., "correct" -> "Correct") */}
              {type.replace(/([A-Z])/g, ' $1').trim()} Sound:
            </label>
            <div className="col-sm-6">
              <select
                className="form-select"
                id={`${type}Sound`}
                value={soundSettings[type] || ''} // Binds to the specific sound setting for this type
                onChange={(e) => updateSoundSetting(type, e.target.value)} // Updates the sound file for this type
                disabled={!soundOn} // Disables if overall sound is off
              >
                <option value="">-- No Sound --</option> {/* Option to select no sound */}
                {availableSounds[type]?.map((sound) => (
                  <option key={sound.file} value={sound.file}>
                    {sound.name} {/* Displays the human-readable name of the sound */}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-sm-2 text-center">
              {soundSettings[type] && ( // Only show test button if a sound file is selected for this type
                <button
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => playSound(type)} // Plays the currently selected sound for testing
                  disabled={!soundOn} // Disables if overall sound is off
                  title={`Test ${type.replace(/([A-Z])/g, ' $1').trim()} sound`}
                >
                  <i className="fas fa-play"></i> {/* Font Awesome play icon */}
                </button>
              )}
            </div>
          </div>
        ))}
        
        <p className="mt-4 text-muted text-center">
          *Sound files are located in the <code>public/sounds/</code> directory.
        </p>
      </div>

      {/* Navigation buttons at the bottom */}
      <div className="text-center mt-4">
        <Link to="/setup" className="btn btn-secondary me-3">
          Back to Quiz Setup
        </Link>
        <Link to="/" className="btn btn-dark">
          Back to Home
        </Link>
      </div>

      {/* Footer */}
      <footer className="text-center text-muted border-top pt-3 mt-4">
        <small>
          RG Tech. | <span title="Century Icon">©2025</span> | Gbenga Joshua Afolabi
        </small>
      </footer>
    </div>
  );
};

export default SoundSettings;