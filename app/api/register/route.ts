import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      email,
      rollNumber,
      department,
      degree,
      address,
      interests,
      phoneNumber
    } = body;

    // Validate required fields
    if (!name || !email || !rollNumber || !department || !degree) {
      return NextResponse.json(
        { error: 'Missing required fields: name, email, rollNumber, department, degree' },
        { status: 400 }
      );
    }

    // Check if student already exists
    const existingStudent = await prisma.student.findFirst({
      where: {
        OR: [
          { email },
          { rollNumber }
        ]
      }
    });

    if (existingStudent) {
      return NextResponse.json(
        { error: 'Student with this email or roll number already exists' },
        { status: 409 }
      );
    }

    // Create new student
    const newStudent = await prisma.student.create({
      data: {
        name,
        email,
        rollNumber,
        department,
        degree,
        address: address || '',
        interests: interests || '',
        phoneNumber: phoneNumber || '',
        isRegistered: true,
        resumeScore: 0,
        aptitudeScore: 0,
        softSkillsScore: 0,
        interviewScore: 0,
        overallScore: 0,
        // userId will be set later when user authentication is implemented
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Student registered successfully',
      student: {
        id: newStudent.id,
        name: newStudent.name,
        email: newStudent.email,
        rollNumber: newStudent.rollNumber
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Failed to register student' },
      { status: 500 }
    );
  }
}

// Get all registered students
export async function GET() {
  try {
    const students = await prisma.student.findMany({
      where: {
        isRegistered: true
      },
      select: {
        id: true,
        name: true,
        email: true,
        rollNumber: true,
        department: true,
        degree: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({ students });
  } catch (error) {
    console.error('Error fetching students:', error);
    return NextResponse.json(
      { error: 'Failed to fetch students' },
      { status: 500 }
    );
  }
}
