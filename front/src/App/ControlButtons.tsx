// ControlButtons.tsx

import React from 'react';
import './ControlButtons.css';

interface ControlButtonsProps {
  onStartClick: () => void;
  onStopClick: () => void;
  onApplyClick: () => void;
  recording: boolean; // 추가된 부분
}

const ControlButtons: React.FC<ControlButtonsProps> = ({ onStartClick, onStopClick, onApplyClick, recording }) => {
  return (
    <div className="control-buttons">
      <button onClick={onStartClick} className={recording ? '' : 'start-highlight'}>
        Start
      </button>
      {recording && <div className="recording-indicator"></div>}
      <button onClick={onStopClick}>Stop</button>
      <button onClick={onApplyClick}>Apply</button>
    </div>
  );
};

export default ControlButtons;
