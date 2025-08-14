import React, { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

const SOCKET_URL = "http://localhost:4000";
const WORD_THRESHOLD = 8;
const SILENCE_TIMEOUT_MS = 4000;

const AudioBatchStreaming: React.FC = () => {
  const socketRef = useRef<Socket | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);

  const audioCache = useRef<Blob[]>([]);      // current batch
  const fullRecording = useRef<Blob[]>([]);   // full audio so far

  const wordCountRef = useRef<number>(0);
  const silenceTimerRef = useRef<number | null>(null);

  const [isRecording, setIsRecording] = useState(false);
  const [lastTranscript, setLastTranscript] = useState<string>("");
  const [lastAccuracy, setLastAccuracy] = useState<number | null>(null);
  const [audioURL, setAudioURL] = useState<string>("");

  useEffect(() => {
    const socket = io(SOCKET_URL);
    socketRef.current = socket;

    socket.on("connect", () => console.log("✅ Connected to WS:", socket.id));
    socket.on("transcription-result", (data: { transcript: string; accuracy: number }) => {
      setLastTranscript(data.transcript);
      setLastAccuracy(data.accuracy);
    });

    return () => {
      stopRecording();
      socket.disconnect();
    };
  }, []);

  async function startRecording() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
    recorderRef.current = recorder;

    audioCache.current = [];
    fullRecording.current = [];
    setLastTranscript("");
    setLastAccuracy(null);
    setAudioURL("");
    setIsRecording(true);

    recorder.ondataavailable = async (event) => {
      if (event.data.size > 0) {
        audioCache.current.push(event.data);

        quickLocalWordCount(event.data).then((numWords) => {
          wordCountRef.current += numWords;
          resetSilenceTimer();

          if (wordCountRef.current >= WORD_THRESHOLD) {
            sendBatchToBackend();
          }
        });
      }
    };

    recorder.start(1000);
    console.log("🎤 Recording started");
  }

  function sendBatchToBackend() {
    if (audioCache.current.length === 0) return;

    // Add batch to the full recording
    fullRecording.current.push(...audioCache.current);

    // Send batch to backend for logging
    const batchBlob = new Blob(audioCache.current, { type: "audio/webm" });
    batchBlob.arrayBuffer().then((buffer) => {
      console.log("📤 Sending batch to backend:", buffer.byteLength, "bytes");
      socketRef.current?.emit("audio-batch", buffer);
    });

    audioCache.current = []; // clear current batch (keep full recording intact)
    wordCountRef.current = 0;
    clearSilenceTimer();
  }

  function stopRecording() {
    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      recorderRef.current.stop();
      recorderRef.current = null;
    }
    clearSilenceTimer();
    setIsRecording(false);

    // Create the full combined blob for playback
    if (fullRecording.current.length > 0) {
      const combinedFull = new Blob(fullRecording.current, { type: "audio/webm" });
      const newAudioURL = URL.createObjectURL(combinedFull);
      setAudioURL((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return newAudioURL;
      });
      console.log("🛑 Recording stopped, total size:", combinedFull.size, "bytes");
    }
  }

  function resetSilenceTimer() {
    clearSilenceTimer();
    silenceTimerRef.current = window.setTimeout(() => {
      if (audioCache.current.length > 0) {
        sendBatchToBackend();
      }
    }, SILENCE_TIMEOUT_MS);
  }

  function clearSilenceTimer() {
    if (silenceTimerRef.current !== null) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  }

  function quickLocalWordCount(_: Blob): Promise<number> {
    return Promise.resolve(2); // fake 2 words/sec estimate
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
      <div className="max-w-lg w-full bg-white shadow-lg rounded-xl p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          🎙 Audio Batch Streaming (Debug Mode)
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          Sends a batch to backend when {WORD_THRESHOLD} words spoken or{" "}
          {SILENCE_TIMEOUT_MS / 1000}s silence. Keeps full recording intact until stopped.
        </p>

        <div className="flex gap-4 mb-4">
          <button
            onClick={startRecording}
            disabled={isRecording}
            className={`flex-1 py-2 px-4 rounded-md text-white font-medium transition ${
              isRecording
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-500 hover:bg-green-600"
            }`}
          >
            Start Recording
          </button>

          <button
            onClick={stopRecording}
            disabled={!isRecording}
            className={`flex-1 py-2 px-4 rounded-md text-white font-medium transition ${
              !isRecording
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-red-500 hover:bg-red-600"
            }`}
          >
            Stop Recording
          </button>
        </div>

        {lastTranscript && (
          <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              📄 Last Transcription Result
            </h3>
            <p className="mb-1">
              <strong>Transcript:</strong> {lastTranscript}
            </p>
            <p>
              <strong>Accuracy:</strong>{" "}
              {lastAccuracy !== null ? `${lastAccuracy.toFixed(2)}%` : "N/A"}
            </p>
          </div>
        )}

        {audioURL && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              🔊 Full Recorded Audio
            </h3>
            <audio src={audioURL} controls preload="none" className="w-full" />
          </div>
        )}
      </div>
    </div>
  );
};

export default AudioBatchStreaming;
