import { Switch, Route } from "wouter";
import Header from "../components/Header";
import Footer from "../components/Footer";
import NotFound from "../components/NotFound";
import HomePage from "../features/home/pages/HomePage";
import CoursesPage from "../features/course/pages/CoursesPage";
import CourseDetailPage from "../features/course/pages/CourseDetailPage";
import LessonPlayerPage from "../features/course/pages/LessonPlayerPage";
import CourseStudentsPage from "../features/course/pages/CourseStudentsPage";
import ProfilePage from "../features/user/pages/ProfilePage";
import FAQPage from "../features/faq/pages/FAQPage";
import CreatorDashboardPage from "../features/dashboard/pages/CreatorDashboardPage";
import LoginPage from "../features/auth/pages/LoginPage";
import RegisterPage from "../features/auth/pages/RegisterPage";
import { ProtectedRoute } from "../features/auth/components/ProtectedRoute";

function Router() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <Switch>
          <Route path="/" component={HomePage} />
          <Route path="/courses" component={CoursesPage} />

          {/* Lesson player and course detail are now public */}
          <Route path="/course/:courseId">
            <CourseDetailPage />
          </Route>

          {/* Keep protection for students, profile, dashboard, etc. */}

          {/* New route pattern with moduleId */}
          <ProtectedRoute path="/course/:courseId/module/:moduleId/lesson/:lessonId">
            <LessonPlayerPage />
          </ProtectedRoute>

          <ProtectedRoute path="/courses/:courseId/students">
            <CourseStudentsPage />
          </ProtectedRoute>

          <ProtectedRoute path="/profile">
            <ProfilePage />
          </ProtectedRoute>

          <ProtectedRoute path="/creator-dashboard">
            <CreatorDashboardPage />
          </ProtectedRoute>

          <ProtectedRoute path="/creator-dashboard/courses/:courseId/detail">
            <CreatorDashboardPage />
          </ProtectedRoute>

          <ProtectedRoute path="/creator-dashboard/courses/:courseId/curriculum">
            <CreatorDashboardPage />
          </ProtectedRoute>

          <ProtectedRoute path="/creator-dashboard/courses/:courseId/edit">
            <CreatorDashboardPage />
          </ProtectedRoute>

          <ProtectedRoute path="/creator-dashboard/:tab">
            <CreatorDashboardPage />
          </ProtectedRoute>

          <Route path="/faq" component={FAQPage} />
          <Route path="/login" component={LoginPage} />
          <Route path="/register" component={RegisterPage} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
    </div>
  );
}

export default Router; 
