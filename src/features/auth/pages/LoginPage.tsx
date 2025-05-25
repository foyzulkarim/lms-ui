import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { BookOpen } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import AuthButton from "../components/AuthButton";

export default function LoginPage() {
  const { login, isLoading, error, isLoggedIn } = useAuth();
  const [, navigate] = useLocation();
  const [activeProvider, setActiveProvider] = useState<"google" | null>(null);

  // Redirect if already logged in
  useEffect(() => {
    if (isLoggedIn) {
      navigate("/");
    }
  }, [isLoggedIn, navigate]);

  // Handle login with provider
  const handleLogin = (provider: "google") => {
    setActiveProvider(provider);
    login(provider);
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
      <div className="w-full max-w-md transition-all">
        <Card className="w-full shadow-lg border-none">
          <CardHeader className="space-y-1 flex flex-col items-center">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mb-4">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-center">Welcome back</CardTitle>
            <CardDescription className="text-center">
              Log in to your Foyzul's Academy account to continue learning
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <AuthButton
                provider="google"
                onClick={() => handleLogin("google")}
                isLoading={isLoading && activeProvider === "google"}
                className="mb-2"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <div className="text-sm text-center text-muted-foreground mt-2">
              Don't have an account?{" "}
              <a 
                href="/register" 
                className="text-primary hover:underline"
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/register");
                }}
              >
                Sign up
              </a>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
