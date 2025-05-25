import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import CourseCard from "./CourseCard";
import CategoryFilter from "./CategoryFilter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ArrowDown } from "lucide-react";
import { fetcher } from "@/lib/api";
import { CATEGORIES } from "@/lib/constants";

// Inline types for Course and Category
interface Course {
  _id: string;
  title: string;
  thumbnailUrl: string;
  instructor: string;
  instructorAvatar?: string;
  categoryId: number;
  price?: string;
  rating?: string;
  isNew?: boolean;
  bestseller?: boolean;
  totalLessons: number;
  totalDuration?: string;
  progress?: number;
  completedLessons?: number;
}

// API response interface
interface CourseResponse {
  courses: Course[];
  total: number;
  page: number;
  limit: string | number;
}

interface Category {
  id: number;
  name: string;
}

interface CourseGridProps {
  inProgress?: boolean;
  title: string;
  subtitle?: string;
  viewAllLink?: string;
  viewAllText?: string;
  limit?: number;
  categoryId?: number;
}

export default function CourseGrid({
  inProgress = false,
  title,
  subtitle,
  viewAllLink,
  viewAllText = "View all courses",
  limit,
  categoryId,
}: CourseGridProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(categoryId || null);
  const [currentLimit, setCurrentLimit] = useState(limit || 8);

  // Use hardcoded categories
  const categories = CATEGORIES;

  // Fetch courses with filtering from real API
  const endpoint = inProgress ? "/api/courses/in-progress" : "/api/courses";
  const queryParams = new URLSearchParams();
  if (searchQuery) queryParams.append("search", searchQuery);
  if (selectedCategory) queryParams.append("categoryId", selectedCategory.toString());
  if (currentLimit) queryParams.append("limit", currentLimit.toString());
  const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';

  const { data, isLoading } = useQuery<CourseResponse>({
    queryKey: [endpoint, searchQuery, selectedCategory, currentLimit],
    queryFn: async () => {
      return fetcher<CourseResponse>(`${endpoint}${queryString}`);
    },
  });

  const courses = data?.courses || [];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // The query is automatically updated via the queryKey
  };

  const handleCategoryChange = (id: number | null) => {
    setSelectedCategory(id);
  };

  const handleLoadMore = () => {
    setCurrentLimit((prev) => prev + 8);
  };

  return (
    <div className="mb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold mb-1">{title}</h2>
          {subtitle && <p className="text-gray-600">{subtitle}</p>}
        </div>
        {viewAllLink && (
          <a href={viewAllLink} className="mt-4 md:mt-0 text-primary hover:text-secondary font-medium transition-colors">
            {viewAllText} <ArrowDown className="inline ml-1 h-4 w-4 rotate-[-90deg]" />
          </a>
        )}
      </div>

      {!inProgress && (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0 mb-6">
          <CategoryFilter 
            categories={categories || []} 
            selectedCategoryId={selectedCategory} 
            onChange={handleCategoryChange} 
          />
          
          <form onSubmit={handleSearchSubmit} className="relative w-full md:w-auto">
            <Input
              type="text"
              placeholder="Search courses..."
              className="w-full md:w-64 bg-white border border-gray-200 rounded-lg py-2 px-4 pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          </form>
        </div>
      )}
      
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-lg overflow-hidden shadow-sm h-[400px] animate-pulse">
              <div className="bg-gray-200 h-48 w-full"></div>
              <div className="p-5">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-3"></div>
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="flex items-center mb-4">
                  <div className="rounded-full bg-gray-200 h-6 w-6 mr-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                </div>
                <div className="h-10 bg-gray-200 rounded w-full"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {courses?.map((course) => (
              <CourseCard
                key={course._id}
                _id={course._id}
                title={course.title}
                thumbnailUrl={course.thumbnailUrl}
                instructor={course.instructor}
                instructorAvatar={course.instructorAvatar}
                category={categories.find(c => c.id === course.categoryId)?.name || ""}
                price={course.price}
                rating={course.rating}
                isNew={course.isNew}
                isBestseller={course.bestseller}
                isInProgress={inProgress}
                progress={course.progress}
                completedLessons={course.completedLessons}
                totalLessons={course.totalLessons}
                remainingTime={inProgress ? "2 hrs" : undefined} // This would be calculated
              />
            ))}
          </div>
          
          {!limit && courses && courses.length >= currentLimit && (
            <div className="mt-10 text-center">
              <Button
                variant="outline"
                className="btn-outline"
                onClick={handleLoadMore}
              >
                Load more courses <ArrowDown className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
