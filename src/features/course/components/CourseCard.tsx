import { Link } from "wouter";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";

type CourseCardProps = {
  _id: string;
  title: string;
  thumbnailUrl: string;
  instructor: string;
  instructorAvatar?: string;
  category: string;
  price?: string;
  rating?: string;
  progress?: number;
  completedLessons?: number;
  totalLessons?: number;
  remainingTime?: string;
  isFeatured?: boolean;
  isNew?: boolean;
  isBestseller?: boolean;
  isInProgress?: boolean;
};

export default function CourseCard({
  _id,
  title,
  thumbnailUrl,
  instructor,
  instructorAvatar,
  category,
  price,
  rating,
  progress = 0,
  completedLessons,
  totalLessons,
  remainingTime,
  isFeatured = false,
  isNew = false,
  isBestseller = false,
  isInProgress = false,
}: CourseCardProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <Card className="course-card h-full flex flex-col">
      <div className="relative">
        <img src={thumbnailUrl} alt={title} className="course-card-image" />
        {isInProgress && completedLessons && totalLessons && (
          <div className="absolute top-3 right-3 bg-white py-1 px-2 rounded-md text-sm font-medium">
            {completedLessons}/{totalLessons} Lessons
          </div>
        )}
        {isBestseller && !isInProgress && (
          <Badge className="absolute top-3 right-3 bg-secondary">BESTSELLER</Badge>
        )}
        {isNew && !isInProgress && !isBestseller && (
          <Badge className="absolute top-3 right-3 bg-accent">NEW</Badge>
        )}
      </div>

      <CardContent className="p-5 flex-grow">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-medium text-gray-500">{category}</span>
          {rating && !isInProgress && (
            <div className="flex items-center">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
              <span className="text-sm font-medium">{rating}</span>
            </div>
          )}
          {isInProgress && remainingTime && (
            <span className="flex items-center text-accent text-sm">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              {remainingTime} left
            </span>
          )}
        </div>

        <h3 className="font-bold text-lg mb-2 line-clamp-2">{title}</h3>

        <div className="flex items-center mb-4">
          <Avatar className="h-6 w-6 mr-2">
            <AvatarImage src={instructorAvatar} alt={instructor} />
            <AvatarFallback>{getInitials(instructor)}</AvatarFallback>
          </Avatar>
          <span className="text-sm text-gray-600">{instructor}</span>
        </div>

        {isInProgress && (
          <div className="mb-4">
            <Progress value={progress} className="progress-bar" />
          </div>
        )}
      </CardContent>

      <CardFooter className="p-5 pt-0">
        {isInProgress ? (
          <Link href={`/course/${_id}`} className="block text-center w-full btn-primary">
            Resume Course
          </Link>
        ) : (
          <div className="flex justify-between items-center w-full">
            {price && <span className="text-primary font-bold">${price}</span>}
            <Link
              href={`/course/${_id}`}
              className="text-sm font-medium text-primary hover:underline"
            >
              Learn more
            </Link>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
