// AudioBatchStreaming.tsx
import React, { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";

const SOCKET_URL = "http://localhost:4000";
const WORD_THRESHOLD = 8; // send after 8 words spoken
const SILENCE_TIMEOUT_MS = 2000; // send if silence for 2 seconds

const AudioBatchStreaming: React.FC = () => {
  const socketRef = useRef<Socket | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const audioCache = useRef<Blob[]>([]);
  const wordCountRef = useRef<number>(0);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const socket = io(SOCKET_URL);
    socketRef.current = socket;

    socket.on("connect", () => console.log("Connected to WS:", socket.id));
    socket.on("transcription-result", data => console.log("Result:", data));

    startRecording();

    return () => {
      stopRecording();
      socket.disconnect();
    };
  }, []);

  async function startRecording() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
    recorderRef.current = recorder;

    recorder.ondataavailable = async event => {
      if (event.data.size > 0) {
        audioCache.current.push(event.data);

        // Local speech recognition just to estimate words quickly
        quickLocalWordCount(event.data).then(numWords => {
          wordCountRef.current += numWords;
          resetSilenceTimer();

          // If enough words spoken — send batch
          if (wordCountRef.current >= WORD_THRESHOLD) {
            sendBatchToBackend();
          }
        });
      }
    };

    // Record in small fixed intervals (e.g., 1 second)
    recorder.start(1000);
  }

  function stopRecording() {
    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      recorderRef.current.stop();
      recorderRef.current = null;
    }
  }

  function sendBatchToBackend() {
    const combined = new Blob(audioCache.current, { type: "audio/webm" });
    combined.arrayBuffer().then(buffer => {
      socketRef.current?.emit("audio-batch", buffer);
    });

    // Reset buffers
    audioCache.current = [];
    wordCountRef.current = 0;
    clearSilenceTimer();
  }

  function resetSilenceTimer() {
    clearSilenceTimer();
    silenceTimerRef.current = setTimeout(() => {
      if (audioCache.current.length > 0) {
        sendBatchToBackend();
      }
    }, SILENCE_TIMEOUT_MS);
  }

  function clearSilenceTimer() {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  }

  // Using browser SpeechRecognition to count words locally
  function quickLocalWordCount(blob: Blob): Promise<number> {
    // In production, integrate with Web Speech API live — here we mock 2 words/sec of audio
    return new Promise(resolve => {
      const estimatedWords = 2; // placeholder
      resolve(estimatedWords);
    });
  }

  return (
    <div>
      <h2>Audio Batch Streaming</h2>
      <p>Recording… Will send when {WORD_THRESHOLD} words or silence</p>
    </div>
  );
};

export default AudioBatchStreaming;
