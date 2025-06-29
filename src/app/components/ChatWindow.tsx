import React from 'react';

const ChatWindow = () => (
  <div className="flex flex-col h-[60vh] bg-white dark:bg-slate-800 rounded-lg shadow p-4">
    <div className="flex-1 overflow-y-auto mb-4">
      {/* Placeholder for chat messages */}
      <div className="text-gray-400 text-center mt-10">No messages yet. Start the conversation!</div>
    </div>
    <form className="flex gap-2">
      <input
        type="text"
        className="flex-1 rounded border border-gray-300 dark:border-slate-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-slate-700 dark:text-white"
        placeholder="Type your message..."
        disabled
      />
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        disabled
      >
        Send
      </button>
    </form>
  </div>
);

export default ChatWindow; 