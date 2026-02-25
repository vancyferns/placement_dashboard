import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

// Initialize the Gemini client
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("GEMINI_API_KEY is not set in .env.local");
}
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;
const model = genAI ? genAI.getGenerativeModel({ model: "gemini-2.5-flash" }) : null;

// The prompt for the final report
const REPORT_SYSTEM_PROMPT = `
You are an expert career coach and senior hiring manager.
A student has just completed a mock interview. You will be given the full transcript as a JSON-like string.

Your task is to provide a comprehensive, encouraging, and actionable feedback report.
The report MUST be formatted in Markdown.

Evaluation Criteria:
1.  **Clarity:** Was the candidate clear and concise?
2.  **STAR Method:** Did the candidate effectively use the STAR (Situation, Task, Action, Result) method for behavioral questions?
3.  **Technical Depth:** (If applicable) Was the technical knowledge accurate?
4.  **Enthusiasm:** Did the candidate show genuine interest and enthusiasm?

Please structure your report as follows:
-   A **Final Score** as a heading (e.g., "## Final Score: 82/100").
-   A "Performance Summary" section, grading them (Good, Great, Needs Improvement) on each of the 4 criteria.
-   An "Areas for Improvement" section with 3-4 specific, actionable bullet points on what they can do better next time.
-   A concluding, encouraging remark.
`;

// Helper function to format the history
function formatTranscript(history: { question: string, answer: string }[]): string {
  return history.map((turn, index) => `
---
Question ${index + 1}:
${turn.question}

Candidate's Answer ${index + 1}:
${turn.answer}
---
  `).join('\n');
}

export async function POST(req: Request) {
  if (!model) {
    console.error("Gemini model is not initialized. Check your GEMINI_API_KEY.");
    return new NextResponse('AI service not configured', { status: 500 });
  }

  try {
    const { history } = await req.json();

    if (!history || history.length === 0) {
      return new NextResponse('Missing interview history', { status: 400 });
    }

    const transcript = formatTranscript(history);

    const prompt = `
      ${REPORT_SYSTEM_PROMPT}

      Here is the interview transcript:
      ${transcript}
    `;

    // Call the Gemini API
    const result = await model.generateContent(prompt);
    const aiReport = result.response.text();

    return NextResponse.json({ report: aiReport });
    
  } catch (error) {
    console.error('[INTERVIEW_REPORT_API_ERROR]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}