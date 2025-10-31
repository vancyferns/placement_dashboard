import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { GoogleGenerativeAI } from '@google/generative-ai';
const PDFParser = require('pdf2json');

const prisma = new PrismaClient();

// Initialize Gemini AI
const genAI = process.env.GEMINI_API_KEY 
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

async function parsePDF(buffer: Buffer): Promise<string> {
  return new Promise((resolve) => {
    const pdfParser = new PDFParser(null, true); // Enable verbose mode for better error handling
    let fullText = '';
    
    pdfParser.on('pdfParser_dataReady', (pdfData: any) => {
      try {
        if (pdfData.Pages) {
          pdfData.Pages.forEach((page: any) => {
            if (page.Texts) {
              page.Texts.forEach((text: any) => {
                if (text.R) {
                  text.R.forEach((r: any) => {
                    if (r.T) {
                      try {
                        fullText += decodeURIComponent(r.T) + ' ';
                      } catch (decodeError) {
                        // If decoding fails, use raw text
                        fullText += r.T + ' ';
                      }
                    }
                  });
                }
              });
              fullText += '\n';
            }
          });
        }
        
        console.log('✅ PDF parsed successfully');
        console.log('📝 Text length:', fullText.length);
        console.log('🔍 First 200 chars:', fullText.substring(0, 200));
        resolve(fullText.trim());
      } catch (error) {
        console.error('❌ Error processing PDF data:', error);
        resolve('Error parsing PDF content');
      }
    });
    
    pdfParser.on('pdfParser_dataError', (error: any) => {
      console.error('❌ PDF parse error:', error);
      // Return a message instead of empty string so Gemini can still try to help
      resolve('Unable to parse PDF. Please ensure the PDF is not corrupted or password-protected.');
    });
    
    // Add timeout to prevent hanging
    setTimeout(() => {
      if (!fullText) {
        console.log('⚠️ PDF parsing timeout, resolving with error message');
        resolve('PDF parsing timeout. Please try a different PDF file.');
      }
    }, 10000); // 10 second timeout
    
    try {
      pdfParser.parseBuffer(buffer);
    } catch (parseError) {
      console.error('❌ Critical PDF parsing error:', parseError);
      resolve('Critical error parsing PDF. Please try a different file.');
    }
  });
}

// Gemini AI-powered Resume Analysis
async function analyzeWithGemini(resumeText: string) {
  if (!genAI) {
    console.log('⚠️ Gemini API key not configured, using fallback analysis');
    return null;
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const prompt = `You are an expert ATS (Applicant Tracking System) and recruitment specialist. Analyze this resume and provide a detailed assessment in JSON format.

Resume Content:
${resumeText}

Provide your analysis in this EXACT JSON format (no markdown, just raw JSON):
{
  "score": <number 0-100>,
  "strengths": [<array of 3-5 specific strengths found in the resume>],
  "improvements": [<array of 3-5 specific areas that need improvement>],
  "recommendations": [<array of 3-5 actionable recommendations>],
  "skills_found": [<array of technical skills detected>],
  "experience_years": <number or 0>,
  "education_level": "<degree type or 'Not specified'>",
  "ats_compatibility": <number 0-100>,
  "missing_sections": [<array of important sections not found>]
}

Scoring criteria:
- Contact information (15 points)
- Professional summary (10 points)
- Education (15 points)
- Work experience (25 points)
- Skills (20 points)
- Projects (10 points)
- Certifications (5 points)

Be specific, constructive, and professional in your feedback.`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    // Extract JSON from response (remove markdown code blocks if present)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const analysis = JSON.parse(jsonMatch[0]);
      console.log('✅ Gemini analysis successful, score:', analysis.score);
      return analysis;
    }
    
    console.log('⚠️ Could not parse Gemini response, using fallback');
    return null;
  } catch (error) {
    console.error('❌ Gemini analysis error:', error);
    return null;
  }
}

