import { useState, useEffect, useCallback } from 'react';
import { ChatMessage, User } from '../models/types';

function getUserFromSessionStorage(): User | null {
  if (typeof window === 'undefined') return null;
  const userJson = sessionStorage.getItem('user');
  if (!userJson) return null;
  try {
    return JSON.parse(userJson);
  } catch {
    return null;
  }
}

function getTokenFromSessionStorage(): string | null {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem('token');
}

export function useChat(chatId?: string) {
  const [user, setUser] = useState<User | null>(null);
  const [userLoaded, setUserLoaded] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [botTyping, setBotTyping] = useState(false);

  // On mount, set user from sessionStorage (client-side only)
  useEffect(() => {
    setUser(getUserFromSessionStorage());
    setUserLoaded(true);
  }, []);

  // Sync user state with sessionStorage (in case of manual logout/login elsewhere)
  useEffect(() => {
    const handleStorage = () => {
      setUser(getUserFromSessionStorage());
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const fetchHistory = useCallback(async () => {
    if (!user || !chatId) return;
    setLoading(true);
    setError(null);
    try {
      const token = getTokenFromSessionStorage();
      if (!token) throw new Error('No token found');
      const res = await fetch('/api/history', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.chats) {
        const chat = data.chats.find((c: any) => c.chatId === chatId);
        let chatMessages = chat?.messages || [];
        // Always prepend welcome message if not present
        if (
          chatMessages.length === 0 ||
          !(
            chatMessages[0].role === 'bot' &&
            chatMessages[0].content.startsWith('👋 Welcome to Promptly!')
          )
        ) {
          chatMessages = [
            {
              role: 'bot',
              content: '👋 Welcome to Promptly! Ask me anything to get started.',
              timestamp: new Date(),
              chatId,
            },
            ...chatMessages,
          ];
        }
        setMessages(chatMessages);
      } else setError(data.error || 'Failed to fetch history');
    } catch (err: any) {
      setError(err.message || 'Failed to fetch history');
    } finally {
      setLoading(false);
    }
  }, [user, chatId]);

  useEffect(() => {
    if (user) fetchHistory();
  }, [user, fetchHistory]);

  // Onboarding: show welcome message if no history
  useEffect(() => {
    if (user && messages.length === 0 && !loading) {
      setMessages([
        {
          role: 'bot',
          content: '👋 Welcome to Promptly! Ask me anything to get started.',
          timestamp: new Date(),
        },
      ]);
    }
  }, [user, messages.length, loading]);

  const sendMessage = useCallback(async (content: string, chatId?: string) => {
    if (!user) return;
    setError(null);
    // Immediately add user message
    setMessages((prev) => [
      ...prev,
      { role: 'user', content, timestamp: new Date(), chatId },
    ]);
    setBotTyping(true);
    try {
      const token = getTokenFromSessionStorage();
      if (!token) throw new Error('No token found');
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          ...(chatId ? { 'x-chat-id': chatId } : {}),
        },
        body: JSON.stringify({ message: content }),
      });
      const data = await res.json();
      if (data.response) {
        setMessages((prev) => [
          ...prev,
          { role: 'bot', content: data.response, timestamp: new Date(), chatId },
        ]);
      } else {
        setError(data.error || 'Failed to get response');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to send message');
    } finally {
      setBotTyping(false);
    }
  }, [user]);

  return { user, userLoaded, messages, loading, error, sendMessage, fetchHistory, botTyping };
}

export function useChatList() {
  const [user, setUser] = useState<User | null>(null);
  const [userLoaded, setUserLoaded] = useState(false);
  const [chats, setChats] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchChats = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const token = getTokenFromSessionStorage();
      if (!token) throw new Error('No token found');
      const res = await fetch('/api/history', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.chats) {
        setChats(data.chats);
      } else setError(data.error || 'Failed to fetch chats');
    } catch (err: any) {
      setError(err.message || 'Failed to fetch chats');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    setUser(getUserFromSessionStorage());
    setUserLoaded(true);
  }, []);

  useEffect(() => {
    if (!user) return;
    fetchChats();
  }, [user, fetchChats]);

  return { user, userLoaded, chats, loading, error, refetchChatList: fetchChats };
} 