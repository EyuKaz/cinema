import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Clock, Star, Shield } from "lucide-react";

export default function About() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-red-400">About C Cinema</h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Experience the magic of movies like never before. We're dedicated to bringing you the latest films 
              in premium comfort with cutting-edge technology and exceptional service.
            </p>
          </div>

          {/* Mission & Vision */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-gold-400">Our Mission</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">
                  To create extraordinary movie experiences that bring people together, 
                  inspire emotions, and make every visit memorable. We strive to be the 
                  premier destination for movie lovers everywhere.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-gold-400">Our Vision</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">
                  To revolutionize the cinema industry by setting new standards in 
                  customer service, technology innovation, and entertainment excellence, 
                  making every movie a journey worth taking.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Key Features */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-center mb-8 text-red-400">Why Choose C Cinema?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gray-900 border-gray-800 text-center">
                <CardHeader>
                  <Star className="h-12 w-12 text-gold-400 mx-auto mb-4" />
                  <CardTitle>Premium Experience</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-400">
                    State-of-the-art theaters with comfortable seating and crystal-clear sound
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-800 text-center">
                <CardHeader>
                  <Clock className="h-12 w-12 text-gold-400 mx-auto mb-4" />
                  <CardTitle>Flexible Timing</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-400">
                    Multiple showtimes daily to fit your schedule, from morning to late night
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-800 text-center">
                <CardHeader>
                  <Shield className="h-12 w-12 text-gold-400 mx-auto mb-4" />
                  <CardTitle>Safe & Clean</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-400">
                    Rigorous cleaning protocols and safety measures for your peace of mind
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-800 text-center">
                <CardHeader>
                  <Users className="h-12 w-12 text-gold-400 mx-auto mb-4" />
                  <CardTitle>Customer First</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-400">
                    Dedicated support team ready to assist with bookings and special requests
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Company Stats */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-center mb-8 text-red-400">Our Impact</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-gold-400 mb-2">50+</div>
                <p className="text-gray-400">Theater Locations</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-gold-400 mb-2">2M+</div>
                <p className="text-gray-400">Happy Customers</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-gold-400 mb-2">500+</div>
                <p className="text-gray-400">Movies Screened</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-gold-400 mb-2">15+</div>
                <p className="text-gray-400">Years of Excellence</p>
              </div>
            </div>
          </div>

          {/* Technology & Innovation */}
          <Card className="bg-gray-900 border-gray-800 mb-12">
            <CardHeader>
              <CardTitle className="text-gold-400 text-center">Technology & Innovation</CardTitle>
              <CardDescription className="text-center">
                Leading the industry with cutting-edge cinema technology
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <h4 className="font-semibold mb-2 text-red-400">4K Digital Projection</h4>
                  <p className="text-sm text-gray-400">
                    Ultra-high definition visuals that bring every detail to life
                  </p>
                </div>
                <div className="text-center">
                  <h4 className="font-semibold mb-2 text-red-400">Dolby Atmos Sound</h4>
                  <p className="text-sm text-gray-400">
                    Immersive 3D audio technology for the ultimate sound experience
                  </p>
                </div>
                <div className="text-center">
                  <h4 className="font-semibold mb-2 text-red-400">Reserved Seating</h4>
                  <p className="text-sm text-gray-400">
                    Choose your perfect seat with our easy online booking system
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Values */}
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-8 text-red-400">Our Values</h2>
            <div className="flex flex-wrap justify-center gap-3">
              <Badge variant="secondary" className="px-4 py-2 text-sm">Excellence</Badge>
              <Badge variant="secondary" className="px-4 py-2 text-sm">Innovation</Badge>
              <Badge variant="secondary" className="px-4 py-2 text-sm">Customer Service</Badge>
              <Badge variant="secondary" className="px-4 py-2 text-sm">Community</Badge>
              <Badge variant="secondary" className="px-4 py-2 text-sm">Integrity</Badge>
              <Badge variant="secondary" className="px-4 py-2 text-sm">Sustainability</Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}