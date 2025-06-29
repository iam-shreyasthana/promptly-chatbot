"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';

export default function HomePage() {
  const router = useRouter();

  const handleGoToChat = () => {
    const chatId = uuidv4();
    router.push(`/chat/${chatId}`);
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-[#f8fafc] dark:bg-[#0f172a] px-4">
      <div className="max-w-xl w-full text-center">
        <h1 className="text-4xl font-bold mb-4 text-blue-700 dark:text-blue-400">Welcome to Promptly Chatbot</h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
          Your modern AI-powered chat assistant. Sign in to start chatting!
        </p>
        <button
          onClick={handleGoToChat}
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg shadow transition cursor-pointer"
        >
          Go to Chat
        </button>
      </div>
    </main>
  );
} 