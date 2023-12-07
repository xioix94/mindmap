// ControlButtons.tsx

import React from 'react';
import './ControlButtons.css';

interface ControlButtonsProps {
  onStartClick: () => void;
  onStopClick: () => void;
  recording: boolean; // 추가된 부분
}

const ControlButtons: React.FC<ControlButtonsProps> = ({ onStartClick, onStopClick, recording }) => {
  return (
    <div className="control-buttons">
      <button onClick={onStartClick} className={recording ? '' : 'start-highlight'}>
        Start
      </button>
      {recording && <div className="recording-indicator"></div>}
      <button onClick={onStopClick}>Stop</button>
    </div>
  );
};

export default ControlButtons;
