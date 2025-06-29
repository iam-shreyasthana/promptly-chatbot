export type ChatRole = 'user' | 'bot';

export interface ChatMessage {
  role: ChatRole;
  content: string;
  timestamp: any; // Firestore Timestamp or Date
  chatId?: string;
}

export interface User {
  uid: string;
  email: string;  
  firstName: string;
  lastName: string;
} 