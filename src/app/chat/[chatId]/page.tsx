"use client";
import React, { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useChat, useChatList } from '../../../hooks/useChat';
import { v4 as uuidv4 } from 'uuid';

// Helper to convert Firestore timestamp to JS Date
function toDate(ts: any) {
  if (!ts) return null;
  if (typeof ts === 'object' && '_seconds' in ts) {
    return new Date(ts._seconds * 1000 + Math.floor((ts._nanoseconds || 0) / 1e6));
  }
  return new Date(ts);
}

export default function ChatPage() {
  const params = useParams();
  const chatId = Array.isArray(params.chatId) ? params.chatId[0] : params.chatId;
  const { user, userLoaded, loading, sendMessage, messages, botTyping } = useChat(chatId);
  const { chats, loading: chatsLoading, refetchChatList } = useChatList();
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [hasChatted, setHasChatted] = useState(false);
  const chatAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (userLoaded && !user) {
      router.replace('/login');
    }
  }, [user, userLoaded, router]);

  useEffect(() => {
    if (chatAreaRef.current) {
      chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
    }
  }, [messages, botTyping]);

  const handleSend = async () => {
    if (message.trim()) {
      setHasChatted(true);
      await sendMessage(message, chatId);
      setMessage('');
      refetchChatList();
    }
  };

  if (!userLoaded || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-black">
        <div className="text-lg text-gray-300">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center relative font-sans">
      <div className="flex w-full max-w-5xl min-h-[80vh] h-[80vh] bg-black/80 rounded-2xl shadow-2xl">
        {/* Sidebar */}
        <aside className="hidden md:flex flex-col w-64 bg-gray-950/90 rounded-l-2xl p-4 border-r border-gray-800 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white">Your Chats</h2>
            <button
              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg text-sm font-semibold transition"
              onClick={() => {
                const newId = uuidv4();
                router.push(`/chat/${newId}`);
              }}
              type="button"
            >
              + New Chat
            </button>
          </div>
          {chatsLoading ? (
            <div className="text-gray-400">Loading chats...</div>
          ) : chats && chats.length > 0 ? (
            <ul className="space-y-2">
              {chats.map((chat) => (
                <li key={chat.chatId}>
                  <button
                    className={`w-full text-left px-3 py-2 rounded-lg transition font-medium ${chat.chatId === chatId ? 'bg-blue-700 text-white' : 'bg-gray-900 text-gray-200 hover:bg-gray-800'}`}
                    onClick={() => router.push(`/chat/${chat.chatId}`)}
                  >
                    <div className="truncate">
                      {chat.lastMessage?.content?.slice(0, 40) || 'No messages yet'}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {(() => {
                        const date = toDate(chat.lastMessage?.timestamp);
                        return date ? date.toLocaleString() : '';
                      })()}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-gray-400">No chats yet.</div>
          )}
        </aside>
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="w-full h-full flex flex-col items-center justify-center">
            {/* Greeting and prompts only if not chatted yet and no messages */}
            {(!hasChatted && messages.length === 1) && (
              <>
                <div className="mb-5">
                  <div className="mt-4 mx-auto mb-2 w-14 h-14 rounded-full bg-green-500 flex items-center justify-center shadow-lg">
                    <span className="text-4xl">🟢</span>
                  </div>
                  <h1 className="text-2xl font-bold text-white text-center mb-2">Good evening, {user?.firstName + ' ' + user?.lastName || user?.email || 'User'}<br />Can I help you with anything?</h1>
                  <p className="text-gray-400 text-center mt-2">Choose a prompt below or write your own to start chatting with Promptly</p>
                </div>
                <div className="grid grid-cols-2 gap-2 mb-4 flex-wrap justify-center">
                  {[
                    'Get fresh perspectives on tricky problems',
                    'Brainstorm creative ideas',
                    'Rewrite message for maximum impact',
                    'Summarize key points',
                  ].map((prompt) => (
                    <button
                      key={prompt}
                      className="bg-gray-800 text-white px-3 py-2 text-sm rounded-lg mb-2 hover:bg-green-600 transition"
                      onClick={() => setMessage(prompt)}
                      type="button"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </>
            )}
            {/* Chatbox UI */}
            {(hasChatted || messages.length > 0) && (
              <div className="flex flex-col w-full flex-1 relative" style={{ height: '100%' }}>
                <div
                  ref={chatAreaRef}
                  className="flex-1 flex flex-col bg-gray-900 rounded-lg p-4 mb-2 max-h-full overflow-y-auto space-y-3"
                  style={{ minHeight: 0, paddingBottom: 80 }}
                >
                  {messages.filter(msg => msg.chatId === chatId).map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex items-end fade-in ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      style={{ animation: 'fadeIn 0.5s' }}
                    >
                      {msg.role === 'bot' && (
                        <span className="rounded-full border-2 border-blue-500 shadow bg-white flex items-center justify-center mr-2" style={{ width: 36, height: 36 }}>
                          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2C13.1046 2 14 2.89543 14 4V4.12602C17.3925 4.57013 20 7.46243 20 11V17C20 18.6569 18.6569 20 17 20H7C5.34315 20 4 18.6569 4 17V11C4 7.46243 6.60748 4.57013 10 4.12602V4C10 2.89543 10.8954 2 12 2ZM12 6C8.68629 6 6 8.68629 6 12V17C6 17.5523 6.44772 18 7 18H17C17.5523 18 18 17.5523 18 17V12C18 8.68629 15.3137 6 12 6ZM9 14C9.55228 14 10 14.4477 10 15C10 15.5523 9.55228 16 9 16C8.44772 16 8 15.5523 8 15C8 14.4477 8.44772 14 9 14ZM16 15C16 14.4477 15.5523 14 15 14C14.4477 14 14 14.4477 14 15C14 15.5523 14.4477 16 15 16C15.5523 16 16 15.5523 16 15Z" fill="#3B82F6"/>
                          </svg>
                        </span>
                      )}
                      <div className={`flex flex-col items-${msg.role === 'user' ? 'end' : 'start'}`}> 
                        <div
                          className={`px-5 py-3 rounded-2xl shadow max-w-xs break-words text-base font-medium ${
                            msg.role === 'user'
                              ? 'bg-gradient-to-r from-green-400 to-green-600 text-black rounded-br-none'
                              : 'bg-gradient-to-r from-slate-800 to-slate-700 text-white rounded-bl-none'
                          }`}
                        >
                          {msg.content}
                        </div>
                        {(() => {
                          const date = toDate(msg.timestamp);
                          return date ? (
                            <span className="text-xs text-gray-400 mt-1">{date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          ) : null;
                        })()}
                      </div>
                      {msg.role === 'user' && (
                        <span className="rounded-full border-2 border-green-500 shadow bg-white flex items-center justify-center ml-2" style={{ width: 36, height: 36 }}>
                          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="12" cy="8" r="4" fill="#6B7280"/>
                            <path d="M4 20C4 16.6863 7.13401 14 12 14C16.866 14 20 16.6863 20 20" fill="#6B7280"/>
                          </svg>
                        </span>
                      )}
                    </div>
                  ))}
                  {botTyping && (
                    <div className="flex justify-start mb-2 items-end fade-in" style={{ animation: 'fadeIn 0.5s' }}>
                      <span className="rounded-full border-2 border-blue-500 shadow bg-white flex items-center justify-center mr-2" style={{ width: 36, height: 36 }}>
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 2C13.1046 2 14 2.89543 14 4V4.12602C17.3925 4.57013 20 7.46243 20 11V17C20 18.6569 18.6569 20 17 20H7C5.34315 20 4 18.6569 4 17V11C4 7.46243 6.60748 4.57013 10 4.12602V4C10 2.89543 10.8954 2 12 2ZM12 6C8.68629 6 6 8.68629 6 12V17C6 17.5523 6.44772 18 7 18H17C17.5523 18 18 17.5523 18 17V12C18 8.68629 15.3137 6 12 6ZM9 14C9.55228 14 10 14.4477 10 15C10 15.5523 9.55228 16 9 16C8.44772 16 8 15.5523 8 15C8 14.4477 8.44772 14 9 14ZM16 15C16 14.4477 15.5523 14 15 14C14.4477 14 14 14.4477 14 15C14 15.5523 14.4477 16 15 16C15.5523 16 16 15.5523 16 15Z" fill="#3B82F6"/>
                        </svg>
                      </span>
                      <div className="px-5 py-3 rounded-2xl shadow max-w-xs bg-gradient-to-r from-slate-800 to-slate-700 text-white text-base rounded-bl-none flex items-center">
                        <span className="dot-typing"></span>
                      </div>
                    </div>
                  )}
                </div>
                {/* Input box fixed at bottom */}
                <div className="w-full flex items-center gap-2 bg-gray-800 rounded-xl shadow-lg p-3 mt-0 fixed bottom-0 left-0 right-0 max-w-3xl mx-auto" style={{ minHeight: 64, zIndex: 10 }}>
                  <textarea
                    className="flex-1 bg-gray-900 text-white rounded-lg p-4 resize-none border-none focus:ring-2 focus:ring-green-400 transition"
                    rows={2}
                    placeholder="How can Promptly help you today?"
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    style={{ minHeight: 48, maxHeight: 96 }}
                  />
                  <button
                    className="bg-gradient-to-r from-green-400 to-green-600 text-black px-6 py-2 rounded-lg font-semibold shadow hover:from-green-500 hover:to-green-700 transition disabled:opacity-50"
                    onClick={handleSend}
                    disabled={!message.trim()}
                    type="button"
                    style={{ minHeight: 48 }}
                  >
                    Send
                  </button>
                </div>
              </div>
            )}
            <style jsx global>{`
            @keyframes fadeIn {
              from { opacity: 0; transform: translateY(10px); }
              to { opacity: 1; transform: translateY(0); }
            }
            .fade-in { animation: fadeIn 0.5s; }
            .dot-typing {
              position: relative;
              width: 2em;
              height: 1em;
            }
            .dot-typing::before, .dot-typing::after, .dot-typing span {
              content: '';
              display: inline-block;
              position: absolute;
              left: 0;
              width: 0.5em;
              height: 0.5em;
              border-radius: 50%;
              background: #fff;
              animation: blink 1.4s infinite both;
            }
            .dot-typing span {
              left: 0.7em;
              animation-delay: 0.2s;
            }
            .dot-typing::after {
              left: 1.4em;
              animation-delay: 0.4s;
            }
            @keyframes blink {
              0%, 80%, 100% { opacity: 0; }
              40% { opacity: 1; }
            }
          `}</style>
          </div>
        </div>
      </div>
    </div>
  );
} 