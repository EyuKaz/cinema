import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { Home, ArrowLeft, Search, Film } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center">
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="py-12">
              <div className="mb-8">
                <Film className="h-24 w-24 text-red-400 mx-auto mb-4" />
                <h1 className="text-6xl font-bold text-red-400 mb-4">404</h1>
                <h2 className="text-2xl font-semibold mb-4">Page Not Found</h2>
                <p className="text-gray-300 mb-8 max-w-md mx-auto">
                  Sorry, the page you're looking for doesn't exist. It might have been moved, 
                  deleted, or you may have entered the wrong URL.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/">
                    <Button className="bg-red-600 hover:bg-red-700 flex items-center gap-2">
                      <Home className="h-4 w-4" />
                      Go Home
                    </Button>
                  </Link>
                  <Button 
                    variant="outline" 
                    onClick={() => window.history.back()}
                    className="border-gray-600 hover:bg-gray-800 flex items-center gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Go Back
                  </Button>
                </div>

                <div className="mt-8 pt-8 border-t border-gray-700">
                  <h3 className="text-lg font-semibold mb-4 text-gold-400">Quick Links</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <Link href="/movies">
                      <Button variant="ghost" size="sm" className="w-full text-sm">
                        Movies
                      </Button>
                    </Link>
                    <Link href="/theaters">
                      <Button variant="ghost" size="sm" className="w-full text-sm">
                        Theaters
                      </Button>
                    </Link>
                    <Link href="/contact">
                      <Button variant="ghost" size="sm" className="w-full text-sm">
                        Contact
                      </Button>
                    </Link>
                    <Link href="/about">
                      <Button variant="ghost" size="sm" className="w-full text-sm">
                        About
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="mt-8 text-center">
            <p className="text-gray-400 text-sm">
              If you believe this is an error, please{" "}
              <Link href="/contact" className="text-red-400 hover:underline">
                contact our support team
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}