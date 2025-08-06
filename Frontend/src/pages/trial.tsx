// TextToSpeech.tsx
import React, { useState } from 'react';
import type { ChangeEvent, MouseEvent } from 'react';
import axios from 'axios';
import type { AxiosResponse } from 'axios';

export default function TextToSpeech() {
  const [text, setText] = useState<string>('');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSpeak = async (e: MouseEvent<HTMLButtonElement>): Promise<void> => {
    e.preventDefault();
    if (!text.trim()) return;
    setLoading(true);
    setAudioUrl(null);

    try {
      const response: AxiosResponse<Blob> = await axios.post(
        'http://localhost:8000/synthesize', // Flask middleware URL
        { text }, // JSON payload with key 'text'
        {
          responseType: 'blob',
          headers: { 'Content-Type': 'application/json' },
        }
      );

      const url = URL.createObjectURL(response.data);
      setAudioUrl(url);
    } catch (error) {
      console.error('Error fetching audio:', error);
      alert('Failed to fetch audio from TTS server');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>): void => {
    setText(e.target.value);
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white shadow-lg rounded-md mt-10">
      <label htmlFor="tts-textarea" className="block mb-2 text-gray-700 font-semibold">
        Enter text to speak:
      </label>
      <textarea
        id="tts-textarea"
        rows={5}
        className="w-full p-3 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
        placeholder="Type your text here..."
        value={text}
        onChange={handleChange}
        disabled={loading}
      />
      <button
        onClick={handleSpeak}
        disabled={loading || !text.trim()}
        className={`mt-4 px-6 py-3 rounded-md font-semibold text-white shadow-md transition
          ${
            loading || !text.trim()
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300'
          }
        `}
      >
        {loading ? 'Synthesizing...' : 'Speak'}
      </button>

      {audioUrl && (
        <div className="mt-6">
          <audio
            src={audioUrl}
            controls
            autoPlay
            className="w-full"
            onEnded={() => {
              URL.revokeObjectURL(audioUrl);
              setAudioUrl(null);
            }}
          />
        </div>
      )}
    </div>
  );
}
