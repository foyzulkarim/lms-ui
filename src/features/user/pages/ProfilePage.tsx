import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import CourseGrid from "../../course/components/CourseGrid";

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("courses");
  
  const { data: user, isLoading: isLoadingUser } = useQuery<any>({
    queryKey: ["/api/users/profile"],
  });

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    bio: "",
  });

  // Update form when user data loads
  useState(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        bio: user.bio || "",
      });
    }
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // This would update the user profile
    console.log("Updating profile:", formData);
  };

  if (isLoadingUser) {
    return (
      <div className="py-12 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="flex items-center mb-8">
              <div className="rounded-full bg-gray-200 h-20 w-20 mr-4"></div>
              <div>
                <div className="h-6 bg-gray-200 rounded w-48 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-32"></div>
              </div>
            </div>
            <div className="h-10 bg-gray-200 rounded mb-6"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-10">
          <Avatar className="h-24 w-24">
            <AvatarImage src={user?.avatar || undefined} alt={user?.name || "User"} />
            <AvatarFallback>{user?.name?.charAt(0) || user?.username?.charAt(0) || "U"}</AvatarFallback>
          </Avatar>
          
          <div>
            <h1 className="text-3xl font-bold mb-2">{user?.name || user?.username}</h1>
            <p className="text-gray-600 mb-4">{user?.email}</p>
            <p className="text-gray-700">{user?.bio || "No bio provided yet."}</p>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="courses" className="flex-1">My Courses</TabsTrigger>
            <TabsTrigger value="certificates" className="flex-1">Certificates</TabsTrigger>
            <TabsTrigger value="account" className="flex-1">Account Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="courses" className="mt-6">
            <CourseGrid
              title="Your Courses"
              subtitle="Courses you're currently taking"
              inProgress={true}
            />
          </TabsContent>
          
          <TabsContent value="certificates" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Certificates</CardTitle>
                <CardDescription>
                  Certificates you've earned from completed courses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <h3 className="text-lg font-medium mb-2">No Certificates Yet</h3>
                  <p className="text-gray-600 mb-4">
                    Complete courses to earn certificates that showcase your skills.
                  </p>
                  <Button className="bg-primary hover:bg-primary/90">
                    Browse Courses
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="account" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>
                  Update your account information and preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input 
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Your full name"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Your email address"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea 
                      id="bio"
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      placeholder="Write a short bio about yourself"
                      rows={4}
                    />
                  </div>
                  
                  <Button type="submit" className="bg-primary hover:bg-primary/90">
                    Save Changes
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
