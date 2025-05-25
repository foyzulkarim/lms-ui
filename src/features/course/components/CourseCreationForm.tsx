import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Import our components
import CourseDetailsForm from "./CourseDetailsForm";
import CourseCurriculumForm from "./CourseCurriculumForm";
import CourseNavTabs from "./CourseNavTabs";

type TabType = "details" | "curriculum";

type CourseCreationFormProps = {
  courseId?: string;
  initialTab?: TabType;
};

export default function CourseCreationForm({ courseId: propsCourseId, initialTab }: CourseCreationFormProps = {}) {
  const [location, setLocation] = useLocation();
  
  // Prioritize props courseId over URL parameters
  const [currentCourseId, setCurrentCourseId] = useState<string | undefined>(propsCourseId);
  const isEditMode = !!currentCourseId;
  const { toast } = useToast();
  
  // Check if URL contains "curriculum" to determine the initial active tab
  const isCurriculumPath = location.includes('/curriculum');
  const [activeTab, setActiveTab] = useState<TabType>(
    initialTab ? initialTab : 
    (isCurriculumPath && currentCourseId ? "curriculum" : "details")
  );
  
  // If the URL and activeTab don't match, update the URL
  useEffect(() => {
    if (currentCourseId) {
      // Figure out the current route pattern
      const isCreatorDashboard = location.includes('/creator-dashboard');
      
      if (isCreatorDashboard) {
        // In creator dashboard, don't modify URLs - they're handled by the dashboard
        return;
      }
      
      // For standalone course editing, manage URLs
      const baseUrl = location.split('/curriculum')[0];
      
      if (activeTab === "curriculum") {
        // Add '/curriculum' to the path if not already there
        if (!location.includes('/curriculum')) {
          setLocation(`${baseUrl}/curriculum`, { replace: true });
        }
      } else {
        // Remove '/curriculum' from the path if present
        if (location.includes('/curriculum')) {
          setLocation(baseUrl, { replace: true });
        }
      }
    }
  }, [activeTab, currentCourseId, location, setLocation]);
  
  const handleTabChange = (tab: TabType) => {
    if (tab === "curriculum" && !currentCourseId) {
      toast({
        title: "Course Details Required",
        description: "Please save the course details before managing the curriculum.",
      });
      return;
    }
    setActiveTab(tab);
  };

  // Callback for when course details are saved (especially for a new course)
  const handleCourseSaved = (savedCourseId: string) => {
    if (!currentCourseId) { // If it was a new course
        setCurrentCourseId(savedCourseId);
    }
    setActiveTab("curriculum"); // Switch to curriculum tab
  };
  
  return (
    <div className="space-y-6">
      {/* Course Header */}
      <Card>
        <CardHeader>
          <CardTitle>{isEditMode && currentCourseId ? "Edit Course" : "Create New Course"}</CardTitle>
          <CardDescription>
            {isEditMode && currentCourseId
              ? "Edit the details of your existing course" 
              : "Fill in the details to create your new course"}
          </CardDescription>
          {isEditMode && currentCourseId && (
            <div className="text-sm text-gray-500 mt-1">
              Course ID: {currentCourseId}
            </div>
          )}
        </CardHeader>
      </Card>
      
      {/* Navigation Tabs */}
      <CourseNavTabs 
        activeTab={activeTab} 
        onChangeTab={(tab: string) => handleTabChange(tab as TabType)}
        tabOptions={["details", "curriculum"]} 
      />

      {/* Course Details Tab */}
      {activeTab === "details" && (
        <CourseDetailsForm 
          courseId={currentCourseId}
          onCourseSaved={handleCourseSaved}
        />
      )}

      {/* Curriculum Tab */}
      {activeTab === "curriculum" && currentCourseId && (
        <CourseCurriculumForm
          courseId={currentCourseId}
        />
      )}
      {activeTab === "curriculum" && !currentCourseId && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-gray-600">
              Please save the course details first to manage the curriculum.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
