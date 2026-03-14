import { useEffect, useRef, useState } from 'react';
import { Camera, CameraOff, Mic, MicOff, PhoneOff } from 'lucide-react';
import Peer from 'simple-peer';
import { io } from 'socket.io-client';
import { Button } from '../ui/Button';
import { useAuth } from '../../context/AuthContext';

const socket = io("http://localhost:8000");

export const VideoCallOverlay = ({ partner, incomingSignal, onEnd }: { partner: any, incomingSignal?: any;  onEnd: () => void }) => {
  const { user: currentUser } = useAuth();
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  
  const myVideo = useRef<HTMLVideoElement>(null);
  const partnerVideo = useRef<HTMLVideoElement>(null);
  const connectionRef = useRef<Peer.Instance | null>(null);

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((currentStream) => {
        setStream(currentStream);
        if (myVideo.current) myVideo.current.srcObject = currentStream;

        // CREATE PEER
        const peer = new Peer({
          // If there is NO incoming signal, we are the initiator (caller)
          initiator: !incomingSignal, 
          trickle: false,
          stream: currentStream,
        });

        // IF ANSWERING: Process the incoming signal immediately
        if (incomingSignal) {
          peer.signal(incomingSignal.signal);
        }

        peer.on('signal', (data) => {
          socket.emit('signal', {
            to: partner.id,
            from: currentUser?.id,
            signal: data
          });
        });

        peer.on('stream', (remoteStream) => {
          if (partnerVideo.current) {
            partnerVideo.current.srcObject = remoteStream;
          }
        });

        socket.on('signal', (data) => {
          // Verify signal is from current partner
          if (data.from === partner.id) {
            peer.signal(data.signal);
          }
        });

        connectionRef.current = peer;
      })
      .catch(err => console.error("Media Error:", err));

    return () => {
      socket.off('signal');
      connectionRef.current?.destroy();
      stream?.getTracks().forEach(track => track.stop());
    };
  }, [partner.id, currentUser?.id, incomingSignal]);

  const toggleMic = () => {
    if (stream) {
      const enabled = stream.getAudioTracks()[0].enabled;
      stream.getAudioTracks()[0].enabled = !enabled;
      setIsMuted(enabled);
    }
  };

  const toggleCamera = () => {
    if (stream) {
      const enabled = stream.getVideoTracks()[0].enabled;
      stream.getVideoTracks()[0].enabled = !enabled;
      setIsVideoOff(enabled);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center">
      <div className="relative w-full h-full max-w-5xl flex flex-col md:flex-row gap-4 p-4">
        {/* Partner Video */}
        <div className="flex-1 bg-gray-900 rounded-2xl overflow-hidden relative border border-gray-800">
          <video playsInline ref={partnerVideo} autoPlay className="w-full h-full object-contain" />
          <div className="absolute bottom-4 left-4 text-white bg-black/60 px-4 py-2 rounded-lg backdrop-blur-md">
            {partner?.name}
          </div>
        </div>

        {/* My Video Overlay */}
        <div className="absolute top-8 right-8 w-32 h-48 md:w-48 md:h-64 bg-gray-800 rounded-xl overflow-hidden border-2 border-primary-500 shadow-2xl">
          <video playsInline muted ref={myVideo} autoPlay className="w-full h-full object-cover" />
        </div>
      </div>

      <div className="absolute bottom-10 flex space-x-6 bg-gray-900/80 p-4 rounded-full backdrop-blur-md border border-gray-700">
        <Button onClick={toggleMic} variant="ghost" className={`rounded-full p-4 ${isMuted ? 'bg-red-500 text-white' : 'text-gray-300'}`}>
          {isMuted ? <MicOff /> : <Mic />}
        </Button>
        <Button onClick={onEnd} className="rounded-full p-4 bg-red-600 hover:bg-red-700 text-white">
          <PhoneOff />
        </Button>
        <Button onClick={toggleCamera} variant="ghost" className={`rounded-full p-4 ${isVideoOff ? 'bg-red-500 text-white' : 'text-gray-300'}`}>
          {isVideoOff ? <CameraOff /> : <Camera />}
        </Button>
      </div>
    </div>
  );
};