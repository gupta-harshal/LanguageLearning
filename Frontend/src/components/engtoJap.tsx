import React, { useState } from 'react';
import { toHiragana } from 'wanakana';
import type { ChangeEvent } from 'react';

interface EngToJapProps {
  placeholder?: string;
  onChange?: (value: string) => void;
  className?: string;
}

const EngToJap: React.FC<EngToJapProps> = ({
  placeholder = 'Type in Romaji...',
  onChange,
  className = '',
}) => {
  const [value, setValue] = useState('');

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    const converted = toHiragana(input, { IMEMode: true });
    setValue(converted);
    if (onChange) onChange(converted);
  };

  return (
    <input
      type="text"
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      className={`w-full p-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
    />
  );
};

export default EngToJap;
