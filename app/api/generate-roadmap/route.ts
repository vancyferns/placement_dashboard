// app/api/generate-roadmap/route.ts
import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { google } from 'googleapis';

// --- 1. INITIALIZE ALL API CLIENTS ---

// Gemini Client
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("GEMINI_API_KEY is not set in .env.local");
}
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;
// We use 'gemini-pro' as it's the most reliable for this kind of generation
const model = genAI ? genAI.getGenerativeModel({ model: "gemini-2.5-flash" }) : null;

// YouTube Client
const youtube = google.youtube({
  version: 'v3',
  auth: process.env.YOUTUBE_API_KEY,
});

// Google Search Client
const customsearch = google.customsearch('v1');
const searchApiKey = process.env.GOOGLE_SEARCH_API_KEY;
const searchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID;

// --- 2. DEFINE THE NEW, RICHER DATA STRUCTURES ---
// These interfaces MUST match your frontend component
interface Resource {
  type: 'video' | 'article';
  title: string;
  url: string;
}

interface SubModule {
  id: string;
  title: string;
  search_topic: string; // The topic we use to find resources
  resources: Resource[];
}

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number; // index of the correct option
}

interface Milestone {
  id: string;
  title: string;
  description: string;
  subModules: SubModule[];
  quiz: QuizQuestion[];
}

interface Roadmap {
  id: string;
  title: string;
  description: string;
  goal: string;
  progress: {
    completed: number;
    total: number;
  };
  milestones: Milestone[];
}

// --- 3. THE MAIN API ROUTE (ORCHESTRATOR) ---
export async function POST(request: Request) {
  // Check for all 4 keys
  if (!model || !searchApiKey || !searchEngineId || !process.env.YOUTUBE_API_KEY) {
    console.error("API service is not configured. Check all 4 API keys in .env.local (GEMINI, YOUTUBE, GOOGLE_SEARCH, GOOGLE_SEARCH_ENGINE_ID)");
    return NextResponse.json({ error: 'API service not configured' }, { status: 500 });
  }

  let jsonResponseText = ""; // To log in case of a syntax error

  try {
    const { prompt } = await request.json();
    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    // --- STEP 1: Call Gemini for the Roadmap STRUCTURE ---
    console.log(`[Step 1] Generating roadmap structure for: ${prompt}`);
    const structurePrompt = `
      You are an expert curriculum designer. Create a learning roadmap for a student interested in: "${prompt}".
      Return ONLY a JSON object. Do not use markdown.
      The structure must be:
      {
        "title": "Roadmap Title",
        "description": "A short description",
        "goal": "The primary learning goal",
        "milestones": [
          {
            "id": "m1",
            "title": "Milestone 1 Title (e.g., 'Introduction to React')",
            "description": "What this milestone covers",
            "subModules": [
              { "id": "sm1_1", "title": "Understanding Components & Props", "search_topic": "React components and props tutorial" },
              { "id": "sm1_2", "title": "State and Lifecycle", "search_topic": "React useState and useEffect hooks explained" }
            ]
          }
        ]
      }
      Generate 3-4 milestones. Each milestone should have 2-3 subModules.
      The "search_topic" MUST be a good, clean query for Google and YouTube.
    `;
    
    let result = await model.generateContent(structurePrompt);
    jsonResponseText = result.response.text().replace(/```json/g, "").replace(/```/g, "").trim();
    let roadmap: Roadmap = JSON.parse(jsonResponseText);

    // --- STEP 2: Augment with REAL resources (YouTube & Google Search) ---
    console.log("[Step 2] Fetching real resources...");
    for (const milestone of roadmap.milestones) {
      // Robustness: Ensure subModules array exists
      if (!milestone.subModules) {
        milestone.subModules = [];
      }
      
      for (const subModule of milestone.subModules) {
        subModule.resources = []; // Initialize resources array
        
        // Find one YouTube video
        try {
          const videoRes = await youtube.search.list({
            part: ['snippet'],
            q: subModule.search_topic,
            type: ['video'],
            maxResults: 1,
          });
          
          if (videoRes.data.items && videoRes.data.items.length > 0) {
            const video = videoRes.data.items[0];
            subModule.resources.push({
              type: 'video',
              title: video.snippet?.title || 'YouTube Video',
              url: `https://www.youtube.com/watch?v=${video.id?.videoId}`,
            });
          }
        } catch (e) {
          console.error(`YouTube API error for "${subModule.search_topic}":`, (e as Error).message);
        }

        // Find one article/doc
        try {
          const articleRes = await customsearch.cse.list({
            auth: searchApiKey,
            cx: searchEngineId,
            q: subModule.search_topic,
            num: 1,
          });

          if (articleRes.data.items && articleRes.data.items.length > 0) {
            const article = articleRes.data.items[0];
            subModule.resources.push({
              type: 'article',
              title: article.title || 'Web Article',
              url: article.link || '#',
            });
          }
        } catch (e) {
          console.error(`Google Search API error for "${subModule.search_topic}":`, (e as Error).message);
        }
      }
    }

    // --- STEP 3: Call Gemini AGAIN for Quizzes ---
    console.log("[Step 3] Generating quizzes...");
    for (const milestone of roadmap.milestones) {
      const topicList = milestone.subModules.map(sm => sm.title).join(', ');
      
      // If there are no topics, don't generate a quiz
      if (!topicList) {
        milestone.quiz = [];
        continue;
      }
      
      const quizPrompt = `
        Based on the following topics: "${topicList}".
        Generate a 3-question multiple-choice quiz.
        Return ONLY a JSON array. Do not use markdown.
        The structure must be:
        [
          {
            "question": "What is...?",
            "options": ["Answer 1", "Answer 2", "Answer 3", "Answer 4"],
            "correctAnswer": 0
          }
        ]
      `;
      
      try {
        result = await model.generateContent(quizPrompt);
        jsonResponseText = result.response.text().replace(/```json/g, "").replace(/```/g, "").trim();
        milestone.quiz = JSON.parse(jsonResponseText);
      } catch (e) {
        console.error(`Quiz generation error for "${milestone.title}":`, (e as Error).message);
        milestone.quiz = []; // Set empty quiz on failure
      }
    }

    // --- STEP 4: Add Final Metadata and Respond ---
    console.log("[Step 4] Assembling final roadmap.");
    roadmap.id = `ai-${Date.now()}`;
    roadmap.progress = {
      completed: 0,
      total: roadmap.milestones.length,
    };
    
    return NextResponse.json(roadmap);

  } catch (error) {
    console.error('Full orchestration error:', error);
    if (error instanceof SyntaxError) {
      console.error("Failed to parse JSON from AI. AI response was:");
      console.error(jsonResponseText); // Log the bad text
    }
    return NextResponse.json({ error: 'Failed to generate complex roadmap' }, { status: 500 });
  }
}
