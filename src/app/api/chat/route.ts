/// <reference types="node" />
import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, cert, getApps, getApp } from 'firebase-admin/app';
import { getFirestore as getAdminFirestore } from 'firebase-admin/firestore';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { v4 as uuidv4 } from 'uuid';

const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

const adminApp = !getApps().length ? initializeApp({ credential: cert(serviceAccount) }) : getApp();
const adminDb = getAdminFirestore(adminApp);

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

async function askGemini(prompt: string) {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  const result = await model.generateContent(prompt);
  return result.response.text();
}

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();
    const idToken = req.headers.get('authorization')?.split('Bearer ')[1];
    if (!idToken) return NextResponse.json({ error: 'Missing ID token' }, { status: 401 });
    // Extract UID from dummy token
    const match = idToken.match(/^dummy-token-(user_\d+)/);
    if (!match) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    const uid = match[1];

    // Get chatId from request body or generate a new one
    let chatId = req.headers.get('x-chat-id');
    if (!chatId) {
      chatId = uuidv4();
    }

    // Save user message
    const userMsg = {
      role: 'user',
      content: message,
      timestamp: new Date(),
      chatId,
    };
    await adminDb.collection('chat_history').add({
      userId: uid,
      ...userMsg,
    });

    // Call Gemini AI
    const botContent = await askGemini(message);

    // Save bot message
    const botMsg = {
      role: 'bot',
      content: botContent,
      timestamp: new Date(),
      chatId,
    };
    await adminDb.collection('users').doc(uid).collection('chats').add(botMsg);
    await adminDb.collection('chat_history').add({
      userId: uid,
      ...botMsg,
    });

    return NextResponse.json({ response: botContent });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
} 