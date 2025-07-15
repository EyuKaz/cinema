import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function Terms() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4 text-red-400">Terms & Conditions</h1>
            <p className="text-gray-300">Last updated: January 2024</p>
          </div>

          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-6">
              <ScrollArea className="h-[600px] pr-4">
                <div className="space-y-6">
                  <section>
                    <h2 className="text-xl font-semibold mb-3 text-gold-400">1. Acceptance of Terms</h2>
                    <p className="text-gray-300 mb-4">
                      By accessing and using C Cinema's services, including our website and mobile applications, 
                      you agree to be bound by these Terms and Conditions. If you do not agree to these terms, 
                      please do not use our services.
                    </p>
                  </section>

                  <Separator className="bg-gray-700" />

                  <section>
                    <h2 className="text-xl font-semibold mb-3 text-gold-400">2. Ticket Sales and Refunds</h2>
                    <div className="space-y-3 text-gray-300">
                      <p><strong>2.1 Ticket Purchases:</strong> All ticket sales are final upon payment confirmation.</p>
                      <p><strong>2.2 Cancellations:</strong> Tickets may be cancelled up to 2 hours before showtime for a full refund.</p>
                      <p><strong>2.3 No-Show Policy:</strong> No refunds will be provided for no-shows or late arrivals.</p>
                      <p><strong>2.4 Technical Issues:</strong> Refunds for technical difficulties will be considered on a case-by-case basis.</p>
                    </div>
                  </section>

                  <Separator className="bg-gray-700" />

                  <section>
                    <h2 className="text-xl font-semibold mb-3 text-gold-400">3. Theater Conduct</h2>
                    <div className="space-y-3 text-gray-300">
                      <p><strong>3.1 Prohibited Items:</strong> Outside food, beverages, weapons, recording devices, and disruptive items are not permitted.</p>
                      <p><strong>3.2 Behavior:</strong> Disruptive behavior, including excessive noise, use of mobile devices during films, or harassment of other guests is prohibited.</p>
                      <p><strong>3.3 Age Restrictions:</strong> Age ratings will be strictly enforced. Valid ID may be required.</p>
                      <p><strong>3.4 Removal:</strong> We reserve the right to remove guests who violate these policies without refund.</p>
                    </div>
                  </section>

                  <Separator className="bg-gray-700" />

                  <section>
                    <h2 className="text-xl font-semibold mb-3 text-gold-400">4. Account Responsibilities</h2>
                    <div className="space-y-3 text-gray-300">
                      <p><strong>4.1 Account Security:</strong> You are responsible for maintaining the confidentiality of your account credentials.</p>
                      <p><strong>4.2 Accurate Information:</strong> You must provide accurate and up-to-date information when creating an account.</p>
                      <p><strong>4.3 Unauthorized Use:</strong> You must notify us immediately of any unauthorized use of your account.</p>
                      <p><strong>4.4 Age Requirement:</strong> You must be at least 13 years old to create an account.</p>
                    </div>
                  </section>

                  <Separator className="bg-gray-700" />

                  <section>
                    <h2 className="text-xl font-semibold mb-3 text-gold-400">5. Privacy and Data Protection</h2>
                    <div className="space-y-3 text-gray-300">
                      <p><strong>5.1 Data Collection:</strong> We collect personal information as outlined in our Privacy Policy.</p>
                      <p><strong>5.2 Data Usage:</strong> Your data is used to provide services, process transactions, and improve user experience.</p>
                      <p><strong>5.3 Third Parties:</strong> We do not sell personal information to third parties.</p>
                      <p><strong>5.4 Security:</strong> We implement industry-standard security measures to protect your data.</p>
                    </div>
                  </section>

                  <Separator className="bg-gray-700" />

                  <section>
                    <h2 className="text-xl font-semibold mb-3 text-gold-400">6. Limitation of Liability</h2>
                    <div className="space-y-3 text-gray-300">
                      <p><strong>6.1 Service Availability:</strong> We do not guarantee uninterrupted service availability.</p>
                      <p><strong>6.2 Content Accuracy:</strong> Movie times, availability, and information are subject to change without notice.</p>
                      <p><strong>6.3 Damages:</strong> Our liability is limited to the amount paid for tickets.</p>
                      <p><strong>6.4 Force Majeure:</strong> We are not liable for delays or cancellations due to circumstances beyond our control.</p>
                    </div>
                  </section>

                  <Separator className="bg-gray-700" />

                  <section>
                    <h2 className="text-xl font-semibold mb-3 text-gold-400">7. Intellectual Property</h2>
                    <div className="space-y-3 text-gray-300">
                      <p><strong>7.1 Ownership:</strong> All content, trademarks, and intellectual property on our platform belong to C Cinema or our licensors.</p>
                      <p><strong>7.2 Prohibited Use:</strong> You may not copy, distribute, or create derivative works from our content without permission.</p>
                      <p><strong>7.3 User Content:</strong> Any content you submit may be used by us for promotional purposes.</p>
                    </div>
                  </section>

                  <Separator className="bg-gray-700" />

                  <section>
                    <h2 className="text-xl font-semibold mb-3 text-gold-400">8. Modifications to Terms</h2>
                    <div className="space-y-3 text-gray-300">
                      <p><strong>8.1 Updates:</strong> We reserve the right to modify these terms at any time.</p>
                      <p><strong>8.2 Notification:</strong> Users will be notified of significant changes via email or website notice.</p>
                      <p><strong>8.3 Continued Use:</strong> Continued use of our services after changes constitutes acceptance of new terms.</p>
                    </div>
                  </section>

                  <Separator className="bg-gray-700" />

                  <section>
                    <h2 className="text-xl font-semibold mb-3 text-gold-400">9. Governing Law</h2>
                    <div className="space-y-3 text-gray-300">
                      <p><strong>9.1 Jurisdiction:</strong> These terms are governed by the laws of the state where our corporate headquarters are located.</p>
                      <p><strong>9.2 Disputes:</strong> Any disputes will be resolved through binding arbitration.</p>
                      <p><strong>9.3 Severability:</strong> If any provision is found invalid, the remaining terms remain in effect.</p>
                    </div>
                  </section>

                  <Separator className="bg-gray-700" />

                  <section>
                    <h2 className="text-xl font-semibold mb-3 text-gold-400">10. Contact Information</h2>
                    <div className="space-y-2 text-gray-300">
                      <p>For questions about these Terms and Conditions:</p>
                      <p><strong>Email:</strong> legal@c-cinema.com</p>
                      <p><strong>Phone:</strong> (555) 123-LEGAL</p>
                      <p><strong>Address:</strong> 123 Cinema Street, Movie City, MC 12345</p>
                    </div>
                  </section>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}