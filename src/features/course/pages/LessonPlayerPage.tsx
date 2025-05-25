import { useState, useEffect } from "react";
import { useParams, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ChevronLeft, Share2, BookOpen, MessageSquare, ListChecks, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
// import VideoPlayer from "../components/VideoPlayer";
// import VideoPlayer from "../components/VideoPlayer2";
import LessonPlayer from "../components/LessonPlayer"
import LessonList from "../components/LessonList";
import AIAssistant from "../../ai-assistant/components/AIAssistant";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "../../auth/context/AuthContext";
import { isLocalDevelopment } from "@/lib/environment";

// Helper function to safely get lesson ID regardless of property name
const getLessonId = (lesson: any): string => {
  // Check for common ID field patterns
  return lesson?._id || lesson?.id || lesson?.lessonId || '';
};

// Define types for our data
interface Lesson {
  _id: string;
  title: string;
  duration: string;
  isCompleted: boolean;
  order: number;
  content?: string;
  videoUrl?: string;
  moduleId?: string;
  moduleTitle?: string;
}

interface Module {
  _id: string;
  courseId: string;
  title: string;
  description?: string;
  order: number;
  lessons: Lesson[];
}

interface Course {
  _id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  instructor: string;
}

interface CurriculumData {
  modules: Module[];
}

export default function LessonPlayerPage() {
  const params = useParams();
  const courseId = params.courseId || "0";
  const moduleId = params.moduleId || "0";
  const lessonId = params.lessonId || "0";
  const [activeTab, setActiveTab] = useState("overview");
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});
  const [noteContent, setNoteContent] = useState("");
  // Always use the module ID directly from URL params 
  // Use undefined if it's "0" (indicating not provided) to avoid type issues
  const lessonModuleId = moduleId !== "0" ? moduleId : undefined;
  const { isLoggedIn, isLocalDev } = useAuth();
  const effectiveIsLoggedIn = isLoggedIn || isLocalDev;

  // Debug log URL parameters
  useEffect(() => {
    console.log("URL parameters:", { courseId, moduleId, lessonId, lessonModuleId });
  }, [courseId, moduleId, lessonId, lessonModuleId]);

  // Course data query
  const { data: course } = useQuery<Course>({
    queryKey: [`/api/courses/${courseId}`],
    enabled: !!courseId,
  });

  // Get curriculum data (modules and lessons)
  const { data: curriculumData } = useQuery<CurriculumData>({
    queryKey: [`/api/courses/${courseId}/curriculum`],
    enabled: !!courseId,
  });

  // Get current lesson data using the new API structure with URL parameters
  const { data: currentLesson, isError: lessonError } = useQuery<Lesson>({
    queryKey: [`/api/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}`],
    enabled: !!courseId && moduleId !== "0" && lessonId !== "0",
  });

  // Fallback approach if direct URL parameters fail (might happen with legacy URLs)
  const { data: fallbackLesson } = useQuery<Lesson>({
    queryKey: [`/api/courses/${courseId}/lessons/${lessonId}`],
    enabled: !!courseId && moduleId === "0" && lessonId !== "0" && lessonError === true,
  });

  // Quiz questions for the current lesson
  // const { data: quizQuestions } = useQuery<any[]>({
  //   queryKey: [`/api/courses/${courseId}/modules/${lessonModuleId}/lessons/${lessonId}/quiz`],
  //   enabled: !!courseId && !!lessonModuleId && !!lessonId,
  // });

  // Notes for the current lesson
  // const { data: note } = useQuery<any>({
  //   queryKey: [`/api/courses/${courseId}/modules/${lessonModuleId}/lessons/${lessonId}/note`],
  //   enabled: !!courseId && !!lessonModuleId && !!lessonId && effectiveIsLoggedIn,
  // });

  // Save note mutation - use moduleId from URL directly
  const saveNoteMutation = useMutation({
    mutationFn: async (content: string) => {
      if (moduleId === "0") return Promise.reject("Module ID not found in URL");

      return apiRequest(
        `/api/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}/note`,
        { content },
        { method: "POST" }
      );
    },
    onSuccess: () => {
      if (moduleId !== "0") {
        queryClient.invalidateQueries({
          queryKey: [`/api/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}/note`]
        });
      }
    },
  });

  // Check quiz answers mutation - use moduleId from URL directly
  const checkQuizAnswersMutation = useMutation({
    mutationFn: async (answers: Record<number, string>) => {
      if (moduleId === "0") return Promise.reject("Module ID not found in URL");

      return apiRequest(
        `/api/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}/quiz/check`,
        { answers },
        { method: "POST" }
      );
    },
  });

  useEffect(() => {
    // if (note) {
    //   setNoteContent(note.content);
    // } else {
    //   setNoteContent("");
    // }
    setNoteContent("");
  }, [/* note */]);

  const handleSaveNote = () => {
    if (lessonId) {
      saveNoteMutation.mutate(noteContent);
    }
  };

  const handleCheckAnswers = () => {
    // if (quizQuestions && quizQuestions.length > 0) {
    //   checkQuizAnswersMutation.mutate(quizAnswers);
    // }
    checkQuizAnswersMutation.mutate(quizAnswers);
  };

  // Extract modules from curriculum data
  const modules = curriculumData?.modules || [];

  // We now directly use moduleId from URL params
  // This effect just ensures lessons have moduleId property set for data consistency
  useEffect(() => {
    // Only attempt to find module if we have modules data and need to find it
    if (modules.length > 0 && lessonId !== "0") {
      // Ensure all lessons have their module IDs properly set
      for (const module of modules) {
        for (const lesson of module.lessons) {
          if (!lesson.moduleId) {
            lesson.moduleId = module._id;
            lesson.moduleTitle = module.title;
          }
        }
      }

      // Log for debugging purposes if this is a legacy route without module ID
      if (moduleId === "0") {
        console.log("Legacy route detected - module ID not in URL");
        // Try to find which module contains this lesson for diagnostic purposes
        for (const module of modules) {
          const foundLesson = module.lessons.find(lesson =>
            getLessonId(lesson) === lessonId
          );

          if (foundLesson) {
            console.log(`Found lesson ${lessonId} in module ${module._id}`);
            break;
          }
        }
      }
    }
  }, [moduleId, lessonId, modules]);

  // Calculate progress - ensure all lessons have moduleId property
  const allLessons = modules.flatMap((module: Module) =>
    module.lessons.map(lesson => ({
      ...lesson,
      moduleId: lesson.moduleId || module._id, // Use existing moduleId or set from module
      moduleTitle: lesson.moduleTitle || module.title
    }))
  );
  const totalLessons = allLessons.length || 0;
  const completedLessons = allLessons.filter((lesson: Lesson) => lesson.isCompleted).length || 0;
  const progressPercentage = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

  // Add debug logging for API parameters
  useEffect(() => {
    console.log("LessonPlayerPage loaded with parameters:", {
      courseId,
      providedModuleId: moduleId,
      resolvedModuleId: lessonModuleId,
      lessonId,
      hasModulesData: modules.length > 0
    });

    if (!lessonModuleId && modules.length > 0) {
      console.warn("Module ID not available - will attempt to find based on lesson ID");
    }

    if (!lessonModuleId && !modules.length) {
      console.error("Cannot resolve module ID: No modules data available and no moduleId in URL");
    }
  }, [courseId, moduleId, lessonModuleId, lessonId, modules]);

  // Add more detailed debug logging about the data structure
  useEffect(() => {
    if (curriculumData && curriculumData.modules) {
      console.log("Curriculum data structure:", {
        moduleCount: curriculumData.modules.length,
        firstModule: curriculumData.modules[0] ? {
          id: curriculumData.modules[0]._id,
          lessonCount: curriculumData.modules[0].lessons?.length || 0
        } : null,
        lessonSample: curriculumData.modules[0]?.lessons?.[0] ? {
          id: curriculumData.modules[0].lessons[0]._id,
          moduleId: curriculumData.modules[0].lessons[0].moduleId,
          autoAddedModuleId: curriculumData.modules[0]._id
        } : null
      });

      // Check if lessons have moduleId
      const lessonsWithoutModuleId = curriculumData.modules.flatMap(module =>
        module.lessons.filter(lesson => !lesson.moduleId)
      );

      if (lessonsWithoutModuleId.length > 0) {
        console.warn(`Found ${lessonsWithoutModuleId.length} lessons without moduleId property`);
      }
    }
  }, [curriculumData]);

  // Determine the effective lesson (use fallback if needed)
  const effectiveLesson = currentLesson || fallbackLesson;

  // Enhanced loading state with debugging info
  const isLoading = !course || !effectiveLesson;
  const isMissingModuleId = moduleId === "0" && lessonId !== "0";

  // Add debug logging for loading state
  useEffect(() => {
    console.log("Loading state:", { 
      isLoading, 
      hasCourse: !!course, 
      hasEffectiveLesson: !!effectiveLesson,
      currentLesson,
      fallbackLesson,
      isMissingModuleId,
      courseId,
      moduleId,
      lessonId
    });
  }, [isLoading, course, effectiveLesson, currentLesson, fallbackLesson, isMissingModuleId, courseId, moduleId, lessonId]);

  if (isLoading) {
    return <div className="py-10 bg-white text-center">
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-48 mx-auto mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-64 mx-auto"></div>
        <div className="mt-4 text-red-500 text-sm">
          {!course && <div>Waiting for course data...</div>}
          {!effectiveLesson && <div>Waiting for lesson data...</div>}
          {isMissingModuleId && modules.length > 0 && (
            <div className="mt-2 text-amber-600">
              Module ID missing from URL - this might cause issues with API requests
            </div>
          )}
        </div>
      </div>
    </div>;
  }

  // For templating - hardcoded quiz questions (when actual data is commented out)
  const quizQuestions = [
    {
      id: 1,
      question: "Sample quiz question 1?",
      options: ["Option A", "Option B", "Option C", "Option D"]
    },
    {
      id: 2,
      question: "Sample quiz question 2?",
      options: ["Option A", "Option B", "Option C", "Option D"]
    }
  ];

  return (
    <section className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex flex-col">
      {/* Top navigation bar */}
      <header className="border-b border-gray-200 py-3 px-4 bg-white flex items-center justify-between shadow-sm sticky top-0 z-30">
        <div className="flex items-center">
          <Link
            href={`/course/${courseId}`}
            className="flex items-center text-gray-700 hover:text-primary mr-4 border border-gray-200 rounded-md py-1 px-2 hover:bg-gray-50 transition-colors"
            onClick={e => {
              e.preventDefault();
              window.location.href = `/course/${courseId}`;
            }}
          >
            <ChevronLeft className="h-5 w-5" />
            <span className="ml-1 text-sm">Back to course</span>
          </Link>              <div>
            <h1 className="text-lg font-semibold tracking-tight">{course.title}</h1>
            <div className="flex items-center text-sm text-gray-500">
              <span>{effectiveLesson?.title}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="text-gray-600 hover:text-primary transition-colors">
            <Share2 className="h-5 w-5" />
          </button>
          <Progress value={progressPercentage} className="w-24 h-2 rounded-full bg-gray-200" />
          <span className="text-sm text-gray-600 font-medium">{Math.round(progressPercentage)}%</span>
        </div>
      </header>
      <div className="flex flex-col md:flex-row h-full">
        {/* Main content area */}
        <div className="md:w-2/3 lg:w-3/4 p-2 md:p-6">
          {/* Video player area */}
          <div className="bg-black rounded-2xl shadow-lg overflow-hidden mb-6 relative">
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10 pointer-events-none" />
            {/* Added explicit conditional rendering of VideoPlayer based on lesson ID */}
            {effectiveLesson?._id ? (
              <LessonPlayer
                lessonId={effectiveLesson._id}
                title={effectiveLesson.title || ''}
                courseId={courseId}
                moduleId={moduleId}
              />
            ) : (
              <div className="p-4 text-red-500">
                Error: No lesson ID available. Check the URL parameters.
              </div>
            )}
          </div>
          {/* Lesson details area */}
          <div className="">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="border-b border-gray-200 w-full justify-start mb-6 bg-white rounded-t-xl shadow-sm">
                <TabsTrigger value="overview" className="px-6 py-3 data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary font-medium transition-colors data-[state=active]:bg-primary/10 rounded-t-lg">
                  <span className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4" /> Overview
                  </span>
                </TabsTrigger>
                <TabsTrigger value="notes" className="px-6 py-3 data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary font-medium transition-colors data-[state=active]:bg-primary/10 rounded-t-lg">
                  <span className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" /> Notes
                  </span>
                </TabsTrigger>
                {effectiveIsLoggedIn && (
                  <TabsTrigger value="resources" className="px-6 py-3 data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary font-medium transition-colors data-[state=active]:bg-primary/10 rounded-t-lg">
                    <span className="flex items-center gap-2">
                      <ListChecks className="h-4 w-4" /> Resources
                    </span>
                  </TabsTrigger>
                )}
                <TabsTrigger value="ai-assistant" className="px-6 py-3 data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary font-medium transition-colors data-[state=active]:bg-primary/10 rounded-t-lg">
                  <span className="flex items-center gap-2">
                    <Bot className="h-4 w-4" /> Ask AI Assistant
                  </span>
                </TabsTrigger>
              </TabsList>
              <TabsContent value="overview">
                <div className="bg-white rounded-xl shadow p-6 mb-8">
                  <h2 className="text-xl font-semibold mb-4">Current Lesson: {effectiveLesson?.title}</h2>
                  <div className="text-gray-700 mb-6 text-base">
                    {effectiveLesson?.content || (
                      <p>
                        In this lesson, you'll learn core concepts that are essential for mastering the subject.
                        Follow along with the video and complete the exercises to reinforce your learning.
                      </p>
                    )}
                  </div>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                    <h3 className="font-medium mb-2">Key Takeaways</h3>
                    <ul className="list-disc pl-5 text-gray-700 space-y-1">
                      <li>Understanding the fundamental principles</li>
                      <li>How to apply these concepts in real-world scenarios</li>
                      <li>Best practices and common pitfalls to avoid</li>
                      <li>Tips for further learning and practice</li>
                    </ul>
                  </div>
                  {/* Quiz section */}
                  {quizQuestions && quizQuestions.length > 0 && (
                    <div className="bg-background rounded-xl p-6 border border-gray-200 mb-6 shadow-sm">
                      <h3 className="text-lg font-semibold mb-4">Knowledge Check</h3>
                      <p className="mb-6 text-gray-600">Test your understanding with this quick quiz.</p>
                      <div className="space-y-6">
                        {quizQuestions.map((question, index) => {
                          const defaultOptions = ["Option A", "Option B", "Option C", "Option D"];
                          let parsedOptions: string[] = defaultOptions;
                          try {
                            if (question.options) {
                              let optionsArray;
                              if (typeof question.options === 'string') {
                                optionsArray = JSON.parse(question.options);
                              } else if (typeof question.options === 'object') {
                                optionsArray = question.options;
                              }
                              if (Array.isArray(optionsArray) && optionsArray.length > 0) {
                                parsedOptions = optionsArray.map(opt => String(opt));
                              }
                            }
                          } catch (e) {
                            console.error("Error handling quiz options:", e);
                          }
                          return (
                            <div key={question.id} className="bg-white rounded-lg shadow p-4 mb-2 border border-gray-100 transition-all hover:shadow-md">
                              <p className="font-medium mb-2 text-gray-900">{index + 1}. {question.question}</p>
                              <RadioGroup
                                value={quizAnswers[question.id] || ""}
                                onValueChange={value => setQuizAnswers({ ...quizAnswers, [question.id]: value })}
                              >
                                <div className="space-y-2">
                                  {parsedOptions.map((option, i) => (
                                    <div key={i} className="flex items-center space-x-2 group transition-all">
                                      <RadioGroupItem value={option.toString()} id={`q${question.id}-opt${i}`} className="transition-all group-hover:scale-105" />
                                      <Label htmlFor={`q${question.id}-opt${i}`} className="cursor-pointer transition-colors group-hover:text-primary">{option.toString()}</Label>
                                    </div>
                                  ))}
                                </div>
                              </RadioGroup>
                            </div>
                          );
                        })}
                      </div>
                      <Button
                        className="mt-6 bg-primary hover:bg-primary/90 transition-colors shadow"
                        onClick={handleCheckAnswers}
                        disabled={checkQuizAnswersMutation.isPending || !effectiveIsLoggedIn}
                      >
                        {checkQuizAnswersMutation.isPending ? "Checking..." : "Check Answers"}
                      </Button>
                      {!effectiveIsLoggedIn && <div className="text-xs text-red-500 mt-2">Login to check answers</div>}
                    </div>
                  )}
                </div>
              </TabsContent>
              <TabsContent value="notes">
                <div className="bg-white rounded-xl shadow p-6">
                  <h3 className="text-lg font-semibold mb-4">Your Notes</h3>
                  <Textarea
                    className="w-full border border-gray-300 rounded-lg p-3 min-h-[200px] focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
                    placeholder="Add your notes for this lesson here..."
                    value={noteContent}
                    onChange={e => setNoteContent(e.target.value)}
                    disabled={!effectiveIsLoggedIn}
                  />
                  {!effectiveIsLoggedIn && <div className="text-xs text-red-500 mt-2">Login to take notes</div>}
                  <Button
                    variant="secondary"
                    className="mt-3 bg-gray-100 hover:bg-gray-200 text-foreground flex items-center gap-2 shadow"
                    onClick={handleSaveNote}
                    disabled={saveNoteMutation.isPending || !effectiveIsLoggedIn}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    {saveNoteMutation.isPending ? "Saving..." : "Save Notes"}
                  </Button>
                </div>
              </TabsContent>
              {effectiveIsLoggedIn && (
                <TabsContent value="resources">
                  <div className="bg-white rounded-xl shadow p-6">
                    <h3 className="text-lg font-semibold mb-4">Course Resources</h3>
                    <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                      <p className="text-gray-700 mb-4">
                        Access additional materials to enhance your learning experience.
                      </p>
                      <ul className="space-y-3">
                        <li className="flex items-center text-primary hover:text-secondary">
                          <a href="#" className="hover:underline">Course slides (PDF)</a>
                        </li>
                        <li className="flex items-center text-primary hover:text-secondary">
                          <a href="#" className="hover:underline">Exercise files</a>
                        </li>
                        <li className="flex items-center text-primary hover:text-secondary">
                          <a href="#" className="hover:underline">Reference guide</a>
                        </li>
                      </ul>
                    </div>
                  </div>
                </TabsContent>
              )}
              <TabsContent value="ai-assistant">
                <div className="h-[500px] overflow-hidden bg-white rounded-xl shadow p-4">
                  <AIAssistant lessonTitle={effectiveLesson?.title} disabled={!effectiveIsLoggedIn} />
                </div>
                {!effectiveIsLoggedIn && <div className="text-xs text-red-500 mt-2">Login to chat with AI</div>}
              </TabsContent>
            </Tabs>
          </div>
        </div>
        {/* Sidebar with course content */}
        <div className="md:w-1/3 lg:w-1/4 border-l border-gray-200 bg-white/80 sticky top-[64px] h-[calc(100vh-64px)] shadow-inner p-2 md:p-4">
          <LessonList
            courseId={courseId}
            modules={modules.map(module => ({
              ...module,
              lessons: module.lessons.map(lesson => ({
                ...lesson,
                moduleId: lesson.moduleId || module._id
              }))
            }))}
            // The LessonList component will use URL params directly,
            // but we still pass these as fallbacks
            currentLessonId={lessonId}
            currentModuleId={moduleId}
            isLocked={!effectiveIsLoggedIn}
          />
        </div>
      </div>
    </section>
  );
}
