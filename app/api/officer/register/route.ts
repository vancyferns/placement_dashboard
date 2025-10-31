import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, department } = body;

    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      );
    }

    // Check if officer already exists
    const existingOfficer = await prisma.officer.findUnique({
      where: { email }
    });

    if (existingOfficer) {
      return NextResponse.json(
        { error: 'Officer with this email already exists' },
        { status: 409 }
      );
    }

    // Create user first (required for officer relation)
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: 'temp_password', // In production, use proper password hashing
        role: 'OFFICER'
      }
    });

    // Create officer profile
    const newOfficer = await prisma.officer.create({
      data: {
        userId: user.id,
        name,
        email,
        department: department || ''
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Officer registered successfully',
      officer: {
        id: newOfficer.id,
        name: newOfficer.name,
        email: newOfficer.email
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Officer registration error:', error);
    return NextResponse.json(
      { error: 'Failed to register officer' },
      { status: 500 }
    );
  }
}
