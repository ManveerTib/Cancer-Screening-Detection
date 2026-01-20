import { AlertTriangle, Shield, Lock, AlertCircle, Scale } from 'lucide-react';

export default function DisclaimersPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-primary-50 to-slate-100">
      <div className="py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <AlertTriangle className="h-16 w-16 text-red-600 mx-auto mb-4" />
            <h1 className="text-5xl font-bold text-gray-900 mb-4">Important Disclaimers</h1>
            <p className="text-xl text-gray-600">Please Read Carefully Before Using This Platform</p>
          </div>

          <div className="bg-red-50 border-2 border-red-400 rounded-2xl shadow-xl p-8 md:p-12 mb-8">
            <div className="flex items-start gap-4 mb-4">
              <AlertTriangle className="h-8 w-8 text-red-600 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl font-bold text-red-900 mb-3">Critical Notice</h2>
                <p className="text-lg text-red-900 font-semibold">
                  OncoScanAI is an educational, student-led project and is <strong>NOT a medical device</strong>.
                </p>
                <p className="text-lg text-red-800 mt-2">
                  It does not provide medical diagnoses, treatment recommendations, or professional
                  healthcare guidance.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 mb-8">
            <div className="flex items-start gap-4 mb-6">
              <AlertCircle className="h-8 w-8 text-orange-600 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Not a Substitute for Medical Professionals
                </h2>
              </div>
            </div>

            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-orange-600 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-lg text-gray-700">
                  The AI predictions are <strong>experimental</strong> and may be inaccurate.
                </p>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-orange-600 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-lg text-gray-700">
                  This platform is meant for <strong>learning, awareness, and research exploration only</strong>.
                </p>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-orange-600 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-lg text-gray-700">
                  Any medical concerns should always be reviewed by a <strong>licensed doctor or radiologist</strong>.
                </p>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-orange-600 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-lg text-gray-700">
                  Users should <strong>NOT rely on this tool for medical decisions</strong>.
                </p>
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 mb-8">
            <div className="flex items-start gap-4 mb-6">
              <Lock className="h-8 w-8 text-primary-600 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Data and Privacy</h2>
              </div>
            </div>

            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary-600 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-lg text-gray-700">
                  Uploaded scans are used only for generating predictions and are not stored unless the
                  user explicitly chooses to save them.
                </p>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary-600 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-lg text-gray-700">
                  We do not share data with external organizations.
                </p>
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 mb-8">
            <div className="flex items-start gap-4 mb-6">
              <Shield className="h-8 w-8 text-purple-600 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Model Limitations</h2>
              </div>
            </div>

            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-purple-600 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-lg text-gray-700">
                  AI predictions are influenced by dataset quality, image resolution, and preprocessing steps.
                </p>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-purple-600 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-lg text-gray-700">
                  <strong>False positives and false negatives may occur</strong>.
                </p>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-purple-600 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-lg text-gray-700">
                  The system is <strong>not validated for clinical use</strong>.
                </p>
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 mb-8">
            <div className="flex items-start gap-4 mb-6">
              <Scale className="h-8 w-8 text-accent-600 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Ethical Use</h2>
              </div>
            </div>

            <p className="text-lg text-gray-700 mb-4">By using this platform, you agree to:</p>

            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-accent-600 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-lg text-gray-700">
                  Use the tool <strong>responsibly and for educational purposes only</strong>
                </p>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-accent-600 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-lg text-gray-700">
                  Avoid using results for patient care or real-world clinical scenarios
                </p>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-accent-600 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-lg text-gray-700">
                  Understand that this is an experimental research project built by students
                </p>
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 mb-8">
            <div className="flex items-start gap-4 mb-6">
              <AlertTriangle className="h-8 w-8 text-yellow-600 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">HIPAA Compliance</h2>
              </div>
            </div>

            <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-6 mb-4">
              <p className="text-lg text-gray-800 mb-3">
                OncoScanAI is <strong>not a HIPAA-covered entity</strong> because it is a student-led
                educational and research project, not a medical provider.
              </p>
            </div>

            <p className="text-lg text-gray-700 mb-4">However, we take data privacy and security seriously:</p>

            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-yellow-600 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-gray-700">
                  Uploaded X-rays are not stored unless users explicitly save them for educational purposes
                </p>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-yellow-600 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-gray-700">We do not share data with third parties</p>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-yellow-600 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-gray-700">
                  The platform is strictly for research, learning, and awareness, not clinical use
                </p>
              </li>
            </ul>

            <div className="mt-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
              <p className="text-gray-800 font-semibold">
                Users should not upload any personally identifiable health information protected under HIPAA.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
            <div className="flex items-start gap-4 mb-6">
              <Scale className="h-8 w-8 text-red-600 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Liability</h2>
              </div>
            </div>

            <div className="bg-red-50 border-2 border-red-300 rounded-xl p-6">
              <p className="text-lg text-gray-800 font-semibold mb-3">
                OncoScanAI is not liable for any damages.
              </p>
              <p className="text-gray-700 mb-3">
                Since OncoScanAI is a student-led educational and research initiative, we are{' '}
                <strong>not liable</strong> for any financial, medical, or other damages resulting from
                the use of this platform.
              </p>
              <p className="text-gray-700">
                The website is intended solely for educational and awareness purposes. Users should never
                rely on it for medical, legal, or financial decisions, and all health concerns must be
                addressed by licensed professionals.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
