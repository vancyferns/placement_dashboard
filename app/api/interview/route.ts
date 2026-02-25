import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

// Initialize the Gemini client (using the key you already have in .env.local)
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("GEMINI_API_KEY is not set in .env.local");
}
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;
// We use 'gemini-pro' as it's the most standard and reliable model.
const model = genAI ? genAI.getGenerativeModel({ model: "gemini-2.5-flash" }) : null;

// This system prompt defines the AI's personality and task.
const INTERVIEWER_SYSTEM_PROMPT = `
You are a professional, focused interviewer for a Software Engineer role.
Your goal is to conduct a realistic interview.
You will be given the candidate's previous answer.
Your task is to:
1.  Ask the next relevant, thought-provoking interview question. Mix behavioral, situational, and technical questions.
2.  DO NOT provide feedback or acknowledge the answer. Just ask the next question.
3.  Keep your question concise (under 50 words).

If the candidate says "I am ready to begin", your first question MUST be "Great. Let's start. Tell me about yourself."
If the candidate says "end interview" or something similar, you MUST respond with ONLY the text "INTERVIEW_ENDED". Do not say anything else.
`;

export async function POST(req: Request) {
  if (!model) {
    console.error("Gemini model is not initialized. Check your GEMINI_API_KEY.");
    return new NextResponse('AI service not configured', { status: 500 });
  }

  try {
    const { question, answer } = await req.json();

    if (question === undefined || answer === undefined) {
      return new NextResponse('Missing question or answer', { status: 400 });
    }

    // Combine the system prompt and user's last turn for Gemini
    const prompt = `
      ${INTERVIEWER_SYSTEM_PROMPT}

      The candidate's answer to my previous question was: "${answer}"

      What is your next question?
    `;

    // Call the Gemini API
    const result = await model.generateContent(prompt);
    const aiResponse = result.response.text();

    return NextResponse.json({ response: aiResponse.trim() });
    
  } catch (error) {
    console.error('[INTERVIEW_API_ERROR]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}