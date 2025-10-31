import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Submit soft skills test
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { studentId, answers } = body;

    if (!studentId || !answers) {
      return NextResponse.json(
        { error: 'Missing required fields: studentId and answers' },
        { status: 400 }
      );
    }

    // Get all questions with correct answers
    const questions = await prisma.softSkillsQuestion.findMany({
      where: {
        id: {
          in: Object.keys(answers)
        }
      }
    });

    // Calculate score and category-wise performance
    let correctAnswers = 0;
    const categoryScores: Record<string, { correct: number; total: number }> = {};
    const feedback: Array<{
      question: string;
      category: string;
      isCorrect: boolean;
      userAnswer: number;
      correctAnswer: number;
    }> = [];

    questions.forEach(q => {
      const userAnswer = answers[q.id];
      const isCorrect = userAnswer === q.correctAnswer;
      
      if (isCorrect) correctAnswers++;
      
      // Track category performance
      if (!categoryScores[q.category]) {
        categoryScores[q.category] = { correct: 0, total: 0 };
      }
      categoryScores[q.category].total++;
      if (isCorrect) categoryScores[q.category].correct++;
      
      // Add to feedback
      feedback.push({
        question: q.question,
        category: q.category,
        isCorrect,
        userAnswer,
        correctAnswer: q.correctAnswer
      });
    });

    const totalQuestions = questions.length;
    const score = Math.round((correctAnswers / totalQuestions) * 100);

    // Calculate category percentages
    const categoryPercentages: Record<string, number> = {};
    Object.entries(categoryScores).forEach(([category, scores]) => {
      categoryPercentages[category] = Math.round((scores.correct / scores.total) * 100);
    });

    // Save result to database
    const result = await prisma.softSkillsResult.create({
      data: {
        studentId,
        score,
        correctAnswers,
        totalQuestions,
        answers: JSON.stringify(answers),
        feedback: JSON.stringify(feedback),
        categoryScores: JSON.stringify(categoryPercentages)
      }
    });

    // Update student's soft skills score and recalculate overall score
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
        (student.aptitudeScore * 0.25) +
        (score * 0.25) +
        (student.interviewScore * 0.25)
      );

      await prisma.student.update({
        where: { id: studentId },
        data: {
          softSkillsScore: score,
          overallScore: newOverallScore,
        },
      });

      console.log(`✅ Updated student ${studentId}: SoftSkills=${score}, Overall=${newOverallScore}`);
    }

    // Generate recommendations based on performance
    const weakCategories = Object.entries(categoryPercentages)
      .filter(([_, percentage]) => percentage < 70)
      .map(([category]) => category);

    if (weakCategories.length > 0) {
      for (const category of weakCategories) {
        await prisma.recommendation.create({
          data: {
            studentId,
            type: 'Soft Skills',
            title: `Improve ${category} Skills`,
            description: `Your performance in ${category} was below 70%. Consider practicing more in this area through workshops, online courses, or mentorship.`,
            priority: categoryPercentages[category] < 50 ? 'high' : 'medium'
          }
        });
      }
    }

    return NextResponse.json({
      success: true,
      result: {
        score,
        correctAnswers,
        totalQuestions,
        categoryScores: categoryPercentages,
        feedback
      }
    });
  } catch (error) {
    console.error('Error submitting soft skills test:', error);
    return NextResponse.json(
      { error: 'Failed to submit test' },
      { status: 500 }
    );
  }
}
