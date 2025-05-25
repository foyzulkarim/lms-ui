import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { BookOpen, CheckCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import AuthButton from "../components/AuthButton";

export default function RegisterPage() {
  const { register, isLoading, error, isLoggedIn } = useAuth();
  const [, navigate] = useLocation();
  const [activeProvider, setActiveProvider] = useState<"google" | null>(null);

  // Redirect if already logged in
  useEffect(() => {
    if (isLoggedIn) {
      navigate("/");
    }
  }, [isLoggedIn, navigate]);

  // Handle register with provider
  const handleRegister = (provider: "google") => {
    setActiveProvider(provider);
    register(provider);
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
      <div className="w-full max-w-md transition-all">
        <Card className="w-full shadow-lg border-none">
          <CardHeader className="space-y-1 flex flex-col items-center">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mb-4">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-center">Create an account</CardTitle>
            <CardDescription className="text-center">
              Join Foyzul's Academy to start your learning journey
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <div className="space-y-1 mb-3">
                <div className="text-sm flex items-center text-muted-foreground">
                  <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                  <span>Access to all courses</span>
                </div>
                <div className="text-sm flex items-center text-muted-foreground">
                  <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                  <span>Track your learning progress</span>
                </div>
                <div className="text-sm flex items-center text-muted-foreground">
                  <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                  <span>Personalized learning experience</span>
                </div>
              </div>
              
              <AuthButton
                provider="google"
                onClick={() => handleRegister("google")}
                isLoading={isLoading && activeProvider === "google"}
                className="mb-2"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <div className="text-sm text-center text-muted-foreground mt-2">
              Already have an account?{" "}
              <a 
                href="/login" 
                className="text-primary hover:underline"
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/login");
                }}
              >
                Sign in
              </a>
            </div>
            <div className="text-xs text-center text-muted-foreground mt-4">
              By creating an account, you agree to our Terms of Service and Privacy Policy.
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
