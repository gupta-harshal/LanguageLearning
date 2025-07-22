import React, { useState } from 'react';
import type { KeyboardEvent } from 'react';
import { toHiragana } from 'wanakana';
import type { ChangeEvent } from 'react';

interface EngToJapProps {
  placeholder?: string;
  onChange?: (value: string) => void;
  onEnter?: (value: string) => void;
  className?: string;
}

const EngToJap: React.FC<EngToJapProps> = ({
  placeholder = 'Type in Romaji...',
  onChange,
  onEnter,
  className = '',
}) => {
  const [value, setValue] = useState('');

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    const converted = toHiragana(input, { IMEMode: true });
    setValue(converted);
    if (onChange) onChange(converted);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (onEnter) onEnter(value);
      setValue(''); 
    }
  };

  return (
    <input
      type="text"
      value={value}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      placeholder={placeholder}
      className={`p-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
    />
  );
};

export default EngToJap;
