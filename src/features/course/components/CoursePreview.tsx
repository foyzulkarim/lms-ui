import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronDown, ChevronRight } from "lucide-react";

interface Lesson {
  id: number;
  title: string;
  videoUrl: string;
  content: string;
  order: number;
  duration: string;
}

interface Module {
  id: number;
  title: string;
  order: number;
  lessons: Lesson[];
}

interface CoursePreviewProps {
  title: string;
  description: string;
  categoryName: string;
  difficulty: string;
  thumbnailUrl: string;
  modules: Module[];
  expandedModules: Record<string, boolean>;
  onToggleModuleExpanded: (moduleId: number) => void;
}

export default function CoursePreview({
  title,
  description,
  categoryName,
  difficulty,
  thumbnailUrl,
  modules,
  expandedModules,
  onToggleModuleExpanded
}: CoursePreviewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Course Preview</CardTitle>
        <CardDescription>
          Review your course before publishing
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {/* Course Header Preview */}
          <div className="border rounded-lg overflow-hidden">
            <div className="relative h-48 bg-gray-100">
              {thumbnailUrl ? (
                <img
                  src={thumbnailUrl}
                  alt="Course thumbnail"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-400">
                    No thumbnail uploaded
                  </p>
                </div>
              )}
            </div>
            <div className="p-4">
              <h2 className="text-xl font-bold">
                {title || "Course Title"}
              </h2>
              <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                <span>{categoryName || "Category"}</span>
                <span>•</span>
                <span>
                  {difficulty === "beginner"
                    ? "Beginner"
                    : difficulty === "intermediate"
                    ? "Intermediate"
                    : difficulty === "advanced"
                    ? "Advanced"
                    : difficulty === "all-levels"
                    ? "All Levels"
                    : "Difficulty Level"}
                </span>
              </div>
              <div className="mt-4">
                <p className="text-gray-700">
                  {description || "No description provided"}
                </p>
              </div>
            </div>
          </div>

          {/* Curriculum Preview */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Curriculum</h3>
            {modules.length === 0 ? (
              <p className="text-gray-500 italic">
                No modules or lessons created yet
              </p>
            ) : (
              <div className="space-y-4">
                {modules.map((module) => (
                  <div key={module.id} className="border rounded-lg">
                    <div 
                      className="p-3 bg-slate-50 font-semibold flex items-center justify-between cursor-pointer"
                      onClick={() => onToggleModuleExpanded(module.id)}
                    >
                      <div className="flex items-center">
                        {expandedModules[module.id.toString()] ? (
                          <ChevronDown className="h-4 w-4 mr-2 text-gray-500" />
                        ) : (
                          <ChevronRight className="h-4 w-4 mr-2 text-gray-500" />
                        )}
                        {module.title}
                      </div>
                      <span className="text-xs text-gray-500 font-normal">
                        {module.lessons.length} lesson{module.lessons.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    {expandedModules[module.id.toString()] && (
                      <div className="p-3">
                        {module.lessons.length === 0 ? (
                          <p className="text-gray-500 italic text-sm">
                            No lessons in this module
                          </p>
                        ) : (
                          <ul className="space-y-2">
                            {module.lessons.map((lesson) => (
                              <li
                                key={lesson.id}
                                className="flex items-center text-sm p-2 hover:bg-gray-50 rounded"
                              >
                                <span className="w-4 h-4 mr-2 bg-gray-200 rounded-full flex items-center justify-center text-xs">
                                  {lesson.order}
                                </span>
                                {lesson.title}
                                {lesson.videoUrl && (
                                  <span className="ml-2 text-xs text-blue-500">
                                    (Video)
                                  </span>
                                )}
                                {lesson.duration && (
                                  <span className="ml-2 text-xs text-gray-500">
                                    {lesson.duration}
                                  </span>
                                )}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 
