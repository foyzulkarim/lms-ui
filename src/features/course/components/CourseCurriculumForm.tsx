import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Plus, Trash, ChevronDown, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import LessonEditModal from "./LessonEditModal";

interface Lesson {
  _id: string;
  title: string;
  videoUrl: string;
  content: string;
  order: number;
  duration: string;
}

interface Module {
  _id: string;
  title: string;
  order: number;
  lessons: Lesson[];
}

interface EditingLesson {
  _id?: string;
  moduleId: string;
  title: string;
  videoUrl: string;
  content: string;
  order: number;
  duration: string;
  tempId?: string;
}

interface CourseCurriculumFormProps {
  courseId: string;
}

export default function CourseCurriculumForm({
  courseId
}: CourseCurriculumFormProps) {
  const { toast } = useToast();
  const [modules, setModules] = useState<Module[]>([]);
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<EditingLesson | null>(null);

  // Fetch curriculum data
  const { data: curriculumData, isLoading } = useQuery({
    queryKey: ["/api/courses", courseId, "curriculum"],
    queryFn: async () => {
      try {
        const response = await apiRequest(`/api/courses/${courseId}/curriculum`);
        if (!response.ok) {
          throw new Error("Failed to fetch curriculum");
        }
        return await response.json();
      } catch (error) {
        console.error("Error fetching curriculum:", error);
        toast({ 
          title: "Error", 
          description: "Failed to load course curriculum.", 
          variant: "destructive" 
        });
        return { modules: [] };
      }
    },
    enabled: !!courseId,
  });

  // Set modules and expanded state when data is loaded
  useEffect(() => {
    if (curriculumData?.modules) {
      setModules(curriculumData.modules);
      // Initialize expanded state for all modules
      const expandedState: Record<string, boolean> = {};
      curriculumData.modules.forEach((module: Module) => {
        expandedState[module._id.toString()] = true; // Default expanded
      });
      setExpandedModules(expandedState);
    }
  }, [curriculumData]);

  // Individual mutations for modules and lessons
  
  // Add/Update Module mutation
  const moduleUpsertMutation = useMutation({
    mutationFn: async (module: Partial<Omit<Module, 'lessons'>> & { _id?: string, tempId?: string }) => {
      const method = module._id && !module.tempId ? 'PUT' : 'POST';
      const url = module._id && !module.tempId 
        ? `/api/courses/${courseId}/modules/${module._id}`
        : `/api/courses/${courseId}/modules`;
      
      // Remove tempId before sending to server
      const { tempId, ...serverModule } = module;
      
      const response = await apiRequest(url, serverModule, { method });
      
      if (!response.ok) {
        throw new Error(`Failed to ${module._id && !module.tempId ? 'update' : 'create'} module`);
      }
      
      const result = await response.json();
      return { ...result, tempId };
    },
    onSuccess: (data) => {
      // If this was a new module with a tempId, update the ID in the modules state
      if (data.tempId) {
        setModules(prevModules => 
          prevModules.map(module => 
            module._id === data.tempId 
              ? { ...module, _id: data._id } 
              : module
          )
        );
        
        // Also update the expanded state with the new ID
        setExpandedModules(prev => {
          const newState = { ...prev };
          if (prev[data.tempId.toString()]) {
            newState[data._id.toString()] = prev[data.tempId.toString()];
            delete newState[data.tempId.toString()];
          }
          return newState;
        });
      }
      
      toast({
        title: "Success",
        description: `Module ${data.tempId ? "created" : "updated"} successfully.`
      });
      
      // Refresh data from server to ensure everything is in sync
      queryClient.invalidateQueries({ queryKey: ['/api/courses', courseId, 'curriculum'] });
    },
    onError: (error) => {
      console.error("Error saving module:", error);
      toast({ 
        title: "Error", 
        description: "Failed to save module.", 
        variant: "destructive" 
      });
    }
  });

  // Delete Module mutation
  const moduleDeleteMutation = useMutation({
    mutationFn: async (moduleId: string) => {
      const response = await apiRequest(
        `/api/courses/${courseId}/modules/${moduleId}`,
        {},
        { method: 'DELETE' }
      );
      
      if (!response.ok) {
        throw new Error('Failed to delete module');
      }
      
      return moduleId;
    },
    onSuccess: (moduleId) => {
      // Optimistic update
      setModules(prevModules => prevModules.filter(m => m._id !== moduleId));
      
      toast({
        title: "Module Deleted",
        description: "Module has been deleted successfully."
      });
      queryClient.invalidateQueries({ queryKey: ['/api/courses', courseId, 'curriculum'] });
    },
    onError: (error) => {
      console.error("Error deleting module:", error);
      toast({ 
        title: "Error", 
        description: "Failed to delete module.", 
        variant: "destructive" 
      });
    }
  });

  // Add/Update Lesson mutation
  const lessonUpsertMutation = useMutation({
    mutationFn: async (lesson: EditingLesson & { tempId?: string }) => {
      const method = lesson._id && !lesson.tempId ? 'PUT' : 'POST';
      const url = lesson._id && !lesson.tempId 
        ? `/api/courses/${courseId}/modules/${lesson.moduleId}/lessons/${lesson._id}`
        : `/api/courses/${courseId}/modules/${lesson.moduleId}/lessons`;
      
      // Remove tempId before sending to server
      const { tempId, ...serverLesson } = lesson;
      
      const response = await apiRequest(url, serverLesson, { method });
      
      if (!response.ok) {
        throw new Error(`Failed to ${lesson._id && !lesson.tempId ? 'update' : 'create'} lesson`);
      }
      
      const result = await response.json();
      return { ...result, tempId, moduleId: lesson.moduleId };
    },
    onSuccess: (data) => {
      // If this was a new lesson with a tempId, update the ID in the modules state
      if (data.tempId) {
        setModules(prevModules => 
          prevModules.map(module => 
            module._id === data.moduleId 
              ? { 
                  ...module, 
                  lessons: module.lessons.map(lesson => 
                    lesson._id === data.tempId 
                      ? { ...lesson, _id: data._id } 
                      : lesson
                  ) 
                } 
              : module
          )
        );
      }
      
      toast({
        title: "Success",
        description: `Lesson ${data.tempId ? "created" : "updated"} successfully.`
      });
      
      // Refresh data from server to ensure everything is in sync
      queryClient.invalidateQueries({ queryKey: ['/api/courses', courseId, 'curriculum'] });
    },
    onError: (error) => {
      console.error("Error saving lesson:", error);
      toast({ 
        title: "Error", 
        description: "Failed to save lesson.", 
        variant: "destructive" 
      });
    }
  });

  // Delete Lesson mutation
  const lessonDeleteMutation = useMutation({
    mutationFn: async ({ moduleId, lessonId }: { moduleId: string, lessonId: string }) => {
      const response = await apiRequest(
        `/api/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}`,
        {},
        { method: 'DELETE' }
      );
      
      if (!response.ok) {
        throw new Error('Failed to delete lesson');
      }
      
      return { moduleId, lessonId };
    },
    onSuccess: ({ moduleId, lessonId }) => {
      // Optimistic update
      setModules(prevModules => prevModules.map(module => 
        module._id === moduleId 
          ? { 
              ...module, 
              lessons: module.lessons.filter(lesson => lesson._id !== lessonId)
            } 
          : module
      ));
      
      toast({
        title: "Lesson Deleted",
        description: "Lesson has been deleted successfully."
      });
      queryClient.invalidateQueries({ queryKey: ['/api/courses', courseId, 'curriculum'] });
    },
    onError: (error) => {
      console.error("Error deleting lesson:", error);
      toast({ 
        title: "Error", 
        description: "Failed to delete lesson.", 
        variant: "destructive" 
      });
    }
  });

  // Module functions
  const addModule = async () => {
    const newModule = {
      title: "New Module",
      order: modules.length + 1,
    };
    
    // Optimistic update first
    const tempId = Date.now().toString();
    const optimisticModule = {
      ...newModule,
      _id: tempId,
      lessons: []
    };
    
    setModules(prev => [...prev, optimisticModule]);
    setExpandedModules(prev => ({
      ...prev,
      [tempId]: true
    }));

    // Then save to server
    await moduleUpsertMutation.mutateAsync({
      ...newModule,
      tempId: tempId
    });
  };

  const toggleModuleExpanded = (moduleId: string) => {
    setExpandedModules({
      ...expandedModules,
      [moduleId.toString()]: !expandedModules[moduleId.toString()]
    });
  };

  const updateModuleTitle = (moduleId: string, title: string) => {
    // Update locally
    setModules(modules.map(module => 
      module._id === moduleId ? { ...module, title } : module
    ));
  };

  const saveModuleTitle = (moduleId: string) => {
    const module = modules.find(m => m._id === moduleId);
    if (!module) return;
    
    moduleUpsertMutation.mutate({
      _id: module._id,
      title: module.title,
      order: module.order
    });
  };

  const deleteModule = (moduleId: string) => {
    if (confirm("Are you sure you want to delete this module? All lessons will be deleted.")) {
      moduleDeleteMutation.mutate(moduleId);
    }
  };

  // Lesson functions
  const addLesson = (moduleId: string) => {
    const moduleIndex = modules.findIndex(m => m._id === moduleId);
    if (moduleIndex === -1) return;

    const lessonOrder = modules[moduleIndex].lessons.length + 1;
    
    setEditingLesson({
      moduleId,
      title: "",
      videoUrl: "",
      content: "",
      order: lessonOrder,
      duration: "",
      tempId: undefined,
    });
    
    setIsLessonModalOpen(true);
  };

  const editLesson = (moduleId: string, lesson: Lesson) => {
    setEditingLesson({
      _id: lesson._id,
      moduleId,
      title: lesson.title,
      videoUrl: lesson.videoUrl || "",
      content: lesson.content || "",
      order: lesson.order,
      duration: lesson.duration || "",
      tempId: undefined,
    });
    
    setIsLessonModalOpen(true);
  };

  const deleteLesson = (moduleId: string, lessonId: string) => {
    if (confirm("Are you sure you want to delete this lesson?")) {
      lessonDeleteMutation.mutate({ moduleId, lessonId });
    }
  };

  const handleLessonSave = async (lessonData: EditingLesson): Promise<void> => {
    // Optimistic update
    const moduleIndex = modules.findIndex(m => m._id === lessonData.moduleId);
    if (moduleIndex === -1) return;
    
    const updatedModules = [...modules];
    const module = updatedModules[moduleIndex];
    
    if (lessonData._id && !lessonData.tempId) {
      // Update existing lesson
      updatedModules[moduleIndex] = {
        ...module,
        lessons: module.lessons.map(lesson => 
          lesson._id === lessonData._id 
            ? { 
                ...lesson, 
                title: lessonData.title,
                videoUrl: lessonData.videoUrl,
                content: lessonData.content,
                duration: lessonData.duration
              } 
            : lesson
        )
      };
    } else {
      // Add new lesson with temporary ID
      const tempId = Date.now().toString();
      updatedModules[moduleIndex] = {
        ...module,
        lessons: [
          ...module.lessons,
          {
            _id: tempId,
            title: lessonData.title,
            videoUrl: lessonData.videoUrl,
            content: lessonData.content,
            order: lessonData.order,
            duration: lessonData.duration
          }
        ]
      };
      
      // Add tempId to lessonData for tracking
      lessonData = {
        ...lessonData,
        tempId: tempId
      };
    }
    
    setModules(updatedModules);
    
    // Save to server
    await lessonUpsertMutation.mutateAsync(lessonData);
    
    // Close modal
    setIsLessonModalOpen(false);
    setEditingLesson(null);
  };

  // Loading state
  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center p-4">
            <div className="inline-block w-6 h-6 border-2 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
            <span className="ml-2">Loading curriculum...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Course Curriculum</CardTitle>
          <CardDescription>
            Build your course structure with modules and lessons
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {modules.length === 0 ? (
            <div className="text-center py-8 border border-dashed rounded-lg">
              <p className="text-gray-500 mb-4">
                Your course curriculum is empty. Add your first module to get
                started.
              </p>
              <Button variant="outline" onClick={addModule}>
                <Plus className="mr-2 h-4 w-4" /> Create First Module
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Modules Accordion */}
              {modules.map((module) => (
                <div key={module._id} className="border rounded-lg">
                  <div 
                    className="p-4 bg-slate-50 rounded-t-lg flex items-center justify-between cursor-pointer"
                    onClick={(e) => {
                      // Prevent collapsing when clicking on input or buttons
                      if (
                        e.target instanceof HTMLInputElement ||
                        e.target instanceof HTMLButtonElement ||
                        (e.target instanceof Element && 
                          (e.target.closest('button') || e.target.tagName === 'svg' || e.target.tagName === 'path'))
                      ) {
                        return;
                      }
                      toggleModuleExpanded(module._id);
                    }}
                  >
                    <div className="flex items-center flex-1">
                      {expandedModules[module._id] ? (
                        <ChevronDown className="h-5 w-5 mr-2 text-gray-500" />
                      ) : (
                        <ChevronRight className="h-5 w-5 mr-2 text-gray-500" />
                      )}
                      <input
                        type="text"
                        value={module.title}
                        onChange={(e) => updateModuleTitle(module._id, e.target.value)}
                        onBlur={() => saveModuleTitle(module._id)}
                        className="text-lg font-semibold bg-transparent border-0 focus:outline-none focus:ring-0 flex-1"
                        placeholder="Module Title"
                        onClick={(e) => e.stopPropagation()} // Prevent collapse when editing title
                      />
                      <div className="text-sm text-gray-500 ml-2">
                        {module.lessons.length} lesson{module.lessons.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent collapse toggle
                          addLesson(module._id);
                        }}
                      >
                        <Plus className="mr-1 h-3 w-3" /> Add Lesson
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent collapse toggle
                          deleteModule(module._id);
                        }}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  {expandedModules[module._id] && (
                    <div className="p-4">
                      {module.lessons.length === 0 ? (
                        <div className="text-center py-4 border border-dashed rounded-lg">
                          <p className="text-gray-500 mb-2">
                            No lessons in this module
                          </p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => addLesson(module._id)}
                          >
                            <Plus className="mr-1 h-3 w-3" /> Add Lesson
                          </Button>
                        </div>
                      ) : (
                        <div className="divide-y">
                          {module.lessons.map((lesson) => (
                            <div
                              key={lesson._id}
                              className="py-3 flex items-center justify-between"
                            >
                              <div className="flex items-center space-x-2">
                                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-xs font-medium">
                                  {lesson.order}
                                </span>
                                <span className="font-medium">{lesson.title}</span>
                                {lesson.videoUrl && (
                                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                                    Video
                                  </span>
                                )}
                                {lesson.duration && (
                                  <span className="text-xs text-gray-500">
                                    {lesson.duration}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center space-x-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => editLesson(module._id, lesson)}
                                >
                                  Edit
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                  onClick={() => deleteLesson(module._id, lesson._id)}
                                >
                                  <Trash className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
              <div className="mt-4">
                <Button variant="outline" onClick={addModule}>
                  <Plus className="mr-2 h-4 w-4" /> Add Module
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lesson Edit Modal */}
      {isLessonModalOpen && editingLesson && (
        <LessonEditModal
          isOpen={isLessonModalOpen}
          onClose={() => {
            setIsLessonModalOpen(false);
            setEditingLesson(null);
          }}
          lesson={editingLesson}
          moduleId={editingLesson.moduleId}
          courseId={courseId}
          order={editingLesson.order}
          onSave={handleLessonSave}
        />
      )}
    </>
  );
} 
