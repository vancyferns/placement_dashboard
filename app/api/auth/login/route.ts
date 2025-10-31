import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, role } = body;

    if (!email || !role) {
      return NextResponse.json(
        { error: 'Email and role are required' },
        { status: 400 }
      );
    }

    if (role === 'STUDENT') {
      // Find student by email
      const student = await prisma.student.findUnique({
        where: { email },
        select: {
          id: true,
          name: true,
          email: true,
          rollNumber: true,
          department: true,
          degree: true,
          isRegistered: true
        }
      });

      if (!student) {
        return NextResponse.json(
          { error: 'Student not found. Please register first.' },
          { status: 404 }
        );
      }

      if (!student.isRegistered) {
        return NextResponse.json(
          { error: 'Student registration is incomplete.' },
          { status: 403 }
        );
      }

      return NextResponse.json({
        success: true,
        student,
        role: 'STUDENT'
      });
    } else if (role === 'OFFICER') {
      // Find officer by email
      const officer = await prisma.officer.findUnique({
        where: { email },
        select: {
          id: true,
          name: true,
          email: true,
          department: true
        }
      });

      if (!officer) {
        return NextResponse.json(
          { error: 'Officer not found. Please contact admin.' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        officer,
        role: 'OFFICER'
      });
    }

    return NextResponse.json(
      { error: 'Invalid role' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    );
  }
}