// ATS-Style Resume Analysis (Fallback)
function generateATSAnalysis(text: string) {
  const lowerText = text.toLowerCase();
  let totalScore = 0;
  const maxScore = 100;
  
  const strengths: string[] = [];
  const improvements: string[] = [];
  const recommendations: string[] = [];

  // 1. CONTACT INFORMATION (15 points)
  let contactScore = 0;
  const hasEmail = /@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(text);
  const hasPhone = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/.test(text);
  const hasLinkedIn = /linkedin|linked-in/i.test(text);
  const hasGitHub = /github|git hub/i.test(text);
  const hasLocation = /\b(city|state|location|address)\b/i.test(text) || /,\s*[A-Z]{2}\b/.test(text);

  if (hasEmail) { contactScore += 5; strengths.push('✓ Professional email address included'); }
  else improvements.push('• Add a professional email address');
  
  if (hasPhone) { contactScore += 4; strengths.push('✓ Phone number provided'); }
  else improvements.push('• Include phone number for contact');
  
  if (hasLinkedIn) { contactScore += 3; strengths.push('✓ LinkedIn profile linked'); }
  else recommendations.push('→ Add LinkedIn profile URL');
  
  if (hasGitHub) { contactScore += 2; strengths.push('✓ GitHub profile included'); }
  else recommendations.push('→ Include GitHub profile (for tech roles)');
  
  if (hasLocation) contactScore += 1;
  
  totalScore += contactScore;

  // 2. PROFESSIONAL SUMMARY (10 points)
  let summaryScore = 0;
  const hasSummary = /(summary|profile|about|objective)/i.test(text);
  const summaryLength = text.match(/(?:summary|profile|about|objective)[\s\S]{50,300}/i)?.[0]?.length || 0;
  
  if (hasSummary && summaryLength > 100) {
    summaryScore = 10;
    strengths.push('✓ Strong professional summary present');
  } else if (hasSummary) {
    summaryScore = 5;
    improvements.push('• Expand professional summary (50-150 words)');
  } else {
    improvements.push('• Add a professional summary/objective');
  }
  totalScore += summaryScore;

  // 3. EDUCATION (15 points)
  let educationScore = 0;
  const hasDegree = /(bachelor|master|phd|b\.?tech|b\.?sc|m\.?tech|m\.?sc|mba|diploma)/i.test(text);
  const hasUniversity = /(university|college|institute|school)/i.test(text);
  const hasGradYear = /\b(20\d{2}|19\d{2})\b/.test(text);
  const hasCGPA = /(cgpa|gpa|percentage|%|grade)/i.test(text);
  
  if (hasDegree) { educationScore += 6; strengths.push('✓ Educational degree mentioned'); }
  else improvements.push('• Specify your degree/qualification');
  
  if (hasUniversity) { educationScore += 4; strengths.push('✓ Institution name included'); }
  else improvements.push('• Add university/institution name');
  
  if (hasGradYear) educationScore += 3;
  if (hasCGPA) { educationScore += 2; strengths.push('✓ Academic performance included'); }
  else recommendations.push('→ Add CGPA/percentage if strong (>70%)');
  
  totalScore += educationScore;

  // 4. WORK EXPERIENCE (25 points)
  let experienceScore = 0;
  const hasExperience = /(experience|work|employment|internship)/i.test(text);
  const hasCompany = /(company|organization|firm|startup)/i.test(text) || /\b[A-Z][a-z]+\s+(Inc|Ltd|Corp|LLC|Pvt)\b/.test(text);
  const hasDuration = /(month|year|present|current|\d+\s*-\s*\d+)/i.test(text);
  const hasActionVerbs = /(developed|created|managed|led|designed|implemented|built|improved|achieved|delivered)/i.test(text);
  const hasQuantifiableResults = /(\d+%|\d+x|saved|increased|reduced|improved by)/i.test(text);
  
  if (hasExperience) {
    experienceScore += 8;
    strengths.push('✓ Work experience section present');
    
    if (hasCompany) educationScore += 5;
    if (hasDuration) experienceScore += 4;
    
    if (hasActionVerbs) {
      experienceScore += 5;
      strengths.push('✓ Strong action verbs used');
    } else {
      improvements.push('• Use action verbs (developed, led, managed, etc.)');
    }
    
    if (hasQuantifiableResults) {
      experienceScore += 3;
      strengths.push('✓ Quantifiable achievements mentioned');
    } else {
      improvements.push('• Add metrics and numbers to achievements');
    }
  } else {
    improvements.push('• Add work experience or internships');
    recommendations.push('→ Include projects if no work experience');
  }
  totalScore += experienceScore;

  // 5. SKILLS (20 points)
  let skillsScore = 0;
  const hasSkillsSection = /(skills|technical skills|competencies|expertise)/i.test(text);
  const technicalSkills = text.match(/\b(python|java|javascript|react|node|sql|aws|docker|git|html|css|c\+\+|machine learning|ai|data science|angular|vue|kubernetes|mongodb|postgresql)\b/gi) || [];
  const softSkills = text.match(/\b(leadership|communication|teamwork|problem solving|analytical|creative|time management)\b/gi) || [];
  
  if (hasSkillsSection) {
    skillsScore += 5;
    strengths.push('✓ Skills section included');
  } else {
    improvements.push('• Create a dedicated skills section');
  }
  
  const uniqueTechSkills = new Set(technicalSkills.map(s => s.toLowerCase())).size;
  if (uniqueTechSkills >= 8) {
    skillsScore += 10;
    strengths.push(`✓ Comprehensive technical skills (${uniqueTechSkills} skills)`);
  } else if (uniqueTechSkills >= 4) {
    skillsScore += 6;
    recommendations.push(`→ Add more relevant technical skills (currently ${uniqueTechSkills})`);
  } else {
    improvements.push('• List relevant technical skills (aim for 8-12)');
  }
  
  if (softSkills.length >= 3) {
    skillsScore += 5;
    strengths.push('✓ Soft skills highlighted');
  } else {
    recommendations.push('→ Include key soft skills');
  }
  
  totalScore += skillsScore;

  // 6. PROJECTS (10 points)
  let projectsScore = 0;
  const hasProjects = /(project|portfolio|developed|built|created)/i.test(text);
  const projectCount = (text.match(/project/gi) || []).length;
  
  if (projectCount >= 3) {
    projectsScore = 10;
    strengths.push(`✓ Multiple projects showcased (${Math.min(projectCount, 5)}+)`);
  } else if (projectCount >= 1) {
    projectsScore = 5;
    improvements.push('• Add more projects (aim for 3-5)');
  } else {
    improvements.push('• Include relevant projects with descriptions');
  }
  totalScore += projectsScore;

  // 7. CERTIFICATIONS & ACHIEVEMENTS (5 points)
  let achievementScore = 0;
  const hasCertifications = /(certification|certified|certificate|course)/i.test(text);
  const hasAchievements = /(award|achievement|recognition|winner|rank|prize)/i.test(text);
  
  if (hasCertifications) {
    achievementScore += 3;
    strengths.push('✓ Certifications listed');
  } else {
    recommendations.push('→ Add relevant certifications');
  }
  
  if (hasAchievements) {
    achievementScore += 2;
    strengths.push('✓ Achievements highlighted');
  } else {
    recommendations.push('→ Include awards or achievements');
  }
  totalScore += achievementScore;

  // 8. FORMATTING & ATS COMPATIBILITY (5 points extra assessment)
  const wordCount = text.split(/\s+/).length;
  if (wordCount < 200) {
    improvements.push('• Resume appears too short (aim for 400-700 words)');
  } else if (wordCount > 1000) {
    improvements.push('• Resume may be too long (keep under 2 pages)');
  }
  
  // Final recommendations based on score
  if (totalScore < 50) {
    recommendations.unshift('🚨 CRITICAL: Resume needs major improvements for ATS systems');
  } else if (totalScore < 70) {
    recommendations.unshift('⚠️ MODERATE: Add more details and keywords for better ATS score');
  } else if (totalScore >= 85) {
    recommendations.unshift('✅ EXCELLENT: Resume is well-optimized for ATS systems!');
  }

  // Add generic best practices
  recommendations.push('→ Use standard section headings (Experience, Education, Skills)');
  recommendations.push('→ Save as PDF to preserve formatting');
  recommendations.push('→ Avoid graphics, tables, and columns for ATS compatibility');

  return {
    score: Math.min(totalScore, maxScore),
    strengths,
    improvements,
    recommendations
  };
}

