# Resume Scanner with Gemini AI - Setup Guide

## ✅ What's Been Done

1. **Installed Google Gemini AI SDK** (`@google/generative-ai`)
2. **Updated `.env` file** with GEMINI_API_KEY placeholder
3. **Enhanced Resume Analyzer API** with AI-powered analysis
4. **PDF Storage** - Resume files are stored in database with analysis results

## 🔑 Step-by-Step Setup

### 1. Get Your FREE Gemini API Key

1. Go to: https://aistudio.google.com/app/apikey
2. Click **"Get API Key"**
3. Click **"Create API Key"**
4. Copy the key (starts with `AIza...`)

### 2. Add API Key to `.env` File

Open `c:\Users\User\Desktop\cohort_project\.env` and replace:

```env
GEMINI_API_KEY="your-gemini-api-key-here"
```

With your actual key:

```env
GEMINI_API_KEY="AIzaSyXXXXXXXXXXXXXXXXXXXXX"
```

### 3. Restart Development Server

```powershell
# Stop current server (Ctrl+C in terminal)
# Then restart:
npm run dev
```

## 🎯 How It Works

### For Students:
1. Login to student dashboard
2. Go to "Resume Analyzer" tab
3. Upload PDF resume
4. Get instant AI-powered feedback with:
   - **ATS Score (0-100)**
   - **Strengths** - What's good in your resume
   - **Improvements** - What needs work
   - **Recommendations** - Actionable next steps
   - **Skills Detected** - Technical skills found
   - **ATS Compatibility Score**

### For Officers:
1. Login to officer dashboard
2. View all students
3. Click "View Details" on any student
4. See their resume analysis + PDF file
5. Match students to company requirements based on:
   - Resume score
   - Skills detected
   - Experience level
   - Education

## 🗄️ Database Storage

Resume data is stored in `ResumeAnalysis` table:
- `fileName` - Original PDF filename
- `score` - ATS score (0-100)
- `strengths` - JSON array of strengths
- `improvements` - JSON array of improvements  
- `recommendations` - JSON array of recommendations
- `analysisDate` - Timestamp
- `studentId` - Linked to student

## 🤖 AI Analysis Features

Gemini AI analyzes:
1. **Contact Information** - Email, phone, LinkedIn, GitHub
2. **Professional Summary** - Quality and relevance
3. **Education** - Degree, university, CGPA
4. **Work Experience** - Companies, duration, achievements
5. **Technical Skills** - Programming languages, frameworks
6. **Soft Skills** - Leadership, communication, teamwork
7. **Projects** - Count and descriptions
8. **Certifications** - Relevant certifications
9. **ATS Compatibility** - How well it works with ATS systems
10. **Missing Sections** - What's not included

## 📊 Scoring Breakdown

- Contact Information: 15 points
- Professional Summary: 10 points
- Education: 15 points
- Work Experience: 25 points
- Skills: 20 points
- Projects: 10 points
- Certifications: 5 points

**Total: 100 points**

## 🔄 Fallback System

If Gemini API fails or key is not configured:
- Automatically falls back to rule-based analysis
- Still provides scores and recommendations
- No interruption to user experience

## 🎨 Officer Dashboard Integration

Officers can:
1. View all student resumes
2. Filter by resume score
3. Match students to companies
4. See detailed analysis
5. Export eligible students list

## 🚀 Next Steps

1. **Get Gemini API key** (5 minutes)
2. **Add to `.env` file** (1 minute)
3. **Restart server** (30 seconds)
4. **Test with a resume** (2 minutes)
5. **Enjoy AI-powered analysis!** ✨

## 💡 Tips

- **Free Tier**: 60 requests per minute
- **Best Results**: Upload clean, well-formatted PDFs
- **PDF Size**: Keep under 5MB for best performance
- **Testing**: Use real resumes for accurate analysis

## 🐛 Troubleshooting

### "API key not configured"
- Check `.env` file has GEMINI_API_KEY
- Restart server after adding key
- Make sure key starts with "AIza"

### "PDF parsing failed"
- Ensure PDF is not password-protected
- Try re-saving PDF to remove restrictions
- Check file size is under 5MB

### "Analysis returns 0 score"
- Check PDF has actual text (not just images)
- Verify PDF is not corrupted
- Try uploading a different PDF

## 📝 API Endpoint

**POST** `/api/resume/analyze`

**Request:**
```typescript
FormData {
  file: File (PDF)
  studentId: string
}
```

**Response:**
```typescript
{
  success: true,
  analysis: {
    id: string,
    score: number,
    strengths: string[],
    improvements: string[],
    recommendations: string[]
  }
}
```

---

**Need help?** Check the console logs for detailed debugging information!
