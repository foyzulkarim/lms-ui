import { useState, useEffect } from "react";
import { Link, useLocation, useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  LayoutDashboard,
  BookOpen,
  PlusCircle,
  Settings,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { fetcher } from "@/lib/api";
import CourseCreationForm from "../../course/components/CourseCreationForm";

// Define the course type
interface Course {
  _id: string;
  title: string;
  description: string;
  thumbnailUrl?: string; // Added for compatibility with CourseDetailsForm
  instructor: string;
  instructorAvatar?: string;
  categoryId: number;
  price?: string;
  rating?: string;
  status: string; // 'draft', 'published', 'archived'
  publishedAt?: string;
  studentCount?: number;
  completionRate?: number;
  featured?: boolean;
  bestseller?: boolean;
  isNew?: boolean;
}

// API response interface
interface CourseResponse {
  courses: Course[];
  total: number;
  page: number;
  limit: string | number;
}

// Component to display course grid with fetched data
function CoursesGrid({ setActiveTab }: { setActiveTab: (tab: string) => void }) {
  // Fetch courses from the API
  const { data, isLoading, error, refetch } = useQuery<CourseResponse>({
    queryKey: ["/api/courses"],
    queryFn: () => fetcher("/api/courses"),
  });

  const courses = data?.courses || [];

  // Function to update course status (publish/unpublish/archive)
  const updateCourseStatus = async (courseId: string, status: 'draft' | 'published' | 'archived') => {
    try {
      await fetch(`/api/creator/courses/${courseId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });
      
      // Refetch courses to update the UI
      refetch();
    } catch (error) {
      console.error('Error updating course status:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex flex-col md:flex-row gap-4 p-4 border rounded-lg">
            <Skeleton className="w-full md:w-48 h-32 rounded-md" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-16 w-full" />
              <div className="flex flex-wrap gap-2">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-8 w-20" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500">Failed to load courses. Please try again later.</div>;
  }

  if (!courses || courses?.length === 0) {
    return (
      <div className="text-center p-8">
        <h3 className="text-lg font-semibold mb-2">No courses yet</h3>
        <p className="text-gray-500 mb-4">You haven't created any courses yet.</p>
        <button 
          onClick={() => {
            setActiveTab("create");
            window.history.pushState(null, "", "/creator-dashboard/create-course");
          }}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium h-10 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Create Your First Course
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {courses?.map((course: Course) => (
        <div key={course._id} className="flex flex-col md:flex-row gap-4 p-4 border rounded-lg hover:shadow-md transition-shadow">
          <img 
            src={course.thumbnailUrl || "https://placehold.co/400x300?text=Course+Thumbnail"} 
            alt={`${course.title} thumbnail`} 
            className="w-full md:w-48 h-32 object-cover rounded-md"
          />
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold">{course.title}</h3>
                <p className="text-sm text-gray-500">
                  {course.status === 'published' && <span className="text-green-500 font-medium mr-2">Published</span>}
                  {course.status === 'draft' && <span className="text-amber-500 font-medium mr-2">Draft</span>}
                  {course.status === 'archived' && <span className="text-gray-500 font-medium mr-2">Archived</span>}
                  {course.publishedAt && <span>• Published {new Date(course.publishedAt).toLocaleDateString()}</span>}
                </p>
              </div>
              
              {/* Course stats */}
              {course.status === 'published' && (
                <div className="flex space-x-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                      <circle cx="9" cy="7" r="4"></circle>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                    </svg>
                    <span>{course.studentCount || 0} Students</span>
                  </div>
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 20V10"></path>
                      <path d="M12 20V4"></path>
                      <path d="M6 20v-6"></path>
                    </svg>
                    <span>{course.completionRate || 0}% Completion</span>
                  </div>
                </div>
              )}
            </div>
            
            <p className="mt-2 text-gray-700 line-clamp-2">
              {course.description || "No description provided"}
            </p>
            
            <div className="flex flex-wrap gap-2 mt-4">
              <Link href={`/creator-dashboard/courses/${course._id}/edit`}>
                <button
                  className="text-sm px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-100"
                  onClick={(e) => {
                    // Prevent the default Link behavior
                    e.preventDefault();
                    // Set the active tab to "create" to show the edit form
                    setActiveTab("create");
                    // Update the URL manually without query parameters
                    window.history.pushState(null, "", `/creator-dashboard/courses/${course._id}/edit`);
                  }}
                >
                  Edit
                </button>
              </Link>
              <Link href={`/creator-dashboard/courses/${course._id}/detail`}>
                <button
                  className="text-sm px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-100"
                  onClick={(e) => {
                    // Prevent the default Link behavior
                    e.preventDefault();
                    // Set the active tab to "create" to show the edit form
                    setActiveTab("create");
                    // Update the URL manually without query parameters
                    window.history.pushState(null, "", `/creator-dashboard/courses/${course._id}/detail`);
                  }}
                >
                  Details
                </button>
              </Link>
              <Link href={`/creator-dashboard/courses/${course._id}/curriculum`}>
                <button 
                  className="text-sm px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-100"
                  onClick={(e) => {
                    // Prevent the default Link behavior
                    e.preventDefault();
                    // Set the active tab to "create" to show the form
                    setActiveTab("create");
                    // Update the URL manually without query parameters
                    window.history.pushState(null, "", `/creator-dashboard/courses/${course._id}/curriculum`);
                  }}
                >
                  Curriculum
                </button>
              </Link>
              <Link href={`/course-player/${course._id}`}>
                <button className="text-sm px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-100">
                  Preview
                </button>
              </Link>
              {/* Status change buttons */}
              {course.status === 'published' ? (
                <button 
                  className="text-sm px-3 py-1 border border-red-300 text-red-600 rounded-md hover:bg-red-50"
                  onClick={() => updateCourseStatus(course._id, 'draft')}
                >
                  Unpublish
                </button>
              ) : course.status === 'archived' ? (
                <button 
                  className="text-sm px-3 py-1 border border-blue-300 text-blue-600 rounded-md hover:bg-blue-50"
                  onClick={() => updateCourseStatus(course._id, 'draft')}
                >
                  Restore
                </button>
              ) : (
                <button 
                  className="text-sm px-3 py-1 border border-green-300 text-green-600 rounded-md hover:bg-green-50"
                  onClick={() => updateCourseStatus(course._id, 'published')}
                >
                  Publish
                </button>
              )}
              
              {/* Archive button for published/draft courses */}
              {course.status !== 'archived' && (
                <button 
                  className="text-sm px-3 py-1 border border-gray-300 text-gray-600 rounded-md hover:bg-gray-50"
                  onClick={() => updateCourseStatus(course._id, 'archived')}
                >
                  Archive
                </button>
              )}
              
              {/* Students button - only visible for published courses */}
              {course.status === 'published' && (
                <Link href={`/courses/${course._id}/students`} onClick={(e) => {
                  // Prevent default so wouter can handle the navigation
                  e.preventDefault();
                  // Navigate programmatically
                  window.history.pushState(null, "", `/courses/${course._id}/students`);
                  // Force a reload to make sure route is processed properly
                  window.location.reload();
                }}>
                  <button className="text-sm px-3 py-1 border border-purple-300 text-purple-600 rounded-md hover:bg-purple-50 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                      <circle cx="9" cy="7" r="4"></circle>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                    </svg>
                    Students
                  </button>
                </Link>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function CreatorDashboardPage() {
  const [location] = useLocation();
  const [, params] = useRoute("/creator-dashboard/courses/:courseId/edit");
  const [, curriculumParams] = useRoute("/creator-dashboard/courses/:courseId/curriculum");
  const [, editCurriculumParams] = useRoute("/creator-dashboard/courses/:courseId/edit/curriculum");
  const [, detailParams] = useRoute("/creator-dashboard/courses/:courseId/detail");
  
  // Check if we're on the edit route
  const isEditRoute = !!params?.courseId;
  // Check if we're on the curriculum route
  const isCurriculumRoute = !!curriculumParams?.courseId;
  // Check if we're on the edit/curriculum route
  const isEditCurriculumRoute = !!editCurriculumParams?.courseId;
  // Check if we're on the detail route
  const isDetailRoute = !!detailParams?.courseId;
  
  // Use the path to determine which tab is active
  const path = location.split('/creator-dashboard')[1] || '';
  
  // Set the default active tab based on URL pattern
  const [activeTab, setActiveTab] = useState(
    isEditRoute || isCurriculumRoute || isEditCurriculumRoute || isDetailRoute ? "create" :
    path === "/courses" ? "courses" : 
    path === "/create-course" ? "create" : 
    path === "/settings" ? "settings" : "dashboard"
  );

  // Update active tab when location changes
  useEffect(() => {
    // Check if we're on the edit route - using the params from outside the effect
    const isEditPath = !!params?.courseId;
    const isCurriculumPath = !!curriculumParams?.courseId;
    const isEditCurriculumPath = !!editCurriculumParams?.courseId;
    const isDetailPath = !!detailParams?.courseId;
    
    // Get the base path
    const currentPath = location.split('/creator-dashboard')[1] || '';
    
    // Set the active tab based on the current path
    if (isEditPath || isCurriculumPath || isEditCurriculumPath || isDetailPath) {
      setActiveTab("create");
    } else if (currentPath === "/courses") {
      setActiveTab("courses");
    } else if (currentPath === "/create-course") {
      setActiveTab("create");
    } else if (currentPath === "/settings") {
      setActiveTab("settings");
    } else if (currentPath === "") {
      setActiveTab("dashboard");
    }
  }, [location, params, curriculumParams, editCurriculumParams, detailParams]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    // Navigate to the appropriate path
    let newPath = "/creator-dashboard";
    if (value === "courses") newPath += "/courses";
    else if (value === "create") newPath += "/create-course";
    else if (value === "settings") newPath += "/settings";
    
    // Preserve any existing URL parameters
    const urlParams = location.includes('?') ? location.split('?')[1] : '';
    if (urlParams) {
      newPath += `?${urlParams}`;
    }
    
    window.history.pushState(null, "", newPath);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Creator Dashboard</h1>
        <p className="text-gray-500">Manage your courses and creator settings</p>
      </div>
      
      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className="grid grid-cols-4 gap-4 mb-8 bg-transparent">
          <TabsTrigger 
            value="dashboard" 
            className="data-[state=active]:shadow-none data-[state=active]:border-indigo-500 data-[state=active]:border-b-2 rounded-none flex items-center justify-center py-2 px-4"
          >
            <LayoutDashboard className="mr-2 h-4 w-4" />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger 
            value="courses" 
            className="data-[state=active]:shadow-none data-[state=active]:border-indigo-500 data-[state=active]:border-b-2 rounded-none flex items-center justify-center py-2 px-4"
          >
            <BookOpen className="mr-2 h-4 w-4" />
            <span>Courses</span>
          </TabsTrigger>
          <TabsTrigger 
            value="create" 
            className="data-[state=active]:shadow-none data-[state=active]:border-indigo-500 data-[state=active]:border-b-2 rounded-none flex items-center justify-center py-2 px-4"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            <span>{isEditRoute ? "Edit Course" : "Create Course"}</span>
          </TabsTrigger>
          <TabsTrigger 
            value="settings" 
            className="data-[state=active]:shadow-none data-[state=active]:border-indigo-500 data-[state=active]:border-b-2 rounded-none flex items-center justify-center py-2 px-4"
          >
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboard" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Dashboard Overview</CardTitle>
              <CardDescription>
                A summary of your creator activities and statistics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Dashboard content will go here...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="courses" className="mt-0">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>My Courses</CardTitle>
                <CardDescription>
                  Manage your existing courses
                </CardDescription>
              </div>
              <Link href="/creator-dashboard/create-course">
                <button className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create Course
                </button>
              </Link>
            </CardHeader>
            <CardContent>
              <CoursesGrid setActiveTab={setActiveTab} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="create" className="mt-0">
          <Card>
            <CardContent className="p-0">
              {/* Get course ID from URL parameters or route parameters */}
              {(() => {
                // Check for edit/curriculum route first (most specific)
                if (editCurriculumParams?.courseId) {                  
                  return <CourseCreationForm courseId={editCurriculumParams.courseId} />;
                }
                
                // Check for detail route
                if (detailParams?.courseId) {
                  console.log("Creating CourseCreationForm with courseId from detail route:", detailParams.courseId);
                  return <CourseCreationForm courseId={detailParams.courseId} initialTab="details" />;
                }
                
                // Check for edit route
                if (params?.courseId) {
                  console.log("Creating CourseCreationForm with courseId from edit route:", params.courseId);
                  return <CourseCreationForm courseId={params.courseId} />;
                }
                
                // Check for curriculum route
                if (curriculumParams?.courseId) {
                  console.log("Creating CourseCreationForm with courseId from curriculum route:", curriculumParams.courseId);
                  return <CourseCreationForm courseId={curriculumParams.courseId} initialTab="curriculum" />;
                }
                
                // Finally, check query params (for backward compatibility)
                const urlParams = new URLSearchParams(location.includes('?') ? location.split('?')[1] : '');
                const queryIdStr = urlParams.get('id');
                
                if (queryIdStr) {
                  console.log("Creating CourseCreationForm with courseId from query:", queryIdStr);
                  return <CourseCreationForm courseId={queryIdStr} />;
                }
                
                // No course ID found, create a new course
                return <CourseCreationForm />;
              })()}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Creator Settings</CardTitle>
              <CardDescription>
                Manage your creator profile and preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Profile Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="display_name" className="text-sm font-medium">Display Name</label>
                      <input
                        id="display_name"
                        type="text"
                        defaultValue="Alex Morgan"
                        className="w-full px-3 py-2 border rounded-md"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-medium">Email</label>
                      <input
                        id="email"
                        type="email"
                        defaultValue="alex.morgan@example.com"
                        className="w-full px-3 py-2 border rounded-md"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label htmlFor="bio" className="text-sm font-medium">Bio</label>
                      <textarea
                        id="bio"
                        rows={4}
                        defaultValue="Web developer and educator with 10+ years of experience in JavaScript, React, and modern web technologies."
                        className="w-full px-3 py-2 border rounded-md"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Payment Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="payment_method" className="text-sm font-medium">Payment Method</label>
                      <select
                        id="payment_method"
                        className="w-full px-3 py-2 border rounded-md"
                        defaultValue="paypal"
                      >
                        <option value="paypal">PayPal</option>
                        <option value="bank">Bank Transfer</option>
                        <option value="stripe">Stripe</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="account_email" className="text-sm font-medium">Account Email</label>
                      <input
                        id="account_email"
                        type="email"
                        defaultValue="payments.alex@example.com"
                        className="w-full px-3 py-2 border rounded-md"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Notification Preferences</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <input
                        id="notify_enrollments"
                        type="checkbox"
                        defaultChecked
                      />
                      <label htmlFor="notify_enrollments" className="text-sm">Email me when someone enrolls in my course</label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        id="notify_reviews"
                        type="checkbox"
                        defaultChecked
                      />
                      <label htmlFor="notify_reviews" className="text-sm">Email me when I receive a new review</label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        id="notify_messages"
                        type="checkbox"
                        defaultChecked
                      />
                      <label htmlFor="notify_messages" className="text-sm">Email me when I receive a new message</label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        id="notify_marketing"
                        type="checkbox"
                      />
                      <label htmlFor="notify_marketing" className="text-sm">Send me marketing and promotional emails</label>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    Save Settings
                  </button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
