import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowLeft,
  Search,
  UserCircle,
  Clock,
  SortAsc,
  SortDesc,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { format, parseISO } from "date-fns";
import { Button } from "@/components/ui/button";

interface Student {
  id: number;
  name: string;
  email: string;
  progress: number;
  lastActive: string;
}

export default function CourseStudentsPage() {
  // With wouter, extract courseId from the URL path
  const [location] = useLocation();
  const courseIdMatch = location.match(/\/courses\/(\d+)\/students/);
  const courseId = courseIdMatch ? parseInt(courseIdMatch[1], 10) : 0;
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<keyof Student>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  interface CourseDetails {
    id: number;
    title: string;
    description: string;
    thumbnailUrl: string;
    instructor: string;
    status: string;
    studentCount?: number;
    completionRate?: number;
  }
  
  // Fetch course details
  const { data: course, isLoading: isLoadingCourse } = useQuery<CourseDetails>({
    queryKey: [`/api/courses/${courseId}`],
  });

  // Fetch student data for this course
  const { data: students, isLoading: isLoadingStudents } = useQuery<Student[]>({
    queryKey: [`/api/courses/${courseId}/students`],
  });

  // Handle sorting
  const handleSort = (field: keyof Student) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Filter and sort students
  const filteredStudents = students
    ? students.filter(
        (student) =>
          student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          student.email.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const sortedStudents = [...filteredStudents].sort((a, b) => {
    if (sortField === "progress") {
      return sortDirection === "asc"
        ? a.progress - b.progress
        : b.progress - a.progress;
    } else if (sortField === "lastActive") {
      const dateA = new Date(a.lastActive).getTime();
      const dateB = new Date(b.lastActive).getTime();
      return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
    } else {
      const valueA = a[sortField].toString().toLowerCase();
      const valueB = b[sortField].toString().toLowerCase();
      return sortDirection === "asc"
        ? valueA.localeCompare(valueB)
        : valueB.localeCompare(valueA);
    }
  });

  // Format date to relative time
  const formatRelativeTime = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      const now = new Date();
      const diffInMinutes = Math.round(
        (now.getTime() - date.getTime()) / (1000 * 60)
      );

      if (diffInMinutes < 60) {
        return `${diffInMinutes} ${
          diffInMinutes === 1 ? "minute" : "minutes"
        } ago`;
      } else if (diffInMinutes < 24 * 60) {
        const hours = Math.floor(diffInMinutes / 60);
        return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
      } else {
        const days = Math.floor(diffInMinutes / (60 * 24));
        if (days < 7) {
          return `${days} ${days === 1 ? "day" : "days"} ago`;
        } else {
          return format(date, "MMM d, yyyy");
        }
      }
    } catch (error) {
      return "Invalid date";
    }
  };

  // Loading states
  if (isLoadingCourse) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center mb-6">
          <Link href="/creator-dashboard/courses">
            <Button variant="ghost" size="sm" className="mr-4">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
          </Link>
          <Skeleton className="h-8 w-64" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-10 w-full mb-4" />
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header with back button */}
      <div className="flex items-center mb-6">
        <Link href="/creator-dashboard/courses">
          <Button variant="ghost" size="sm" className="mr-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Courses
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Course Students</h1>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>
            {course?.title || "Course"} - Student Enrollment
          </CardTitle>
          <CardDescription>
            View and manage students enrolled in this course
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search input */}
          <div className="mb-6 relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search students by name or email..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Students table */}
          {isLoadingStudents ? (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : !students || students.length === 0 ? (
            <div className="text-center py-8">
              <UserCircle className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-lg font-medium">No students yet</h3>
              <p className="text-sm text-gray-500 mt-1">
                There are no students enrolled in this course yet.
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead
                      className="cursor-pointer"
                      onClick={() => handleSort("name")}
                    >
                      <div className="flex items-center">
                        Student
                        {sortField === "name" &&
                          (sortDirection === "asc" ? (
                            <SortAsc className="ml-1 h-4 w-4" />
                          ) : (
                            <SortDesc className="ml-1 h-4 w-4" />
                          ))}
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer"
                      onClick={() => handleSort("email")}
                    >
                      <div className="flex items-center">
                        Email
                        {sortField === "email" &&
                          (sortDirection === "asc" ? (
                            <SortAsc className="ml-1 h-4 w-4" />
                          ) : (
                            <SortDesc className="ml-1 h-4 w-4" />
                          ))}
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer text-right"
                      onClick={() => handleSort("progress")}
                    >
                      <div className="flex items-center justify-end">
                        Progress
                        {sortField === "progress" &&
                          (sortDirection === "asc" ? (
                            <SortAsc className="ml-1 h-4 w-4" />
                          ) : (
                            <SortDesc className="ml-1 h-4 w-4" />
                          ))}
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer text-right"
                      onClick={() => handleSort("lastActive")}
                    >
                      <div className="flex items-center justify-end">
                        Last Active
                        {sortField === "lastActive" &&
                          (sortDirection === "asc" ? (
                            <SortAsc className="ml-1 h-4 w-4" />
                          ) : (
                            <SortDesc className="ml-1 h-4 w-4" />
                          ))}
                      </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedStudents.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">
                        {student.name}
                      </TableCell>
                      <TableCell>{student.email}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end">
                          <span className="mr-2">{student.progress}%</span>
                          <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${
                                student.progress >= 75
                                  ? "bg-green-500"
                                  : student.progress >= 40
                                  ? "bg-yellow-500"
                                  : "bg-red-500"
                              }`}
                              style={{ width: `${student.progress}%` }}
                            />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end text-gray-500">
                          <Clock className="mr-1 h-3 w-3" />
                          {formatRelativeTime(student.lastActive)}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}