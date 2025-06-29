import { NextRequest, NextResponse } from 'next/server';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount as any),
  });
}

const db = getFirestore();

export async function POST(req: NextRequest) {
  try {
    const { email, password, ...rest } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
    }
    // Generate a simple UID (not secure, for demo only)
    const uid = 'user_' + Date.now() + Math.floor(Math.random() * 10000);
    // Store user data in Firestore
    await db.collection('users').doc(uid).set({
      email,
      uid,
      password, // In production, hash the password!
      ...rest,
      createdAt: new Date().toISOString(),
    });
    // Return a dummy token (for demo only)
    const token = 'dummy-token-' + uid;
    return NextResponse.json({ token, user: { email, uid, ...rest } });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Sign up failed.' }, { status: 400 });
  }
} 