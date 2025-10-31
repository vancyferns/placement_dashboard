import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    const student = await prisma.student.findUnique({
      where: { id },
      include: {
        progressData: {
          orderBy: { date: 'asc' },
          take: 5,
        },
        testResults: {
          orderBy: { testDate: 'desc' },
          take: 5,
        },
        resumeAnalyses: {
          orderBy: { analysisDate: 'desc' },
          take: 1,
        },
      },
    })

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 })
    }

    // Format progress data
    const formattedProgressData = student.progressData.map((p, index) => ({
      week: `Week ${index + 1}`,
      date: p.date.toISOString().split('T')[0],
      overall: p.overall,
      resume: p.resume,
      aptitude: p.aptitude,
      soft_skills: p.softSkills,
    }))

    return NextResponse.json({
      id: student.id,
      name: student.name,
      email: student.email,
      overall_score: student.overallScore,
      resume_score: student.resumeScore,
      aptitude_score: student.aptitudeScore,
      soft_skills_score: student.softSkillsScore,
      interview_score: student.interviewScore,
      progress_data: formattedProgressData,
    })
  } catch (error) {
    console.error('Error fetching student:', error)
    return NextResponse.json({ error: 'Failed to fetch student data' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const data = await request.json()

    const student = await prisma.student.update({
      where: { id },
      data: {
        overallScore: data.overall_score,
        resumeScore: data.resume_score,
        aptitudeScore: data.aptitude_score,
        softSkillsScore: data.soft_skills_score,
        interviewScore: data.interview_score,
      },
    })

    return NextResponse.json(student)
  } catch (error) {
    console.error('Error updating student:', error)
    return NextResponse.json({ error: 'Failed to update student data' }, { status: 500 })
  }
}
