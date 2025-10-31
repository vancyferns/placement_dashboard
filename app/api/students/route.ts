import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const students = await prisma.student.findMany({
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(
      students.map((s) => ({
        id: s.id,
        name: s.name,
        email: s.email,
        overall_score: s.overallScore,
        resume_score: s.resumeScore,
        aptitude_score: s.aptitudeScore,
        soft_skills_score: s.softSkillsScore,
        interview_score: s.interviewScore,
      })),
    )
  } catch (error) {
    console.error('Error fetching students:', error)
    return NextResponse.json({ error: 'Failed to fetch students' }, { status: 500 })
  }
}
