"use client"

import { useState, useEffect } from 'react'
import {
  CheckCircle2, Circle, Sparkles, Clock, BookOpen, Video, FileText,
  GraduationCap, Target, Loader2, ChevronDown, Youtube, ExternalLink
} from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/components/ui/use-toast"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
// --- NEW: Import the Dialog component ---
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import QuizComponent from './quiz-component'

// --- (Interfaces are the same) ---
interface Resource {
  type: 'video' | 'article';
  title: string;
  url: string;
}

interface SubModule {
  id: string;
  title: string;
  search_topic: string;
  resources: Resource[];
}

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
}

interface Milestone {
  id: string;
  title: string;
  description: string;
  completed: boolean; 
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

interface RoadmapFeatureProps {
  studentInterests: string;
}

const interestOptions = [
  "Web Development", "Mobile Development", "Data Science", "Machine Learning",
  "UI/UX Design", "Game Development", "Cloud Computing", "DevOps",
  "Cybersecurity", "Blockchain", "Artificial Intelligence", "Robotics"
]

export default function RoadmapFeature({ studentInterests }: RoadmapFeatureProps) {
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  // --- NEW: State for the video modal ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVideoUrl, setSelectedVideoUrl] = useState<string | null>(null);

  // --- (useEffect and handleInterestChange are the same) ---
  useEffect(() => {
    if (studentInterests && roadmaps.length === 0 && !isGenerating) {
      const parsedInterests = studentInterests
        .replace(/"/g, '')
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);

      setSelectedInterests(Array.from(new Set(parsedInterests)));
      
      const firstInterest = parsedInterests[0];
      
      if (firstInterest) {
        handleGenerateRoadmap(firstInterest, true);
      } else {
        setIsInitialLoading(false);
      }
    } else if (!studentInterests) {
      setIsInitialLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentInterests]);

  const handleInterestChange = (interest: string, checked: boolean) => {
    setSelectedInterests(prev => {
      const newSet = new Set(prev);
      checked ? newSet.add(interest) : newSet.delete(interest);
      return Array.from(newSet);
    });
  };
  
  // --- (handleGenerateRoadmap and handleGenerateNewRoadmapClick are the same) ---
  const handleGenerateRoadmap = async (prompt: string, isInitial: boolean = false) => {
    isInitial ? setIsInitialLoading(true) : setIsGenerating(true);
    try {
      const response = await fetch('/api/generate-roadmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate roadmap");
      }

      const newRoadmap: Roadmap = await response.json();
      newRoadmap.milestones = newRoadmap.milestones.map(m => ({ ...m, completed: false }));
      
      setRoadmaps(prev => [newRoadmap, ...prev]);
      toast({ title: `Roadmap for "${prompt}" Generated! 🎉` });

    } catch (error) {
      console.error("Roadmap generation failed:", error);
      toast({ title: "Generation Failed", description: (error as Error).message, variant: "destructive" });
    } finally {
      isInitial ? setIsInitialLoading(false) : setIsGenerating(false);
    }
  };
  
  const handleGenerateNewRoadmapClick = () => {
    if (selectedInterests.length === 0) {
      toast({ title: "No Interests Selected", variant: "destructive" });
      return;
    }
    handleGenerateRoadmap(selectedInterests.join(', '), false);
  };

  // --- (toggleMilestoneComplete is the same) ---
  const toggleMilestoneComplete = (roadmapId: string, milestoneId: string) => {
    setRoadmaps(prevRoadmaps =>
      prevRoadmaps.map(roadmap => {
        if (roadmap.id === roadmapId) {
          let completedCount = 0;
          const updatedMilestones = roadmap.milestones.map(milestone => {
            let newMilestone = { ...milestone };
            if (milestone.id === milestoneId) {
              newMilestone.completed = true; 
            }
            if (newMilestone.completed) completedCount++;
            return newMilestone;
          });
          
          return {
            ...roadmap,
            milestones: updatedMilestones,
            progress: { ...roadmap.progress, completed: completedCount }
          };
        }
        return roadmap;
      })
    );
  };

  // --- (getResourceIcon is the same) ---
  const getResourceIcon = (type: 'video' | 'article') => {
    if (type === 'video') return <Youtube className="h-4 w-4 text-red-500" />;
    return <ExternalLink className="h-4 w-4 text-blue-500" />;
  };

  // --- NEW: Helper to convert YouTube URL to embeddable URL ---
  const getEmbedUrl = (url: string) => {
    try {
      const videoUrl = new URL(url);
      const videoId = videoUrl.searchParams.get('v');
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }
      return null;
    } catch (error) {
      console.error("Invalid video URL", url);
      return null;
    }
  };

  // --- NEW: Click handler for all resources ---
  const handleResourceClick = (e: React.MouseEvent, resource: Resource) => {
    // If it's a video, prevent default, get embed URL, and open modal
    if (resource.type === 'video') {
      e.preventDefault(); // Stop the <a> tag from opening a new tab
      const embedUrl = getEmbedUrl(resource.url);
      
      if (embedUrl) {
        setSelectedVideoUrl(embedUrl);
        setIsModalOpen(true);
      } else {
        // Fallback: if URL is weird, just open it in a new tab
        toast({ title: "Could not open video player", description: "Opening in new tab.", variant: "default" });
        window.open(resource.url, '_blank', 'noopener,noreferrer');
      }
    }
    // If it's an article, do nothing and let the <a> tag's
    // default behavior (target="_blank") open it in a new tab.
  };

  return (
    <div className="space-y-6">
      {/* --- NEW: Add the Dialog component to the top level --- */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl h-[75vh] p-0 flex flex-col">
          <DialogHeader className="p-4 pb-0">
            <DialogTitle>Video Player</DialogTitle>
          </DialogHeader>
          {selectedVideoUrl && (
            <iframe
              width="100%"
              height="100%"
              src={selectedVideoUrl}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="rounded-b-lg flex-1"
            ></iframe>
          )}
        </DialogContent>
      </Dialog>
      {/* --- End of Dialog --- */}


      {/* 1. Generator Card (Same as before) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><Sparkles className="h-5 w-5 mr-2 text-primary" />AI Roadmap Generator</CardTitle>
          <CardDescription>
            Your current interests are pre-selected. Add more to generate a new personalized plan.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <label className="text-sm font-medium mb-4 block">Select Your Interests</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {interestOptions.map(interest => (
                <div key={interest} className="flex items-center space-x-2">
                  <Checkbox
                    id={interest}
                    checked={selectedInterests.includes(interest)}
                    onCheckedChange={(checked) => handleInterestChange(interest, !!checked)}
                  />
                  <label htmlFor={interest} className="text-sm font-medium">{interest}</label>
                </div>
              ))}
            </div>
          </div>
          <Button onClick={handleGenerateNewRoadmapClick} disabled={isGenerating || selectedInterests.length === 0} className="w-full">
            {isGenerating ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generating...</> : <><Sparkles className="h-4 w-4 mr-2" /> Generate New Roadmap</>}
          </Button>
        </CardContent>
      </Card>

      {/* 2. Your Roadmaps (Tracker) */}
      <div className="space-y-6">
        <h3 className="text-2xl font-semibold">Your Roadmaps</h3>
        
        {isInitialLoading ? (
          <div className="flex flex-col items-center justify-center p-10"><Loader2 className="h-8 w-8 animate-spin text-primary" /><p className="mt-4 text-muted-foreground">Generating your first roadmap...</p></div>
        ) : roadmaps.length === 0 ? (
          <p className="text-muted-foreground">You don't have any roadmaps. Generate one above to get started!</p>
        ) : (
          roadmaps.map(roadmap => (
            <Card key={roadmap.id}>
              <CardHeader>
                {/* ... (Header is the same) ... */}
                <div className="flex flex-col md:flex-row justify-between md:items-start gap-4">
                  <div><CardTitle>{roadmap.title}</CardTitle><CardDescription>{roadmap.description}</CardDescription></div>
                  <div className="text-left md:text-right flex-shrink-0">
                    <div className="text-2xl font-bold text-primary">{Math.round((roadmap.progress.completed / roadmap.progress.total) * 100)}%</div>
                    <div className="text-sm text-muted-foreground">{roadmap.progress.completed} of {roadmap.progress.total} done</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Progress value={(roadmap.progress.completed / roadmap.progress.total) * 100} />
                
                <div className="space-y-4">
                  {roadmap.milestones.map((milestone, index) => (
                    <Collapsible 
                      key={milestone.id} 
                      className={`border-2 rounded-lg ${milestone.completed ? 'border-green-500/30' : 'border-border'}`}
                    >
                      <CollapsibleTrigger className="flex items-center justify-between w-full p-4 hover:bg-accent transition-colors data-[state=open]:border-b-2">
                        {/* ... (CollapsibleTrigger is the same) ... */}
                        <div className="flex items-center space-x-4">
                          {milestone.completed ? (
                            <CheckCircle2 className="h-6 w-6 text-green-500" />
                          ) : (
                            <Circle className="h-6 w-6 text-muted-foreground" />
                          )}
                          <div className="text-left">
                            <h4 className="font-semibold text-foreground">{index + 1}. {milestone.title}</h4>
                            <p className="text-sm text-muted-foreground">{milestone.description}</p>
                          </div>
                        </div>
                        <ChevronDown className="h-5 w-5 transition-transform data-[state=open]:rotate-180" />
                      </CollapsibleTrigger>
                      <CollapsibleContent className="p-4 pt-0">
                        <div className="space-y-4 pt-4">
                          <h5 className="font-semibold">Learning Resources (Sub-Modules)</h5>
                          {milestone.subModules.map(subModule => (
                            <div key={subModule.id} className="pl-6 border-l-2 ml-3">
                              <h6 className="font-medium">{subModule.title}</h6>
                              <div className="mt-2 space-y-2">
                                {subModule.resources.map((resource, idx) => (
                                  // --- MODIFIED: The <a> tag now has the onClick handler ---
                                  <a 
                                    href={resource.url} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    key={idx} 
                                    className="flex items-center space-x-2 p-2 bg-background rounded-md hover:bg-accent/50 transition-colors cursor-pointer"
                                    onClick={(e) => handleResourceClick(e, resource)}
                                  >
                                    {getResourceIcon(resource.type)}
                                    <span className="text-sm font-medium">{resource.title}</span>
                                  </a>
                                  // --- END MODIFICATION ---
                                ))}
                                {subModule.resources.length === 0 && (
                                  <p className="text-sm text-muted-foreground">No resources found for this topic.</p>
                                )}
                              </div>
                            </div>
                          ))}

                          {/* --- (QuizComponent logic is the same) --- */}
                          {!milestone.completed && milestone.quiz.length > 0 && (
                            <QuizComponent
                              milestoneTitle={milestone.title}
                              quizData={milestone.quiz}
                              onComplete={() => toggleMilestoneComplete(roadmap.id, milestone.id)}
                            />
                          )}

                          {milestone.completed && (
                            <div className="mt-4 flex items-center justify-center p-4 bg-green-500/10 rounded-lg">
                              <CheckCircle2 className="h-5 w-5 mr-2 text-green-500" />
                              <p className="font-medium text-green-500">Module Completed!</p>
                            </div>
                          )}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}