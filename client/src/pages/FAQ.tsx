import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { HelpCircle, MessageCircle } from "lucide-react";

const faqData = [
  {
    category: "Booking & Tickets",
    questions: [
      {
        question: "How do I book tickets online?",
        answer: "Simply browse our movie listings, select your preferred showtime and theater, choose your seats, and complete the payment process. You'll receive a confirmation email with your ticket details."
      },
      {
        question: "Can I cancel or modify my booking?",
        answer: "Yes, you can cancel bookings up to 2 hours before the showtime through your dashboard. Modifications depend on seat availability and may incur additional charges."
      },
      {
        question: "What payment methods do you accept?",
        answer: "We accept all major credit cards (Visa, MasterCard, American Express), debit cards, and popular digital payment methods like Apple Pay and Google Pay."
      },
      {
        question: "Do you offer group discounts?",
        answer: "Yes! We offer special rates for groups of 10 or more. Contact our customer service team for custom group pricing and arrangements."
      },
      {
        question: "How do I get my tickets?",
        answer: "You can display your digital tickets on your phone, print them at home, or collect them from our box office using your booking reference."
      }
    ]
  },
  {
    category: "Theater Experience",
    questions: [
      {
        question: "What safety measures are in place?",
        answer: "We maintain rigorous cleaning protocols, provide hand sanitizing stations, ensure proper ventilation, and follow all local health guidelines to keep you safe."
      },
      {
        question: "Can I bring my own food and drinks?",
        answer: "Outside food and beverages are not permitted. However, we offer a wide variety of snacks, meals, and beverages at our concession stands."
      },
      {
        question: "Are your theaters wheelchair accessible?",
        answer: "Yes, all our theaters are fully wheelchair accessible with designated seating areas, accessible restrooms, and assistance available upon request."
      },
      {
        question: "What should I do if I arrive late?",
        answer: "Latecomers will be seated at the next suitable break in the film. Our staff will assist you to minimize disruption to other guests."
      },
      {
        question: "Do you have parking available?",
        answer: "Most of our locations offer free parking. Some downtown locations may have paid parking or validation options. Check your specific theater details."
      }
    ]
  },
  {
    category: "Account & Membership",
    questions: [
      {
        question: "Do I need an account to book tickets?",
        answer: "Yes, you need to create a free account to book tickets. This allows you to manage your bookings, view history, and receive personalized recommendations."
      },
      {
        question: "How do I reset my password?",
        answer: "Click on 'Forgot Password' on the login page and follow the instructions sent to your registered email address."
      },
      {
        question: "Can I change my account information?",
        answer: "Yes, you can update your personal information, email, and preferences from your account dashboard at any time."
      },
      {
        question: "Do you have a loyalty program?",
        answer: "We're working on launching an exciting loyalty program that will offer exclusive benefits, early access to tickets, and special discounts. Stay tuned!"
      }
    ]
  },
  {
    category: "Technical Support",
    questions: [
      {
        question: "The website isn't working properly. What should I do?",
        answer: "Try refreshing your browser, clearing cache and cookies, or using a different browser. If the problem persists, contact our technical support team."
      },
      {
        question: "I didn't receive my confirmation email.",
        answer: "Check your spam/junk folder first. If you still can't find it, log into your account to view your booking details or contact customer support."
      },
      {
        question: "Can I book tickets on my mobile phone?",
        answer: "Absolutely! Our website is fully optimized for mobile devices, providing the same great booking experience on phones and tablets."
      },
      {
        question: "Why can't I select certain seats?",
        answer: "Seats may be unavailable if they're already booked, reserved for accessibility needs, or temporarily out of service. Try selecting different seats or contact support."
      }
    ]
  }
];

export default function FAQ() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <HelpCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
            <h1 className="text-4xl font-bold mb-4 text-red-400">Frequently Asked Questions</h1>
            <p className="text-xl text-gray-300">
              Find answers to the most common questions about our cinema experience
            </p>
          </div>

          {/* FAQ Sections */}
          <div className="space-y-8">
            {faqData.map((category, categoryIndex) => (
              <Card key={categoryIndex} className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-gold-400 text-xl">{category.category}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    {category.questions.map((faq, questionIndex) => (
                      <AccordionItem 
                        key={questionIndex} 
                        value={`${categoryIndex}-${questionIndex}`}
                        className="border-gray-700"
                      >
                        <AccordionTrigger className="text-left hover:text-red-400 transition-colors">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-gray-300">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Contact Section */}
          <Card className="bg-gray-900 border-gray-800 mt-12">
            <CardContent className="text-center py-8">
              <MessageCircle className="h-12 w-12 text-gold-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-4">Still have questions?</h3>
              <p className="text-gray-300 mb-6">
                Can't find what you're looking for? Our customer support team is here to help.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/contact">
                  <Button className="bg-red-600 hover:bg-red-700">
                    Contact Support
                  </Button>
                </Link>
                <Button variant="outline" className="border-gray-600 hover:bg-gray-800">
                  Call: (555) 123-CINE
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Tips */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-white font-bold">1</span>
              </div>
              <h4 className="font-semibold mb-2">Book Early</h4>
              <p className="text-sm text-gray-400">Secure the best seats by booking in advance</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-white font-bold">2</span>
              </div>
              <h4 className="font-semibold mb-2">Arrive Early</h4>
              <p className="text-sm text-gray-400">Come 15-20 minutes before showtime</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-white font-bold">3</span>
              </div>
              <h4 className="font-semibold mb-2">Check Policies</h4>
              <p className="text-sm text-gray-400">Review our terms and cancellation policies</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}