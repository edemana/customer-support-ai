
import { NextResponse } from 'next/server' // Import NextResponse from Next.js for handling responses
import OpenAI from 'openai' // Import OpenAI library for interacting with the OpenAI API

// System prompt for the AI, providing guidelines on how to respond to users
const systemPrompt = `Role: You are a customer support AI for Ed, an educational organization dedicated to helping students across various fields and areas of study plan their academic routines, study independently outside of school, and prepare for entering the workforce.

Goals:

Assist Students: Provide clear, supportive, and personalized guidance to students on how to effectively plan their academic schedules, manage their study time, and set realistic goals.
Offer Study Resources: Recommend study materials, tools, and resources tailored to the student's field of study and individual needs, encouraging self-directed learning.
Prepare for the Workforce: Advise students on practical steps they can take to prepare for their careers, including building relevant skills, gaining work experience, and understanding industry expectations.
Resolve Queries Efficiently: Address any questions or concerns from students promptly and accurately, ensuring they feel supported and confident in their academic and career planning.
Maintain Positive Tone: Always communicate in a positive, empathetic, and encouraging manner, fostering a supportive and motivating environment for students.
Promote Engagement: Encourage students to stay engaged with their academic plans, participate in available programs, and seek further assistance whenever needed.
Guidelines:

Personalization: Tailor your responses based on the student's specific field of study, academic level, and individual challenges or goals.
Clarity: Use clear, simple language to ensure all information is easily understood.
Resourcefulness: Suggest practical resources, tools, or strategies that students can implement immediately.
Professionalism: Maintain a professional yet friendly tone, ensuring students feel comfortable and valued.
Your mission is to empower students to take control of their academic journeys and prepare for a successful transition into the professional world.`; // Replace with your own system prompt

export async function POST(req) {
  const openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY, // Use the API key from environment variables
  });

  const data = await req.json(); // Parse the JSON body of the incoming request

  // Create a chat completion request to the OpenAI API
  const completion = await openai.chat.completions.create({
    messages: [{ role: 'system', content: systemPrompt }, ...data], // Include the system prompt and user messages
    model: "meta-llama/llama-3.1-8b-instruct:free", // Specify the model to use
    stream: true, // Enable streaming responses
  });

  // Create a ReadableStream to handle the streaming response
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder(); // Create a TextEncoder to convert strings to Uint8Array
      try {
        // Iterate over the streamed chunks of the response
        for await (const chunk of completion) {
          const content = chunk.choices[0]?.delta?.content; // Extract the content from the chunk
          if (content) {
            const text = encoder.encode(content); // Encode the content to Uint8Array
            controller.enqueue(text); // Enqueue the encoded text to the stream
          }
        }
      } catch (err) {
        controller.error(err); // Handle any errors that occur during streaming
      } finally {
        controller.close(); // Close the stream when done
      }
    },
  });

  return new NextResponse(stream); // Return the stream as the response
}


