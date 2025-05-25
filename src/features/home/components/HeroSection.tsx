import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function HeroSection() {
  return (
    <section className="bg-[#f8fafc] py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="md:w-1/2 md:pr-10 mb-8 md:mb-0">
            <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">
              Continue your learning journey
            </h1>
            <p className="text-lg text-slate-600 mb-8">
              Access your courses, track your progress, and achieve your educational goals with our comprehensive learning platform.
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <Link href="#my-courses">
                <Button 
                  className="bg-white border border-slate-200 text-slate-900 hover:bg-slate-50 font-medium px-8"
                  size="lg"
                >
                  My Courses
                </Button>
              </Link>
              <Link href="/courses">
                <Button 
                  variant="outline" 
                  className="border-slate-200 text-slate-700 hover:bg-slate-50 font-medium px-8"
                  size="lg"
                >
                  Explore Courses
                </Button>
              </Link>
            </div>
          </div>
          <div className="md:w-1/2">
            <img 
              src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
              alt="Students learning online" 
              className="rounded-lg shadow-md"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
