import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BookOpen, ChevronDown, Menu, Search, LogIn, UserPlus } from "lucide-react";
import { useMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/features/auth/context/AuthContext";

export default function Header() {
  const [location] = useLocation();
  const isMobile = useMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { isLoggedIn, user, logout } = useAuth();
  const effectiveIsLoggedIn = isLoggedIn;
  const [, navigate] = useLocation();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery) {
      // This would typically navigate to search results
      console.log("Searching for:", searchQuery);
    }
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50 dark:bg-slate-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-primary flex items-center">
              <BookOpen className="mr-2" />
              <span>Foyzul's Academy</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link href="/" className={`font-medium ${location === '/' ? 'text-primary' : 'text-foreground hover:text-primary transition-colors'}`}>
              Home
            </Link>
            <Link href="/courses" className={`font-medium ${location === '/courses' ? 'text-primary' : 'text-foreground hover:text-primary transition-colors'}`}>
              Courses
            </Link>
            <Link href="/faq" className={`font-medium ${location === '/faq' ? 'text-primary' : 'text-foreground hover:text-primary transition-colors'}`}>
              FAQ
            </Link>
            {(user?.role === 'creator' || user?.role === 'admin') && (
              <Link href="/creator-dashboard" className={`font-medium ${location.startsWith('/creator-dashboard') ? 'text-primary' : 'text-foreground hover:text-primary transition-colors'}`}>
                Creator Dashboard
              </Link>
            )}
          </nav>

          <div className="flex items-center space-x-4">
            {/* Search Box (Desktop) */}
            <form onSubmit={handleSearch} className="hidden md:block relative">
              <Input
                type="text"
                placeholder="Search courses..."
                className="w-64 bg-gray-100 text-foreground rounded-full py-2 px-4 pl-10 dark:bg-slate-800 dark:border-slate-700"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
            </form>

            {effectiveIsLoggedIn ? (
              /* Logged In - Profile Dropdown */
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.avatar || undefined} alt={user?.name || 'User'} />
                      <AvatarFallback>{user?.name?.charAt(0) || 'U'}</AvatarFallback>
                    </Avatar>
                    <span className="hidden md:inline-block font-medium">{user?.name}</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer">Your Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>Settings</DropdownMenuItem>
                  <DropdownMenuItem>Help Center</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-red-600 cursor-pointer"
                    onClick={() => {
                      logout();
                      navigate("/");
                    }}
                  >
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              /* Not Logged In - Auth Buttons */
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="hidden md:flex items-center"
                  onClick={() => navigate("/login")}
                >
                  <LogIn className="mr-1 h-4 w-4" />
                  Login
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  className="hidden md:flex items-center bg-primary hover:bg-primary/90"
                  onClick={() => navigate("/register")}
                >
                  <UserPlus className="mr-1 h-4 w-4" />
                  Register
                </Button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4">
            <form onSubmit={handleSearch} className="mb-4 relative">
              <Input
                type="text"
                placeholder="Search courses..."
                className="w-full bg-gray-100 text-foreground rounded-full py-2 px-4 pl-10 dark:bg-slate-800 dark:border-slate-700"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
            </form>
            <div className="flex flex-col space-y-3">
              <Link href="/" className={`font-medium ${location === '/' ? 'text-primary' : 'text-foreground hover:text-primary transition-colors'}`}>
                Home
              </Link>
              <Link href="/courses" className={`font-medium ${location === '/courses' ? 'text-primary' : 'text-foreground hover:text-primary transition-colors'}`}>
                Courses
              </Link>
              <Link href="/faq" className={`font-medium ${location === '/faq' ? 'text-primary' : 'text-foreground hover:text-primary transition-colors'}`}>
                FAQ
              </Link>
              {(user?.role === 'creator' || user?.role === 'admin') && (
                <Link href="/creator-dashboard" className={`font-medium ${location.startsWith('/creator-dashboard') ? 'text-primary' : 'text-foreground hover:text-primary transition-colors'}`}>
                  Creator Dashboard
                </Link>
              )}

              {!effectiveIsLoggedIn && (
                <>
                  <div className="border-t border-gray-200 dark:border-gray-700 my-2 pt-2"></div>
                  <Link href="/login" className="flex items-center font-medium text-primary">
                    <LogIn className="mr-2 h-4 w-4" />
                    Login
                  </Link>
                  <Link href="/register" className="flex items-center font-medium text-primary">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Register
                  </Link>
                </>
              )}

              {effectiveIsLoggedIn && (
                <>
                  <div className="border-t border-gray-200 dark:border-gray-700 my-2 pt-2"></div>
                  <Link href="/profile" className="font-medium">
                    Your Profile
                  </Link>
                  <button
                    className="text-left font-medium text-red-600"
                    onClick={() => {
                      logout();
                      navigate("/");
                      setMobileMenuOpen(false);
                    }}
                  >
                    Sign out
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
