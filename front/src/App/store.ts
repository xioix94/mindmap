// store.ts
import {
  Edge,
  EdgeChange,
  Node,
  NodeChange,
  OnNodesChange,
  OnEdgesChange,
  applyNodeChanges,
  applyEdgeChanges,
  XYPosition,
} from 'reactflow';
import create from 'zustand';
import { nanoid } from 'nanoid/non-secure';

import { NodeData } from './MindMapNode';

export type RFState = {
  checkedNode: string | null;
  setCheckedNode: (nodeId: string | null) => void;
  nodes: Node<NodeData>[];
  edges: Edge[];
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  updateNodeLabel: (nodeId: string, label: string) => void;
  addChildNode: (parentNode: Node, position: XYPosition) => void;
  removeNode: (nodeId: string) => void;
  startButtonPressed: boolean;
  setStartButtonPressed: (pressed: boolean) => void;
  loading: boolean;  // Add the loading property
  setLoading: (loading: boolean) => void;  // Add the setLoading method
};

const useStore = create<RFState>((set, get) => ({
  loading: false,  // Initialize loading as false

  setLoading: (loading: boolean) => {
    set({ loading });
  },
  checkedNode: null,
  setCheckedNode: (nodeId: string | null) => {
    set({ checkedNode: nodeId });
  },
  nodes: [
    {
      id: 'root',
      type: 'mindmap',
      data: { label: 'React Flow Mind Map' },
      position: { x: 0, y: 0 },
      dragHandle: '.dragHandle',
    },
  ],
  edges: [],
  onNodesChange: (changes: NodeChange[]) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    });
  },
  onEdgesChange: (changes: EdgeChange[]) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  },
  updateNodeLabel: (nodeId: string, label: string) => {
    set({
      nodes: get().nodes.map((node) => {
        if (node.id === nodeId) {
          node.data = { ...node.data, label };
        }
        return node;
      }),
    });
  },
  addChildNode: (parentNode: Node, position: XYPosition) => {
    const newNode = {
      id: nanoid(),
      type: 'mindmap',
      data: { label: 'New Node' },
      position,
      dragHandle: '.dragHandle',
      parentNode: parentNode.id,
    };

    const newEdge = {
      id: nanoid(),
      source: parentNode.id,
      target: newNode.id,
    };

    set({
      nodes: [...get().nodes, newNode],
      edges: [...get().edges, newEdge],
    });
  },
  removeNode: (nodeId: string) => {
    const nodes = get().nodes;
    const edges = get().edges;

    // Check if the node has children
    const hasChildren = edges.some((edge) => edge.source === nodeId);

    // If the node has children, show a popup or take appropriate action
    if (hasChildren) {
      alert("Cannot remove node with children!");
      return;
    }

    // Uncheck the node if it is checked
    if (get().checkedNode === nodeId) {
      set({ checkedNode: null });
    }

    // Remove the node and its edges
    set({
      nodes: nodes.filter((node) => node.id !== nodeId),
      edges: edges.filter((edge) => edge.source !== nodeId && edge.target !== nodeId),
    });
  },
  startButtonPressed: false,
  setStartButtonPressed: (pressed: boolean) => {
    set({ startButtonPressed: pressed });
  },
}));

export default useStore;
