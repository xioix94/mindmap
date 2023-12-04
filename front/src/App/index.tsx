// index.tsx

import React, { useState, useCallback, useRef } from 'react';
import ReactFlow, {
  ConnectionLineType,
  NodeOrigin,
  Node,
  OnConnectEnd,
  OnConnectStart,
  useReactFlow,
  useStoreApi,
  Controls,
  Panel,
} from 'reactflow';
import shallow from 'zustand/shallow';

import useStore, { RFState } from './store';
import MindMapNode from './MindMapNode';
import MindMapEdge from './MindMapEdge';
import ControlButtons from './ControlButtons';

import 'reactflow/dist/style.css';

const selector = (state: RFState) => ({
  nodes: state.nodes,
  edges: state.edges,
  onNodesChange: state.onNodesChange,
  onEdgesChange: state.onEdgesChange,
  addChildNode: state.addChildNode,
});

const nodeTypes = {
  mindmap: MindMapNode,
};

const edgeTypes = {
  mindmap: MindMapEdge,
};

const nodeOrigin: NodeOrigin = [0.5, 0.5];

const connectionLineStyle = { stroke: '#F6AD55', strokeWidth: 3 };
const defaultEdgeOptions = { style: connectionLineStyle, type: 'mindmap' };

function Flow() {
  const store = useStoreApi();
  const { nodes, edges, onNodesChange, onEdgesChange, addChildNode } = useStore(
    selector,
    shallow
  );
  const { project } = useReactFlow();
  const connectingNodeId = useRef<string | null>(null);

  const getChildNodePosition = (event: MouseEvent, parentNode?: Node) => {
    const { domNode } = store.getState();

    if (!domNode || !parentNode?.positionAbsolute || !parentNode?.width || !parentNode?.height) {
      return;
    }

    const { top, left } = domNode.getBoundingClientRect();

    const panePosition = project({
      x: event.clientX - left,
      y: event.clientY - top,
    });

    return {
      x: panePosition.x - parentNode.positionAbsolute.x + parentNode.width / 2,
      y: panePosition.y - parentNode.positionAbsolute.y + parentNode.height / 2,
    };
  };

  const onConnectStart: OnConnectStart = useCallback((_, { nodeId }) => {
    connectingNodeId.current = nodeId;
  }, []);

  const onConnectEnd: OnConnectEnd = useCallback(
    (event) => {
      const { nodeInternals } = store.getState();
      const targetIsPane = (event.target as Element).classList.contains(
        'react-flow__pane'
      );
      const node = (event.target as Element).closest('.react-flow__node');

      if (node) {
        node.querySelector('input')?.focus({ preventScroll: true });
      } else if (targetIsPane && connectingNodeId.current) {
        const parentNode = nodeInternals.get(connectingNodeId.current);
        const childNodePosition = getChildNodePosition(event, parentNode);

        if (parentNode && childNodePosition) {
          addChildNode(parentNode, childNodePosition);
        }
      }
    },
    [getChildNodePosition]
  );

  const [recording, setRecording] = useState(false);

  const onStartClick = () => {
    const { checkedNode, startButtonPressed, setStartButtonPressed } = useStore.getState();

    if (!checkedNode) {
      alert('체크된 노드가 없습니다!');
      return;
    }

    if (startButtonPressed) {
      alert('이미 Start 버튼이 눌려있습니다!');
      return;
    }

    setStartButtonPressed(true);
    setRecording(true);
    console.log('Start button clicked!');
  };

  const onStopClick = () => {
    useStore.getState().setStartButtonPressed(false);
    setRecording(false);
    console.log('Stop button clicked!');
  };

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnectStart={onConnectStart}
      onConnectEnd={onConnectEnd}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      nodeOrigin={nodeOrigin}
      defaultEdgeOptions={defaultEdgeOptions}
      connectionLineStyle={connectionLineStyle}
      connectionLineType={ConnectionLineType.Straight}
      fitView
    >
      <Controls showInteractive={false} />
      <Panel position="top-left" className="header">
        <div style={{ display: 'flex', alignItems: 'center', flexDirection: 'row' }}>
          <span>Mind Map</span>
          <ControlButtons onStartClick={onStartClick} onStopClick={onStopClick} recording={recording} />
        </div>
      </Panel>
    </ReactFlow>
  );
}

export default Flow;
