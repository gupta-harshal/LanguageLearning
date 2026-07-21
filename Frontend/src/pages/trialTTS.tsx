import React, { useRef, useState } from "react";
import { apiBlob, ApiError } from "../api/client";

const TTSDemo: React.FC = () => {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const handleSend = async () => {
    setError(null);
    setLoading(true);
    try {
      const audioBlob = await apiBlob("/audio/TTS", { text });
      const audioUrl = URL.createObjectURL(audioBlob);

      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.play();
      }
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setError("Please sign in to use the TTS feature.");
      } else if (err instanceof ApiError && err.status === 429) {
        setError(err.message || "Daily TTS limit reached. Try again tomorrow.");
      } else if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Failed to fetch TTS audio.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto my-8 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4 text-center">日本語 TTS デモ</h1>
      <textarea
        className="w-full border rounded mb-4 p-2 text-lg focus:outline-none focus:ring"
        rows={4}
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button
        className={`w-full py-2 px-4 rounded text-white font-semibold ${
          loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
        }`}
        onClick={handleSend}
        disabled={loading}
      >
        {loading ? "生成中..." : "送信して再生"}
      </button>
      {error && <p className="mt-2 text-red-600 text-center">{error}</p>}
      <audio ref={audioRef} className="w-full mt-4" controls />
    </div>
  );
};

export default TTSDemo;
