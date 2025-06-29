import { NextRequest, NextResponse } from 'next/server';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};


if (!getApps().length) {
  console.log('Initializing Firebase Admin SDK', serviceAccount);
  initializeApp({
    credential: cert(serviceAccount as any),
  });
}

const db = getFirestore();

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
    }
    // Fetch user by email from Firestore
    const userQuery = await db.collection('users').where('email', '==', email).limit(1).get();
    if (userQuery.empty) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    }
    const userDoc = userQuery.docs[0];
    const userData = userDoc.data();
    // Check password (in production, use hashed passwords!)
    if (userData.password !== password) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    }
    // Return a dummy token (for demo only)
    const token = 'dummy-token-' + userData.uid;
    return NextResponse.json({ token, user: userData });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Login failed.' }, { status: 400 });
  }
} 