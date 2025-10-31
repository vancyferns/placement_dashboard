from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any
import random
import json
from datetime import datetime, timedelta
import uuid

app = FastAPI(title="Placement Readiness API")

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Data Models
class Student(BaseModel):
    id: str
    name: str
    email: str
    overall_score: int
    resume_score: int
    aptitude_score: int
    soft_skills_score: int
    interview_score: int
    progress_data: List[Dict[str, Any]]

class Question(BaseModel):
    id: str
    question: str
    options: List[str]
    correct_answer: int
    category: str

class Company(BaseModel):
    id: str
    name: str
    requirements: Dict[str, Any]

# Data Generation Functions
def generate_student_data():
    """Generate realistic student data"""
    first_names = ["Arjun", "Priya", "Rahul", "Sneha", "Vikram", "Ananya", "Karthik", "Meera", "Rohan", "Divya"]
    last_names = ["Sharma", "Patel", "Kumar", "Singh", "Reddy", "Gupta", "Jain", "Agarwal", "Mehta", "Shah"]
    
    students = []
    for i in range(10):
        first = random.choice(first_names)
        last = random.choice(last_names)
        
        # Generate scores with some correlation
        base_ability = random.randint(40, 90)
        resume_score = max(30, min(100, base_ability + random.randint(-15, 15)))
        aptitude_score = max(30, min(100, base_ability + random.randint(-10, 10)))
        soft_skills_score = max(30, min(100, base_ability + random.randint(-20, 20)))
        interview_score = max(30, min(100, base_ability + random.randint(-15, 15)))
        overall_score = int((resume_score + aptitude_score + soft_skills_score + interview_score) / 4)
        
        # Generate progress data for last 5 weeks
        progress_data = []
        for week in range(5):
            date = datetime.now() - timedelta(weeks=4-week)
            progress_data.append({
                "week": f"Week {week + 1}",
                "date": date.strftime("%Y-%m-%d"),
                "overall": max(30, overall_score + random.randint(-10, 10)),
                "resume": max(30, resume_score + random.randint(-8, 8)),
                "aptitude": max(30, aptitude_score + random.randint(-8, 8)),
                "soft_skills": max(30, soft_skills_score + random.randint(-8, 8))
            })
        
        students.append(Student(
            id=str(uuid.uuid4()),
            name=f"{first} {last}",
            email=f"{first.lower()}.{last.lower()}@college.edu",
            overall_score=overall_score,
            resume_score=resume_score,
            aptitude_score=aptitude_score,
            soft_skills_score=soft_skills_score,
            interview_score=interview_score,
            progress_data=progress_data
        ))
    
    return students

def generate_aptitude_questions():
    """Generate sample aptitude questions"""
    questions = [
        {
            "id": "q1",
            "question": "If a train travels 120 km in 2 hours, what is its average speed?",
            "options": ["50 km/h", "60 km/h", "70 km/h", "80 km/h"],
            "correct_answer": 1,
            "category": "quantitative"
        },
        {
            "id": "q2", 
            "question": "Complete the series: 2, 6, 12, 20, 30, ?",
            "options": ["40", "42", "44", "46"],
            "correct_answer": 1,
            "category": "logical"
        },
        {
            "id": "q3",
            "question": "Choose the word most similar to 'Abundant':",
            "options": ["Scarce", "Plentiful", "Limited", "Rare"],
            "correct_answer": 1,
            "category": "verbal"
        },
        {
            "id": "q4",
            "question": "If 3x + 7 = 22, what is the value of x?",
            "options": ["3", "4", "5", "6"],
            "correct_answer": 2,
            "category": "quantitative"
        },
        {
            "id": "q5",
            "question": "Which number comes next: 1, 4, 9, 16, 25, ?",
            "options": ["30", "32", "36", "40"],
            "correct_answer": 2,
            "category": "logical"
        },
        {
            "id": "q6",
            "question": "Antonym of 'Optimistic':",
            "options": ["Hopeful", "Positive", "Pessimistic", "Confident"],
            "correct_answer": 2,
            "category": "verbal"
        },
        {
            "id": "q7",
            "question": "A rectangle has length 8m and width 6m. What is its area?",
            "options": ["42 sq m", "48 sq m", "52 sq m", "56 sq m"],
            "correct_answer": 1,
            "category": "quantitative"
        },
        {
            "id": "q8",
            "question": "If all roses are flowers and some flowers are red, then:",
            "options": ["All roses are red", "Some roses are red", "No roses are red", "Cannot be determined"],
            "correct_answer": 3,
            "category": "logical"
        },
        {
            "id": "q9",
            "question": "Choose the correctly spelled word:",
            "options": ["Accomodate", "Accommodate", "Acommodate", "Acomodate"],
            "correct_answer": 1,
            "category": "verbal"
        },
        {
            "id": "q10",
            "question": "What is 15% of 200?",
            "options": ["25", "30", "35", "40"],
            "correct_answer": 1,
            "category": "quantitative"
        }
    ]
    
    return [Question(**q) for q in questions]

