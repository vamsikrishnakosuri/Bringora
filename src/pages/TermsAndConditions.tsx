import { useLanguage } from '@/contexts/LanguageContext'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { useNavigate } from 'react-router-dom'
import { Shield, AlertTriangle, FileText, ArrowLeft } from 'lucide-react'

export default function TermsAndConditions() {
  const { t } = useLanguage()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-white dark:from-[#0A0A0A] dark:via-[#0F0F0F] dark:to-[#0A0A0A] py-6 sm:py-8 lg:py-12 px-3 sm:px-4 lg:px-6">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4 flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('common.back') || 'Back'}
          </Button>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 dark:text-white tracking-tight flex items-center gap-3">
            <FileText className="w-8 h-8 sm:w-10 sm:h-10" />
            Terms and Conditions
          </h1>
        </div>

        <Card className="backdrop-blur-xl bg-white/80 dark:bg-[#1A1A1A]/80 border-white/20 dark:border-white/10">
          <div className="space-y-6 p-6 sm:p-8">
            {/* Payment Warning Section */}
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 dark:border-yellow-400 p-4 rounded-r-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-yellow-900 dark:text-yellow-200 mb-2">
                    ⚠️ Important Payment Warning
                  </h3>
                  <p className="text-sm text-yellow-800 dark:text-yellow-300 leading-relaxed">
                    <strong>Never pay upfront.</strong> Always pay only after the work is completed and verified. 
                    Bringora is not responsible for any payments made between users. We strongly recommend:
                  </p>
                  <ul className="text-sm text-yellow-800 dark:text-yellow-300 mt-2 space-y-1 list-disc list-inside">
                    <li>Verify the work is completed before making any payment</li>
                    <li>Use secure payment methods</li>
                    <li>Keep records of all transactions</li>
                    <li>Report any suspicious activity immediately</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Terms Content */}
            <div className="prose dark:prose-invert max-w-none">
              {/* Free Service Notice */}
              <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 dark:border-green-400 rounded-r-lg">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                      <span className="text-green-600 dark:text-green-400 text-xl">✓</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-green-900 dark:text-green-200 mb-2">
                      🆓 100% Free Service
                    </h3>
                    <p className="text-sm text-green-800 dark:text-green-300 leading-relaxed">
                      <strong>Bringora is completely free and non-commercial.</strong> We do not charge users any fees, 
                      do not display advertisements, and do not take commissions from transactions. This is a free 
                      community platform created as an educational project to help people connect and assist each other.
                    </p>
                  </div>
                </div>
              </div>

              <section className="mb-6">
                <h2 className="text-xl font-bold mb-3 dark:text-white flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  1. Platform Usage
                </h2>
                <p className="text-muted dark:text-gray-300 leading-relaxed">
                  Bringora is a <strong>free, non-commercial</strong> community platform connecting people who need help 
                  with verified helpers. This platform is provided at no cost to users. By using our platform, you agree 
                  to use it responsibly and in accordance with these terms.
                </p>
              </section>

              <section className="mb-6">
                <h2 className="text-xl font-bold mb-3 dark:text-white">2. Free Service & Payment Policy</h2>
                <div className="space-y-3 text-muted dark:text-gray-300">
                  <p className="leading-relaxed">
                    <strong>Bringora is a completely free platform.</strong> We do not charge users any fees, 
                    subscriptions, or commissions. There are no advertisements, and we do not monetize user data.
                  </p>
                  <p className="leading-relaxed">
                    <strong>Bringora is NOT responsible for payments between users.</strong> All transactions 
                    are conducted directly between requesters and helpers. We do not process, handle, or facilitate 
                    any payments.
                  </p>
                  <p className="leading-relaxed">
                    <strong>Payment Guidelines:</strong>
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Never pay upfront or before work is completed</li>
                    <li>Always verify work completion before payment</li>
                    <li>Use secure payment methods (bank transfer, UPI, etc.)</li>
                    <li>Keep records of all transactions</li>
                    <li>Report any payment disputes to our support team</li>
                  </ul>
                  <p className="leading-relaxed mt-3">
                    <strong>We strongly recommend:</strong> Pay only after you have verified that the work 
                    has been completed to your satisfaction. If you have any concerns, contact the helper 
                    through our secure in-app chat before making payment.
                  </p>
                </div>
              </section>

              <section className="mb-6">
                <h2 className="text-xl font-bold mb-3 dark:text-white">3. User Responsibilities</h2>
                <ul className="list-disc list-inside space-y-2 text-muted dark:text-gray-300 ml-4">
                  <li>Provide accurate information in your profile and requests</li>
                  <li>Treat all users with respect and professionalism</li>
                  <li>Complete work as agreed upon</li>
                  <li>Pay only after work is verified and completed</li>
                  <li>Report any suspicious or inappropriate behavior</li>
                </ul>
              </section>

              <section className="mb-6">
                <h2 className="text-xl font-bold mb-3 dark:text-white">4. Helper Verification</h2>
                <p className="text-muted dark:text-gray-300 leading-relaxed">
                  Helpers undergo identity verification before being approved. However, Bringora does not 
                  guarantee the quality of work or conduct background checks beyond identity verification. 
                  Users are responsible for their own safety and should use their judgment when engaging with helpers.
                </p>
              </section>

              <section className="mb-6">
                <h2 className="text-xl font-bold mb-3 dark:text-white">5. Limitation of Liability</h2>
                <p className="text-muted dark:text-gray-300 leading-relaxed mb-2">
                  <strong>Bringora is provided "as is" without any warranties.</strong> This is a free, non-commercial 
                  educational project. We are not responsible for:
                </p>
                <ul className="list-disc list-inside space-y-1 text-muted dark:text-gray-300 ml-4 mt-2">
                  <li>Payments made between users</li>
                  <li>Quality of work performed by helpers</li>
                  <li>Disputes between users</li>
                  <li>Any damages or losses incurred during transactions</li>
                  <li>Personal safety or security of users</li>
                  <li>Service availability or uptime</li>
                  <li>Data loss or security breaches</li>
                </ul>
                <p className="text-muted dark:text-gray-300 leading-relaxed mt-3">
                  <strong>Use at your own risk.</strong> By using this free platform, you acknowledge that you are 
                  using it voluntarily and accept all risks associated with its use.
                </p>
              </section>

              <section className="mb-6">
                <h2 className="text-xl font-bold mb-3 dark:text-white">6. Prohibited Activities</h2>
                <ul className="list-disc list-inside space-y-1 text-muted dark:text-gray-300 ml-4">
                  <li>Fraudulent or scam activities</li>
                  <li>Requesting upfront payment</li>
                  <li>Abusive language or harassment</li>
                  <li>Fake profiles or impersonation</li>
                  <li>Spam or unsolicited messages</li>
                </ul>
              </section>

              <section className="mb-6">
                <h2 className="text-xl font-bold mb-3 dark:text-white">7. Account Termination</h2>
                <p className="text-muted dark:text-gray-300 leading-relaxed">
                  We reserve the right to suspend or terminate accounts that violate these terms, engage in 
                  fraudulent activities, or harm other users. Users who request upfront payments or engage in 
                  scams will be immediately banned.
                </p>
              </section>

              <section className="mb-6">
                <h2 className="text-xl font-bold mb-3 dark:text-white">8. Contact and Support</h2>
                <p className="text-muted dark:text-gray-300 leading-relaxed">
                  If you encounter any issues, disputes, or need to report suspicious activity, please contact 
                  our support team through the app or email. We take all reports seriously and will investigate 
                  promptly.
                </p>
                <p className="text-muted dark:text-gray-300 leading-relaxed mt-2">
                  <strong>Note:</strong> As this is a free, non-commercial project, support response times may vary. 
                  We appreciate your patience and understanding.
                </p>
              </section>

              <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  <strong>Last Updated:</strong> {new Date().toLocaleDateString()}
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-400 mt-2">
                  <strong>Free & Non-Commercial:</strong> Bringora is a completely free, non-commercial platform. 
                  No fees, no ads, no commissions. Use it freely to connect with your community.
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-400 mt-2">
                  By using Bringora, you acknowledge that you have read, understood, and agree to these Terms and Conditions.
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

