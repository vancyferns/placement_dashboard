import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { studentId, answers, questions: submittedQuestions } = body;

    if (!studentId || !answers) {
      return NextResponse.json(
        { error: 'Missing required fields: studentId and answers' },
        { status: 400 }
      );
    }

    let questions = [];
    
    // If questions are submitted with the request (for mock questions), use them
    if (submittedQuestions && submittedQuestions.length > 0) {
      questions = submittedQuestions;
    } else {
      // Otherwise, fetch from database
      questions = await prisma.question.findMany({
        where: {
          id: {
            in: Object.keys(answers)
          }
        }
      });
    }

    if (questions.length === 0) {
      return NextResponse.json(
        { error: 'No questions found' },
        { status: 400 }
      );
    }

    // Calculate score
    let correctAnswers = 0;
    const feedback: Array<{
      question: string;
      isCorrect: boolean;
      userAnswer: number;
      correctAnswer: number;
    }> = [];

    questions.forEach((q: any) => {
      const userAnswer = answers[q.id];
      const correctAnswer = q.correctAnswer || q.correct_answer;
      const isCorrect = userAnswer === correctAnswer;
      
      if (isCorrect) correctAnswers++;
      
      feedback.push({
        question: q.question,
        isCorrect,
        userAnswer,
        correctAnswer: correctAnswer
      });
    });

    const totalQuestions = questions.length;
    const score = Math.round((correctAnswers / totalQuestions) * 100);

    // Save result to database
    await prisma.testResult.create({
      data: {
        studentId,
        score,
        correctAnswers,
        totalQuestions,
        answers: JSON.stringify(answers),
        feedback: JSON.stringify(feedback),
      }
    });

    // Update student's aptitude score and recalculate overall score
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      select: {
        resumeScore: true,
        aptitudeScore: true,
        softSkillsScore: true,
        interviewScore: true,
      },
    });

    if (student) {
      // Calculate overall score: 25% each component
      const newOverallScore = Math.round(
        (student.resumeScore * 0.25) +
        (score * 0.25) +
        (student.softSkillsScore * 0.25) +
        (student.interviewScore * 0.25)
      );

      await prisma.student.update({
        where: { id: studentId },
        data: {
          aptitudeScore: score,
          overallScore: newOverallScore,
        },
      });

      console.log(`✅ Updated student ${studentId}: Aptitude=${score}, Overall=${newOverallScore}`);
    }

    return NextResponse.json({
      success: true,
      score,
      correct_answers: correctAnswers,
      total_questions: totalQuestions,
      feedback
    });
  } catch (error) {
    console.error('Error submitting aptitude test:', error);
    return NextResponse.json(
      { error: 'Failed to submit test' },
      { status: 500 }
    );
  }
}
