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
  
  const [stream, setStream] = useState<MediaStream | undefined>();
  const [media, setMedia] = useState<MediaRecorder | undefined>();
  const [onRec, setOnRec] = useState<boolean>(true);
  const [source, setSource] = useState<MediaStreamAudioSourceNode | undefined>();
  const [analyser, setAnalyser] = useState<ScriptProcessorNode | undefined>();
  const [audioUrl, setAudioUrl] = useState<Blob | undefined>();

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

    // 음원정보를 담은 노드를 생성하거나 음원을 실행또는 디코딩 시키는 일을 한다
    const audioCtx = new (window.AudioContext)();
    // 자바스크립트를 통해 음원의 진행상태에 직접접근에 사용된다.
    const analyser = audioCtx.createScriptProcessor(0, 1, 1);
    setAnalyser(analyser);

    function makeSound(stream: MediaStream) {
      // 내 컴퓨터의 마이크나 다른 소스를 통해 발생한 오디오 스트림의 정보를 보여준다.
      const source = audioCtx.createMediaStreamSource(stream);
      setSource(source);
      source.connect(analyser!);
      analyser!.connect(audioCtx.destination);
    }
    // 마이크 사용 권한 획득
    navigator.mediaDevices.getUserMedia({ audio: true }).then((userStream) => {
      const mediaRecorder = new MediaRecorder(userStream);
      mediaRecorder.start();
      setStream(userStream);
      setMedia(mediaRecorder);
      makeSound(userStream);

      analyser!.onaudioprocess = function (e) {
        // 3분(180초) 지나면 자동으로 음성 저장 및 녹음 중지
        if (e.playbackTime > 180) {
          userStream.getAudioTracks().forEach(function (track) {
            track.stop();
          });
          mediaRecorder.stop();
          // 메서드가 호출 된 노드 연결 해제
          analyser!.disconnect();
          audioCtx.createMediaStreamSource(userStream).disconnect();

          mediaRecorder.ondataavailable = function (e) {
            setAudioUrl(e.data);
            setOnRec(true);
          };
        } else {
          setOnRec(false);
        }
      };
    });
  };

  const onStopClick = () => {
    useStore.getState().setStartButtonPressed(false);
    setRecording(false);
    console.log('Stop button clicked!');

    // dataavailable 이벤트로 Blob 데이터에 대한 응답을 받을 수 있음
    media!.ondataavailable = function (e) {
      setAudioUrl(e.data);
      setOnRec(true);
    };

    // 모든 트랙에서 stop()을 호출해 오디오 스트림을 정지
    stream!.getAudioTracks().forEach(function (track) {
      track.stop();
    });

    // 미디어 캡처 중지
    media!.stop();
    
    // 메서드가 호출 된 노드 연결 해제
    analyser!.disconnect();
    source!.disconnect();
    onSubmitAudioFile();

  };

  const onSubmitAudioFile = useCallback(() => {

    if (audioUrl) {
      console.log(URL.createObjectURL(audioUrl)); // 출력된 링크에서 녹음된 오디오 확인 가능
    }

    // Blob 데이터 생성
    console.log(audioUrl);

    // File 생성자를 사용해 파일로 변환
    // const sound = new File([audioUrl!], "soundBlob", {
    //   lastModified: new Date().getTime(),
    //   type: "audio",
    // });
    // console.log(sound); // File 정보 출력

    const formData = new FormData();
    formData.append('audioFile', sound, 'recordedAudio.wav');
    // 서버로 전송
    fetch('http://127.0.0.1:8080/api/voice', {
      method: 'POST',
      
      body: audioUrl,
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        //return response.json();
        return response;
      })
      .then(data => {
        console.log('Server response:', data);
      })
      .catch(error => {
        console.error('Error sending Blob data to server:', error);
      });    
  }, [audioUrl]);

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
