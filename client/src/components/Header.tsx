import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Film, Search, Menu, User, LogOut, Settings, Ticket } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Header() {
  const { user, isAuthenticated } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      window.location.href = `/movies?search=${encodeURIComponent(searchTerm)}`;
    }
  };

  const getInitials = (email: string) => {
    return email.split('@')[0].slice(0, 2).toUpperCase();
  };

  return (
    <nav className="bg-cinema-charcoal/95 backdrop-blur-md sticky top-0 z-50 border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-8">
            <div className="flex-shrink-0">
              <a href="/" className="flex items-center">
                <Film className="h-8 w-8 text-cinepolis-red mr-2" />
                <h1 className="text-2xl font-bold text-cinepolis-red">C</h1>
              </a>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-6">
                <a 
                  href="/movies" 
                  className="text-white hover:text-cinepolis-gold transition-colors"
                >
                  Movies
                </a>
                <a 
                  href="/theaters" 
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Theaters
                </a>
                <a 
                  href="/about" 
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  About
                </a>
                <a 
                  href="/contact" 
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Contact
                </a>
                <a 
                  href="/faq" 
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  FAQ
                </a>
                {user?.role === 'admin' && (
                  <a 
                    href="/admin" 
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    <Badge className="bg-cinepolis-red text-white">Admin</Badge>
                  </a>
                )}
              </div>
            </div>
          </div>
          
          {/* Right Side */}
          <div className="flex items-center space-x-4">
            {/* Search Bar (Desktop) */}
            <div className="hidden md:block">
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search movies, theaters..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-800 text-white border-gray-700 focus:border-cinepolis-red focus:outline-none w-64"
                />
              </form>
            </div>
            
            {/* Search Button (Mobile) */}
            <Button 
              variant="ghost" 
              size="icon"
              className="md:hidden text-gray-300 hover:text-white"
            >
              <Search className="h-5 w-5" />
            </Button>
            
            {/* User Menu */}
            {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.profileImageUrl || ""} alt={user.email || ""} />
                      <AvatarFallback className="bg-cinepolis-red text-white">
                        {getInitials(user.email || "U")}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-cinema-charcoal border-gray-800" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium text-white">
                        {user.firstName || user.email}
                      </p>
                      <p className="w-[200px] truncate text-sm text-gray-400">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuSeparator className="bg-gray-800" />
                  <DropdownMenuItem asChild>
                    <a 
                      href="/dashboard" 
                      className="flex items-center text-white hover:text-cinepolis-gold cursor-pointer"
                    >
                      <Ticket className="mr-2 h-4 w-4" />
                      My Bookings
                    </a>
                  </DropdownMenuItem>
                  {user.role === 'admin' && (
                    <DropdownMenuItem asChild>
                      <a 
                        href="/admin" 
                        className="flex items-center text-white hover:text-cinepolis-gold cursor-pointer"
                      >
                        <Settings className="mr-2 h-4 w-4" />
                        Admin Dashboard
                      </a>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator className="bg-gray-800" />
                  <DropdownMenuItem asChild>
                    <a 
                      href="/api/logout" 
                      className="flex items-center text-white hover:text-red-400 cursor-pointer"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </a>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button 
                onClick={() => window.location.href = "/api/login"}
                className="bg-cinepolis-red hover:bg-red-700 text-white hidden md:flex"
              >
                Sign In
              </Button>
            )}
            
            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="md:hidden text-gray-300 hover:text-white"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-cinema-charcoal border-gray-800">
                <div className="flex flex-col space-y-4 mt-8">
                  {/* Mobile Search */}
                  <form onSubmit={handleSearch} className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Search movies..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-gray-800 text-white border-gray-700"
                    />
                  </form>
                  
                  {/* Mobile Navigation */}
                  <div className="flex flex-col space-y-2">
                    <a 
                      href="/movies" 
                      className="text-white hover:text-cinepolis-gold transition-colors py-2"
                    >
                      Movies
                    </a>
                    <a 
                      href="/theaters" 
                      className="text-white hover:text-cinepolis-gold transition-colors py-2"
                    >
                      Theaters
                    </a>
                    {isAuthenticated && (
                      <a 
                        href="/dashboard" 
                        className="text-white hover:text-cinepolis-gold transition-colors py-2"
                      >
                        My Bookings
                      </a>
                    )}
                    {user?.role === 'admin' && (
                      <a 
                        href="/admin" 
                        className="text-white hover:text-cinepolis-gold transition-colors py-2"
                      >
                        Admin Dashboard
                      </a>
                    )}
                  </div>
                  
                  {/* Mobile Auth */}
                  {!isAuthenticated ? (
                    <Button 
                      onClick={() => window.location.href = "/api/login"}
                      className="bg-cinepolis-red hover:bg-red-700 text-white"
                    >
                      Sign In
                    </Button>
                  ) : (
                    <Button 
                      onClick={() => window.location.href = "/api/logout"}
                      variant="outline"
                      className="border-gray-600 text-white hover:bg-red-600 hover:border-red-600"
                    >
                      Sign Out
                    </Button>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
