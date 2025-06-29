/// <reference types="node" />
import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, cert, getApps, getApp } from 'firebase-admin/app';
import { getFirestore as getAdminFirestore } from 'firebase-admin/firestore';

const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

const adminApp = !getApps().length ? initializeApp({ credential: cert(serviceAccount) }) : getApp();
const adminDb = getAdminFirestore(adminApp);

export async function GET(req: NextRequest) {
  try {
    const idToken = req.headers.get('authorization')?.split('Bearer ')[1];
    if (!idToken) return NextResponse.json({ error: 'Missing ID token' }, { status: 401 });
    // Extract UID from dummy token
    const match = idToken.match(/^dummy-token-(user_\d+)/);
    if (!match) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    const uid = match[1];

    // Fetch chat history from chat_history collection
    const snapshot = await adminDb
      .collection('chat_history')
      .where('userId', '==', uid)
      .orderBy('timestamp', 'asc')
      .get();

    // Group messages by chatId
    const chatMap: { [chatId: string]: any[] } = {};
    snapshot.docs.forEach(doc => {
      const data = { id: doc.id, ...(doc.data() as any) };
      if (!data.chatId) return;
      if (!chatMap[data.chatId]) chatMap[data.chatId] = [];
      chatMap[data.chatId].push(data);
    });
    // Convert to array of chats, including lastMessage
    const chats = Object.entries(chatMap).map(([chatId, messages]) => {
      const lastMessage = messages[messages.length - 1];
      return { chatId, messages, lastMessage };
    });
    return NextResponse.json({ chats });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
} 