def generate_companies():
    """Generate sample company data"""
    companies = [
        {
            "id": "c1",
            "name": "TechCorp Solutions",
            "requirements": {
                "min_overall_score": 70,
                "min_aptitude_score": 65,
                "required_skills": ["Python", "SQL", "Problem Solving"],
                "min_cgpa": 7.0
            }
        },
        {
            "id": "c2", 
            "name": "DataFlow Analytics",
            "requirements": {
                "min_overall_score": 75,
                "min_aptitude_score": 70,
                "required_skills": ["Data Analysis", "Statistics", "Python"],
                "min_cgpa": 7.5
            }
        },
        {
            "id": "c3",
            "name": "WebDev Innovations",
            "requirements": {
                "min_overall_score": 65,
                "min_aptitude_score": 60,
                "required_skills": ["JavaScript", "React", "Node.js"],
                "min_cgpa": 6.5
            }
        }
    ]
    
    return [Company(**c) for c in companies]

# Global data storage (in production, use a real database)
students_data = generate_student_data()
questions_data = generate_aptitude_questions()
companies_data = generate_companies()

# API Endpoints
@app.get("/")
async def root():
    return {"message": "Placement Readiness API is running"}

@app.get("/api/student/{student_id}", response_model=Student)
async def get_student(student_id: str = "current"):
    # For demo, return first student as "current" user
    if student_id == "current":
        return students_data[0]
    
    student = next((s for s in students_data if s.id == student_id), None)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return student

@app.get("/api/students", response_model=List[Student])
async def get_all_students():
    return students_data

@app.get("/api/aptitude/questions", response_model=List[Question])
async def get_aptitude_questions():
    # Return random 10 questions
    return random.sample(questions_data, min(10, len(questions_data)))

@app.post("/api/aptitude/submit")
async def submit_aptitude_test(answers: Dict[str, int]):
    # Calculate score based on submitted answers
    correct_count = 0
    total_questions = len(answers)
    
    for question_id, selected_answer in answers.items():
        question = next((q for q in questions_data if q.id == question_id), None)
        if question and question.correct_answer == selected_answer:
            correct_count += 1
    
    score = int((correct_count / total_questions) * 100) if total_questions > 0 else 0
    
    # Generate feedback
    feedback = []
    if score >= 80:
        feedback.append("Excellent performance! You have strong analytical skills.")
    elif score >= 60:
        feedback.append("Good job! Focus on practicing more logical reasoning questions.")
    else:
        feedback.append("Need improvement. Consider taking additional practice tests.")
    
    return {
        "score": score,
        "correct_answers": correct_count,
        "total_questions": total_questions,
        "feedback": feedback
    }

@app.post("/api/resume/analyze")
async def analyze_resume():
    # Simulate resume analysis with random score and feedback
    score = random.randint(40, 90)
    
    feedback = []
    if score < 60:
        feedback.extend([
            "Add more technical projects to showcase your skills",
            "Improve formatting and structure",
            "Include quantifiable achievements"
        ])
    elif score < 80:
        feedback.extend([
            "Good structure, but add more specific achievements",
            "Consider adding relevant certifications"
        ])
    else:
        feedback.extend([
            "Excellent resume structure and content",
            "Strong technical project descriptions"
        ])
    
    return {
        "score": score,
        "feedback": feedback,
        "analysis_date": datetime.now().isoformat()
    }

@app.get("/api/companies", response_model=List[Company])
async def get_companies():
    return companies_data

@app.get("/api/company-matches/{student_id}")
async def get_company_matches(student_id: str = "current"):
    student = students_data[0] if student_id == "current" else next((s for s in students_data if s.id == student_id), None)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    matches = []
    for company in companies_data:
        is_eligible = (
            student.overall_score >= company.requirements["min_overall_score"] and
            student.aptitude_score >= company.requirements["min_aptitude_score"]
        )
        
        matches.append({
            "company": company,
            "eligible": is_eligible,
            "match_percentage": min(100, int((student.overall_score / company.requirements["min_overall_score"]) * 100))
        })
    
    return matches

@app.get("/api/batch-analytics")
async def get_batch_analytics():
    total_students = len(students_data)
    avg_score = sum(s.overall_score for s in students_data) / total_students
    
    weak_students = [s for s in students_data if s.overall_score < 60]
    strong_students = [s for s in students_data if s.overall_score >= 75]
    
    # Identify weak areas
    avg_resume = sum(s.resume_score for s in students_data) / total_students
    avg_aptitude = sum(s.aptitude_score for s in students_data) / total_students
    avg_soft_skills = sum(s.soft_skills_score for s in students_data) / total_students
    
    weak_areas = []
    if avg_resume < 65:
        weak_areas.append("Resume Writing")
    if avg_aptitude < 65:
        weak_areas.append("Aptitude Skills")
    if avg_soft_skills < 65:
        weak_areas.append("Soft Skills")
    
    return {
        "total_students": total_students,
        "average_score": round(avg_score, 1),
        "weak_students_count": len(weak_students),
        "strong_students_count": len(strong_students),
        "weak_areas": weak_areas,
        "suggested_seminars": [f"{area} Workshop" for area in weak_areas]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
