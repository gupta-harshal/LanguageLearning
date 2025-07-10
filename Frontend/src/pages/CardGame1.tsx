import React, { useState } from 'react';
import Flashcard from '../components/flashcard';
import Cloud from '../components/cloud';
export default function CardGame1() {
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
            <Cloud text="Hello!" />
        </div>
    )
}