// MindMapNode.tsx

import React from 'react';
import { Handle, NodeProps, Position } from 'reactflow';
import useStore from '../store';
import DragIcon from './DragIcon';

export type NodeData = {
  label: string;
};

function MindMapNode({ id, data }: NodeProps<NodeData>) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const isChecked = useStore((state) => state.checkedNode === id);
  const updateNodeLabel = useStore((state) => state.updateNodeLabel);
  const removeNode = useStore((state) => state.removeNode);
  const setCheckedNode = useStore((state) => state.setCheckedNode);
  const startButtonPressed = useStore((state) => state.startButtonPressed);

  React.useEffect(() => {
    setTimeout(() => {
      inputRef.current?.focus({ preventScroll: true });
    }, 1);
  }, []);

  React.useLayoutEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.width = `${data.label.length * 8}px`;
    }
  }, [data.label.length]);

  const handleRemoveClick = () => {
    if (startButtonPressed) {
      alert('Recording is in progress. Node removal is not allowed.');
      return;
    }

    // Check if the node is the root node
    if (id === 'root') {
      alert('Root node cannot be removed!');
      return;
    }

    removeNode(id);
    // Uncheck the node when removed
    setCheckedNode(null);
  };

  const handleCheckboxChange = () => {
    if (startButtonPressed) {
      alert('Recording is in progress. Checkbox actions are not allowed.');
      return;
    }

    // Check if another node is already checked
    if (isChecked) {
      // Uncheck the node
      setCheckedNode(null);
    } else {
      // Update the checked node
      setCheckedNode(id);
    }
  };

  return (
    <>
      <div className="inputWrapper">
        <div className="dragHandle">
          <DragIcon />
        </div>
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={isChecked}
            onChange={handleCheckboxChange}
            disabled={startButtonPressed}
          />
        </label>
        <input
          value={data.label}
          onChange={(evt) => updateNodeLabel(id, evt.target.value)}
          className="input"
          ref={inputRef}
        />
        {id !== 'root' && (
          <button
            className="remove-button"
            onClick={handleRemoveClick}
            disabled={startButtonPressed}
          >
            x
          </button>
        )}
      </div>

      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Top} />
    </>
  );
}

export default MindMapNode;