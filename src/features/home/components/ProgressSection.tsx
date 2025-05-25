import { useQuery } from "@tanstack/react-query";
import CourseGrid from "../../course/components/CourseGrid";

export default function ProgressSection() {
  const { data: hasInProgressCourses, isLoading } = useQuery<boolean>({
    queryKey: ["/api/courses/has-in-progress"],
  });

  if (isLoading) {
    return (
      <section className="py-10" id="my-courses">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-sm p-6 mb-10 animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-2/4 mb-8"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-gray-100 rounded-lg h-96"></div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!hasInProgressCourses) {
    return null;
  }

  return (
    <section className="py-10" id="my-courses">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-sm p-6 mb-10">
          <CourseGrid 
            inProgress={true}
            title="Continue Learning"
            subtitle="Pick up where you left off"
            viewAllLink="/courses?filter=in-progress"
            viewAllText="View all my courses"
            limit={3}
          />
        </div>
      </div>
    </section>
  );
}
