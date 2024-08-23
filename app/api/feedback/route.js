// app/api/feedback/route.js

import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { messageId, rating } = await req.json();

    // Store the feedback in the database
    const feedback = await prisma.feedback.create({
      data: {
        messageId,
        rating,
        userId: session.user.id, // Assuming the session contains user id
      },
    });

    console.log(`Feedback stored: ${JSON.stringify(feedback)}`);

    return NextResponse.json({ success: true, feedbackId: feedback.id });
  } catch (error) {
    console.error("Error storing feedback:", error);
    return NextResponse.json({ error: "Failed to store feedback" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}