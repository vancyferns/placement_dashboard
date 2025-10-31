# Student Placement Assessment Platform

A comprehensive placement preparation platform built with Next.js that helps students assess their readiness through AI-powered resume analysis, aptitude tests, soft skills evaluation, and interview preparation.

## 🚀 Features

### For Students
- **AI-Powered Resume Analysis**: Upload your resume and get detailed ATS-compatible scoring with recommendations
- **Aptitude Test**: 50-question bank with randomized questions covering quantitative, logical, and verbal reasoning
- **Soft Skills Assessment**: 21-question test evaluating 7 key soft skill categories
- **Interview Preparation**: Track and improve interview performance
- **Overall Score Dashboard**: Real-time tracking with 25% weight for each component
- **Download Reports**: Export detailed analysis reports for resume evaluation
- **Progress Tracking**: Visual charts showing improvement over time

### For Placement Officers
- **Student Management**: View and manage all registered students
- **Performance Analytics**: Track student progress and scores
- **Bulk Operations**: Manage multiple students efficiently
- **Company Requirements Matching**: Match student profiles with company requirements

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: Version 18.0 or higher ([Download](https://nodejs.org/))
- **pnpm**: Version 8.0 or higher
  ```powershell
  npm install -g pnpm
  ```
- **Git**: For version control ([Download](https://git-scm.com/))

## 🛠️ Installation Steps

### 1. Clone or Download the Project

If using Git:
```powershell
git clone <repository-url>
cd cohort_project
```

Or download and extract the ZIP file, then navigate to the folder.

### 2. Install Dependencies

```powershell
pnpm install
```

This will install all required packages including:
- Next.js 14.2.16
- React 18.3.1
- Prisma ORM
- TypeScript
- Tailwind CSS
- ShadcN UI components
- Google Generative AI
- PDF parsing libraries

### 3. Set Up Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="file:./dev.db"

# Google Gemini AI API Key (for resume analysis)
GEMINI_API_KEY="your_api_key_here"
```

**To get your Gemini API Key:**
1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key and paste it in your `.env` file

> **Note**: The platform works without the API key, but resume analysis will use rule-based scoring instead of AI-powered analysis.

### 4. Set Up the Database

Initialize the Prisma database:

```powershell
# Generate Prisma client
npx prisma generate

# Create the database and run migrations
npx prisma db push

# (Optional) Seed with test data
npx tsx scripts/seed-test-data.ts
```

### 5. Start the Development Server

```powershell
pnpm dev
```

The application will be available at: **http://localhost:3000**

## 🧪 Test Accounts

After seeding the database, you can use these test accounts:

### Student Account
- **Email**: test@student.com
- **Password**: password123

### Placement Officer Account
- **Email**: officer@test.com
- **Password**: password123

## 📚 Project Structure

```
cohort_project/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── aptitude/            # Aptitude test endpoints
│   │   ├── auth/                # Authentication
│   │   ├── register/            # User registration
│   │   ├── resume/              # Resume analysis
│   │   ├── soft-skills/         # Soft skills test
│   │   └── students/            # Student management
│   ├── login/                    # Login page
│   ├── student-dashboard/        # Student dashboard page
│   ├── officer-dashboard/        # Officer dashboard page
│   ├── globals.css              # Global styles
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Landing page
├── components/                   # React components
│   ├── ui/                      # ShadcN UI components
│   ├── aptitude-test.tsx        # Aptitude test component
│   ├── resume-analyzer.tsx      # Resume upload & analysis
│   ├── soft-skills-test.tsx     # Soft skills assessment
│   ├── student-dashboard.tsx    # Student dashboard
│   └── officer-dashboard.tsx    # Officer dashboard
├── lib/                          # Utility functions
│   ├── auth-context.tsx         # Authentication context
│   ├── prisma.ts                # Prisma client
│   └── utils.ts                 # Helper functions
├── prisma/                       # Database
│   ├── schema.prisma            # Database schema
│   └── dev.db                   # SQLite database
├── public/                       # Static assets
├── scripts/                      # Utility scripts
│   └── seed-test-data.ts        # Database seeding script
├── .env                          # Environment variables
├── package.json                  # Dependencies
├── tsconfig.json                 # TypeScript config
└── README.md                     # This file
```

## 🎯 How to Use

### For Students

1. **Register/Login**
   - Go to http://localhost:3000
   - Click "Login" and use the student test account or register a new account
   - Select "Student" tab when logging in

2. **Take Aptitude Test**
   - Navigate to the "Aptitude" tab
   - Click "Start Test"
   - Answer 10 randomized questions (30-minute timer)
   - Submit to see your score and detailed review

3. **Upload Resume**
   - Go to the "Resume" tab
   - Upload your PDF resume
   - Get AI-powered ATS score and recommendations
   - Download detailed report

4. **Take Soft Skills Test**
   - Navigate to "Soft Skills" tab
   - Complete 21 questions across 7 categories
   - View category-wise performance

5. **View Progress**
   - Check "Overview" tab for overall score (25% each component)
   - Monitor improvement over time with progress charts

### For Placement Officers

1. **Login**
   - Use officer test account or register a new officer account
   - Select "Placement Officer" tab when logging in

2. **Manage Students**
   - View all registered students
   - Filter by performance, status, or search by name
   - Access individual student profiles

3. **Match with Companies**
   - Use student scores to match with company requirements
   - Export student data for placement drives

## 🔧 Common Commands

```powershell
# Start development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Run database migrations
npx prisma db push

# Open Prisma Studio (database GUI)
npx prisma studio

# Generate Prisma client
npx prisma generate

# Seed test data
npx tsx scripts/seed-test-data.ts

# Clean build cache
Remove-Item -Path ".next" -Recurse -Force
```

## 🐛 Troubleshooting

### Port Already in Use
```powershell
# Stop all Node processes
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force

# Then restart the server
pnpm dev
```

### Database Issues
```powershell
# Reset database
Remove-Item prisma/dev.db -Force
npx prisma db push
npx tsx scripts/seed-test-data.ts
```

### Module Not Found Errors
```powershell
# Clear node_modules and reinstall
Remove-Item node_modules -Recurse -Force
Remove-Item pnpm-lock.yaml -Force
pnpm install
```

### PDF Upload Issues
- Ensure PDF is valid and not corrupted
- Check file size (max 5MB recommended)
- Try with a different PDF file

### AI Analysis Not Working
- Verify `GEMINI_API_KEY` is set in `.env`
- Check API key is valid at [Google AI Studio](https://aistudio.google.com/app/apikey)
- Platform will fall back to rule-based analysis if AI fails

## 📦 Required Downloads

### Essential Software
1. **Node.js** (v18+): https://nodejs.org/
2. **pnpm**: Install via `npm install -g pnpm`
3. **VS Code** (Recommended): https://code.visualstudio.com/

### Optional Tools
1. **Prisma Studio Extension**: For database management
2. **Thunder Client/Postman**: For API testing
3. **Git**: For version control

## 🔐 Security Notes

- Never commit `.env` file to version control
- Keep your `GEMINI_API_KEY` private
- Change default passwords in production
- Use HTTPS in production environments
- Implement rate limiting for API endpoints

## 🚀 Production Deployment

### Using Vercel (Recommended)

1. Push code to GitHub
2. Import project to Vercel
3. Add environment variables in Vercel dashboard
4. Update `DATABASE_URL` to use PostgreSQL/MySQL for production
5. Deploy!

### Environment Variables for Production
```env
DATABASE_URL="postgresql://user:password@host:5432/database"
GEMINI_API_KEY="your_production_api_key"
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="generate_a_secure_random_string"
```

## 📊 Database Schema

The platform uses SQLite (development) with Prisma ORM. Key models:

- **Student**: User profiles and scores
- **PlacementOfficer**: Officer accounts
- **Question**: Aptitude test questions
- **TestResult**: Aptitude test submissions
- **SoftSkillsResult**: Soft skills test results
- **ResumeAnalysis**: Resume analysis data
- **ProgressTracking**: Historical score data

View full schema in `prisma/schema.prisma`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is for educational purposes.

## 💡 Support

For issues or questions:
1. Check the troubleshooting section
2. Review closed issues on GitHub
3. Create a new issue with detailed description

## 🎓 Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, ShadcN UI
- **Backend**: Next.js API Routes
- **Database**: Prisma ORM + SQLite (dev) / PostgreSQL (prod)
- **AI**: Google Gemini AI
- **PDF Processing**: pdf2json
- **Charts**: Recharts
- **Authentication**: Custom Auth Context

## 📈 Features Roadmap

- [ ] Email notifications
- [ ] Interview scheduling
- [ ] Video interview practice
- [ ] Company portal
- [ ] Batch-wise analytics
- [ ] Export to Excel/PDF
- [ ] Mobile app
- [ ] Real-time chat support

---

**Version**: 1.0.0  
**Last Updated**: October 31, 2025  

Made with ❤️ for Student Success
