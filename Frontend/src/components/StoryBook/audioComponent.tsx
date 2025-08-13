import React, { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";

const SOCKET_URL = "http://localhost:4000"; 

const AudioStreaming: React.FC = () => {
  const socketRef = useRef<Socket | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);

  useEffect(() => {
    // Connect to Socket.IO server when component mounts
    const socket = io(SOCKET_URL);
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Connected to audio stream server:", socket.id);
    });

    socket.on("transcription-result", ({ transcript, accuracy }) => {
      console.log("Transcript:", transcript);
      console.log("Accuracy:", accuracy.toFixed(2) + "%");
    });

    socket.on("error", (err) => {
      console.error("Server error:", err);
    });

    // Start microphone streaming
    startStreaming();

    return () => {
      stopStreaming();
      socket.disconnect();
    };
  }, []);

  async function startStreaming() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      recorderRef.current = recorder;

      recorder.ondataavailable = async (event) => {
        if (event.data.size > 0 && socketRef.current) {
          const buffer = await event.data.arrayBuffer();
          socketRef.current.emit("audio-chunk", buffer);
        }
      };

      // Send audio chunks every 1 second
      recorder.start(1000);
    } catch (err) {
      console.error("Microphone error:", err);
    }
  }

  function stopStreaming() {
    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      recorderRef.current.stop();
      recorderRef.current = null;
    }
  }

  return (
    <div>
      <h2>Live Audio Transcription</h2>
      <p>Streaming audio to backend for transcription...</p>
    </div>
  );
};

export default AudioStreaming;