export async function POST(request: Request) {
  try {
    console.log('Resume API called');
    
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const studentId = formData.get('studentId') as string;

    if (!file || !studentId) {
      return NextResponse.json({ error: 'Missing data' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const text = await parsePDF(buffer);
    
    // Check if PDF parsing failed
    if (!text || text.length < 50 || text.includes('Unable to parse') || text.includes('timeout') || text.includes('Critical error')) {
      return NextResponse.json({
        error: 'PDF parsing failed',
        message: text || 'Unable to extract text from PDF. Please ensure the PDF is not corrupted, password-protected, or contains only images.',
        suggestion: 'Try re-saving your PDF or using a different PDF viewer to export it.'
      }, { status: 400 });
    }
    
    // Try Gemini AI analysis first, fallback to rule-based
    let analysis = await analyzeWithGemini(text);
    if (!analysis) {
      console.log('⚠️ Using fallback rule-based analysis');
      analysis = generateATSAnalysis(text);
    }

    const result = await prisma.resumeAnalysis.create({
      data: {
        studentId,
        fileName: file.name,
        score: analysis.score,
        strengths: JSON.stringify(analysis.strengths),
        improvements: JSON.stringify(analysis.improvements),
        recommendations: JSON.stringify(analysis.recommendations),
      },
    });

    // Update student's resume score and recalculate overall score
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
        (analysis.score * 0.25) +
        (student.aptitudeScore * 0.25) +
        (student.softSkillsScore * 0.25) +
        (student.interviewScore * 0.25)
      );

      await prisma.student.update({
        where: { id: studentId },
        data: {
          resumeScore: analysis.score,
          overallScore: newOverallScore,
        },
      });

      console.log(`✅ Updated student ${studentId}: Resume=${analysis.score}, Overall=${newOverallScore}`);
    }

    return NextResponse.json({
      success: true,
      analysis: {
        id: result.id,
        score: result.score,
        strengths: JSON.parse(result.strengths),
        improvements: JSON.parse(result.improvements),
        recommendations: JSON.parse(result.recommendations),
      },
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 });
  }
}
