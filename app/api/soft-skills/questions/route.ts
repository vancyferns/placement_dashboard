import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Get random soft skills questions
export async function GET() {
  try {
    // Get all questions
    const allQuestions = await prisma.softSkillsQuestion.findMany();
    
    if (allQuestions.length === 0) {
      return NextResponse.json(
        { error: 'No soft skills questions available. Please run the seed script.' },
        { status: 404 }
      );
    }
    
    // Shuffle and take 20 questions (or all if less than 20)
    const shuffled = allQuestions.sort(() => 0.5 - Math.random());
    const selectedQuestions = shuffled.slice(0, Math.min(20, allQuestions.length));
    
    // Format questions for frontend
    const formattedQuestions = selectedQuestions.map(q => ({
      id: q.id,
      question: q.question,
      options: JSON.parse(q.options),
      category: q.category
      // Don't send correctAnswer to frontend
    }));
    
    return NextResponse.json({ questions: formattedQuestions });
  } catch (error) {
    console.error('Error fetching soft skills questions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch questions' },
      { status: 500 }
    );
  }
}
