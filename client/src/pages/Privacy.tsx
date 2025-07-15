import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4 text-red-400">Privacy Policy</h1>
            <p className="text-gray-300">Last updated: January 2024</p>
            <div className="flex justify-center mt-4">
              <Badge className="bg-green-600">GDPR Compliant</Badge>
            </div>
          </div>

          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-6">
              <ScrollArea className="h-[600px] pr-4">
                <div className="space-y-6">
                  <section>
                    <h2 className="text-xl font-semibold mb-3 text-gold-400">1. Information We Collect</h2>
                    <div className="space-y-3 text-gray-300">
                      <p><strong>1.1 Personal Information:</strong> Name, email address, phone number, and billing information when you create an account or make purchases.</p>
                      <p><strong>1.2 Usage Data:</strong> Information about how you use our website, including pages visited, time spent, and features used.</p>
                      <p><strong>1.3 Device Information:</strong> Browser type, operating system, IP address, and device identifiers.</p>
                      <p><strong>1.4 Location Data:</strong> General location information to show nearby theaters (with your consent).</p>
                      <p><strong>1.5 Communication Data:</strong> Records of your interactions with our customer support team.</p>
                    </div>
                  </section>

                  <Separator className="bg-gray-700" />

                  <section>
                    <h2 className="text-xl font-semibold mb-3 text-gold-400">2. How We Use Your Information</h2>
                    <div className="space-y-3 text-gray-300">
                      <p><strong>2.1 Service Provision:</strong> To process bookings, manage your account, and provide customer support.</p>
                      <p><strong>2.2 Communication:</strong> To send booking confirmations, updates, and important service announcements.</p>
                      <p><strong>2.3 Personalization:</strong> To recommend movies and showtimes based on your preferences and viewing history.</p>
                      <p><strong>2.4 Analytics:</strong> To analyze usage patterns and improve our services.</p>
                      <p><strong>2.5 Legal Compliance:</strong> To comply with legal obligations and protect our rights.</p>
                    </div>
                  </section>

                  <Separator className="bg-gray-700" />

                  <section>
                    <h2 className="text-xl font-semibold mb-3 text-gold-400">3. Information Sharing</h2>
                    <div className="space-y-3 text-gray-300">
                      <p><strong>3.1 No Sale of Data:</strong> We do not sell, trade, or rent your personal information to third parties.</p>
                      <p><strong>3.2 Service Providers:</strong> We may share data with trusted partners who help us operate our services (payment processors, email services).</p>
                      <p><strong>3.3 Legal Requirements:</strong> We may disclose information when required by law or to protect our rights.</p>
                      <p><strong>3.4 Business Transfers:</strong> Information may be transferred in the event of a merger, acquisition, or sale of business.</p>
                      <p><strong>3.5 Anonymous Data:</strong> We may share aggregated, anonymous data for research and analytics purposes.</p>
                    </div>
                  </section>

                  <Separator className="bg-gray-700" />

                  <section>
                    <h2 className="text-xl font-semibold mb-3 text-gold-400">4. Data Security</h2>
                    <div className="space-y-3 text-gray-300">
                      <p><strong>4.1 Encryption:</strong> All sensitive data is encrypted in transit and at rest using industry-standard protocols.</p>
                      <p><strong>4.2 Access Controls:</strong> We implement strict access controls and authentication measures for our systems.</p>
                      <p><strong>4.3 Regular Audits:</strong> We conduct regular security audits and vulnerability assessments.</p>
                      <p><strong>4.4 Employee Training:</strong> Our staff receives regular training on data protection and privacy practices.</p>
                      <p><strong>4.5 Incident Response:</strong> We have procedures in place to respond quickly to any security incidents.</p>
                    </div>
                  </section>

                  <Separator className="bg-gray-700" />

                  <section>
                    <h2 className="text-xl font-semibold mb-3 text-gold-400">5. Your Rights</h2>
                    <div className="space-y-3 text-gray-300">
                      <p><strong>5.1 Access:</strong> You can request a copy of the personal information we hold about you.</p>
                      <p><strong>5.2 Correction:</strong> You can update or correct your personal information through your account settings.</p>
                      <p><strong>5.3 Deletion:</strong> You can request deletion of your personal information (subject to legal requirements).</p>
                      <p><strong>5.4 Portability:</strong> You can request your data in a machine-readable format.</p>
                      <p><strong>5.5 Opt-out:</strong> You can unsubscribe from marketing communications at any time.</p>
                    </div>
                  </section>

                  <Separator className="bg-gray-700" />

                  <section>
                    <h2 className="text-xl font-semibold mb-3 text-gold-400">6. Cookies and Tracking</h2>
                    <div className="space-y-3 text-gray-300">
                      <p><strong>6.1 Essential Cookies:</strong> Required for basic site functionality and security.</p>
                      <p><strong>6.2 Analytics Cookies:</strong> Help us understand how you use our site to improve performance.</p>
                      <p><strong>6.3 Preference Cookies:</strong> Remember your settings and preferences.</p>
                      <p><strong>6.4 Cookie Management:</strong> You can control cookies through your browser settings.</p>
                      <p><strong>6.5 Third-party Tracking:</strong> We may use third-party services for analytics and advertising.</p>
                    </div>
                  </section>

                  <Separator className="bg-gray-700" />

                  <section>
                    <h2 className="text-xl font-semibold mb-3 text-gold-400">7. Data Retention</h2>
                    <div className="space-y-3 text-gray-300">
                      <p><strong>7.1 Account Data:</strong> Kept for as long as your account is active or as needed to provide services.</p>
                      <p><strong>7.2 Transaction Records:</strong> Retained for 7 years for accounting and legal purposes.</p>
                      <p><strong>7.3 Communication Records:</strong> Customer service interactions kept for 2 years.</p>
                      <p><strong>7.4 Marketing Data:</strong> Deleted when you unsubscribe or as required by law.</p>
                      <p><strong>7.5 Legal Hold:</strong> Data may be retained longer if required for legal proceedings.</p>
                    </div>
                  </section>

                  <Separator className="bg-gray-700" />

                  <section>
                    <h2 className="text-xl font-semibold mb-3 text-gold-400">8. Children's Privacy</h2>
                    <div className="space-y-3 text-gray-300">
                      <p><strong>8.1 Age Restrictions:</strong> Our services are not intended for children under 13.</p>
                      <p><strong>8.2 Parental Consent:</strong> Users between 13-17 should have parental permission to use our services.</p>
                      <p><strong>8.3 Data Collection:</strong> We do not knowingly collect personal information from children under 13.</p>
                      <p><strong>8.4 Discovery and Deletion:</strong> If we discover we have collected data from a child under 13, we will delete it immediately.</p>
                    </div>
                  </section>

                  <Separator className="bg-gray-700" />

                  <section>
                    <h2 className="text-xl font-semibold mb-3 text-gold-400">9. International Data Transfers</h2>
                    <div className="space-y-3 text-gray-300">
                      <p><strong>9.1 Global Operations:</strong> Your data may be processed in countries where we or our service providers operate.</p>
                      <p><strong>9.2 Adequate Protection:</strong> We ensure appropriate safeguards are in place for international transfers.</p>
                      <p><strong>9.3 EU-US Privacy Framework:</strong> We comply with applicable data transfer mechanisms.</p>
                    </div>
                  </section>

                  <Separator className="bg-gray-700" />

                  <section>
                    <h2 className="text-xl font-semibold mb-3 text-gold-400">10. Contact Us</h2>
                    <div className="space-y-2 text-gray-300">
                      <p>For privacy-related questions or to exercise your rights:</p>
                      <p><strong>Privacy Officer:</strong> privacy@c-cinema.com</p>
                      <p><strong>Phone:</strong> (555) 123-PRIVACY</p>
                      <p><strong>Address:</strong> 123 Cinema Street, Movie City, MC 12345</p>
                      <p><strong>Response Time:</strong> We will respond to your inquiry within 30 days.</p>
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