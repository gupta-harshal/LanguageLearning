// src/components/AudioBatchStreaming.tsx
import React, { useRef, useState, useEffect } from "react";
import { io, Socket } from "socket.io-client";

const SOCKET_URL = "http://localhost:4000";
const WORD_THRESHOLD = 8;
const SILENCE_TIMEOUT_MS = 4000;

const AudioBatchStreaming: React.FC = () => {
  const socketRef = useRef<Socket | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const audioCache = useRef<Blob[]>([]);
  const fullRecording = useRef<Blob[]>([]);
  const wordCountRef = useRef(0);
  const silenceTimerRef = useRef<number | null>(null);

  const [isRecording, setIsRecording] = useState(false);
  const [lastTranscript, setLastTranscript] = useState("");
  const [lastAccuracy, setLastAccuracy] = useState<number | null>(null);
  const [audioURL, setAudioURL] = useState("");

  useEffect(() => {
    const socket = io(SOCKET_URL);
    socketRef.current = socket;

    socket.on("connect", () => console.log("✅ Connected:", socket.id));
    socket.on("transcription-result", (data) => {
      setLastTranscript(data.transcript);
      setLastAccuracy(data.accuracy);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  async function startRecording() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream, {
      mimeType: "audio/webm;codecs=opus"
    });
    recorderRef.current = recorder;
    audioCache.current = [];
    fullRecording.current = [];
    setLastTranscript("");
    setLastAccuracy(null);
    setAudioURL("");
    setIsRecording(true);

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioCache.current.push(event.data);
        quickLocalWordCount().then((num) => {
          wordCountRef.current += num;
          resetSilenceTimer();
          if (wordCountRef.current >= WORD_THRESHOLD) sendBatch();
        });
      }
    };

    recorder.start(1000);
  }

  function stopRecording() {
    if (recorderRef.current) {
      recorderRef.current.stop();
      recorderRef.current = null;
    }
    clearSilenceTimer();
    setIsRecording(false);

    if (fullRecording.current.length > 0) {
      const allBlob = new Blob(fullRecording.current, {
        type: "audio/webm;codecs=opus"
      });
      const url = URL.createObjectURL(allBlob);
      setAudioURL((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return url;
      });
    }
  }

  function sendBatch() {
    if (audioCache.current.length === 0) return;

    const combined = new Blob(audioCache.current, {
      type: "audio/webm;codecs=opus"
    });

    fullRecording.current.push(...audioCache.current); // store final copy

    combined.arrayBuffer().then((buffer) => {
      console.log("📤 Sending valid WebM batch:", buffer.byteLength, "bytes");
      socketRef.current?.emit("audio-batch", buffer);
    });

    audioCache.current = [];
    wordCountRef.current = 0;
    clearSilenceTimer();
  }

  function resetSilenceTimer() {
    clearSilenceTimer();
    silenceTimerRef.current = window.setTimeout(() => {
      if (audioCache.current.length > 0) sendBatch();
    }, SILENCE_TIMEOUT_MS);
  }

  function clearSilenceTimer() {
    if (silenceTimerRef.current !== null) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  }

  function quickLocalWordCount(): Promise<number> {
    return Promise.resolve(2);
  }

  return (
    <div className="min-h-screen p-6 bg-gray-100 flex justify-center">
      <div className="max-w-lg w-full bg-white rounded-lg shadow p-4">
        <h1 className="text-xl font-bold">🎙 Batch Audio Transcription</h1>
        <div className="flex gap-4 mt-4">
          <button
            onClick={startRecording}
            disabled={isRecording}
            className={`flex-1 py-2 rounded text-white ${
              isRecording ? "bg-gray-400" : "bg-green-500 hover:bg-green-600"
            }`}
          >
            Start Recording
          </button>
          <button
            onClick={stopRecording}
            disabled={!isRecording}
            className={`flex-1 py-2 rounded text-white ${
              !isRecording ? "bg-gray-400" : "bg-red-500 hover:bg-red-600"
            }`}
          >
            Stop Recording
          </button>
        </div>

        {lastTranscript && (
          <div className="mt-4 p-3 border rounded bg-gray-50">
            <strong>Transcript:</strong> {lastTranscript} <br />
            <strong>Accuracy:</strong>{" "}
            {lastAccuracy !== null ? `${lastAccuracy.toFixed(2)}%` : "N/A"}
          </div>
        )}

        {audioURL && (
          <div className="mt-4">
            <h3 className="font-semibold">Full Recording:</h3>
            <audio controls src={audioURL} className="w-full" />
          </div>
        )}
      </div>
    </div>
  );
};

export default AudioBatchStreaming;
