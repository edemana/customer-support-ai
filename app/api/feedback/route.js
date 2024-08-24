// app/api/feedback/route.js

import { NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { db } from '../../../firebase'; // Update the path according to your structure
import { collection, addDoc } from "firebase/firestore"; 

export async function POST(req) {
  const token = req.headers.authorization?.split('Bearer ')[1];
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const decodedToken = await getAuth().verifyIdToken(token);
    const userId = decodedToken.uid;

    const { messageId, rating } = await req.json();

    // Store the feedback in Firestore
    const feedbackRef = await addDoc(collection(db, "feedback"), {
      messageId,
      rating,
      userId,
      createdAt: new Date(),
    });

    console.log(`Feedback stored: ${feedbackRef.id}`);

    return NextResponse.json({ success: true, feedbackId: feedbackRef.id });
  } catch (error) {
    console.error("Error storing feedback:", error);
    return NextResponse.json({ error: "Failed to store feedback" }, { status: 500 });
  }
}
