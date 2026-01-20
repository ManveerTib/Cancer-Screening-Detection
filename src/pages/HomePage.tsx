import { Link } from 'react-router-dom';
import { Brain, Heart, TrendingUp, Users, Globe, Target } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <div className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Reimagining Cancer Detection Through AI
            </h1>
            <p className="text-xl text-gray-700 max-w-4xl mx-auto leading-relaxed">
              Early detection saves lives. At OncoScanAI.com, we're building an accessible, AI-powered
              platform that analyzes chest X-ray scans to help identify potential signs of cancer—quickly,
              accurately, and responsibly.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 mb-12">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">How It Works</h2>
                <p className="text-lg text-gray-700 mb-6">
                  Just upload your chest X-ray and our AI model will analyze the image to detect and
                  predict the type of cancer. Our prediction model is well trained and is improving
                  on its accuracy each day.
                </p>
                <Link
                  to="/scan"
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-4 rounded-lg shadow-lg transition-colors"
                >
                  <Brain className="h-5 w-5" />
                  Try AI Scan Analysis
                </Link>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-8">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-600 rounded-lg">
                      <Target className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Upload X-Ray</h3>
                      <p className="text-sm text-gray-600">Upload your chest X-ray image securely</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-600 rounded-lg">
                      <Brain className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">AI Analysis</h3>
                      <p className="text-sm text-gray-600">Advanced deep learning models analyze patterns</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-600 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Get Results</h3>
                      <p className="text-sm text-gray-600">Receive detailed predictions and insights</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl shadow-xl p-8 md:p-12 mb-12 text-white">
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
              <p className="text-xl mb-2">
                Use technology to make life-saving insights available to everyone.
              </p>
              <p className="text-lg opacity-90">
                OncoScan.AI — <strong>A</strong> stands for <strong>Awareness</strong> and <strong>I</strong> for <strong>Impact</strong>.
              </p>
            </div>
          </div>

          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              Why Cancer Detection Matters
            </h2>
            <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                A Growing Global Health Challenge
              </h3>
              <p className="text-lg text-gray-700 mb-6">
                Cancer remains one of the most significant medical challenges worldwide. Its impact
                continues to grow across all age groups, affecting millions of families each year.
              </p>

              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 text-center">
                  <Globe className="h-12 w-12 text-red-600 mx-auto mb-3" />
                  <div className="text-3xl font-bold text-red-600 mb-2">2M+</div>
                  <p className="text-sm text-gray-700">New cancer cases in the U.S. annually</p>
                </div>
                <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-6 text-center">
                  <Users className="h-12 w-12 text-orange-600 mx-auto mb-3" />
                  <div className="text-3xl font-bold text-orange-600 mb-2">10M</div>
                  <p className="text-sm text-gray-700">Cancer-related deaths globally per year</p>
                </div>
                <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-6 text-center">
                  <Heart className="h-12 w-12 text-purple-600 mx-auto mb-3" />
                  <div className="text-3xl font-bold text-purple-600 mb-2">#1</div>
                  <p className="text-sm text-gray-700">Lung cancer: leading cause of cancer deaths</p>
                </div>
              </div>

              <div className="bg-blue-50 border-l-4 border-blue-600 p-6 rounded-lg">
                <p className="text-lg text-gray-800 italic">
                  Behind every number is a life, a family, and a story. This is why early detection
                  is so important.
                </p>
              </div>
            </div>
          </div>

          <div className="text-center">
            <Link
              to="/about"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold text-lg"
            >
              Learn More About Our Mission
              <span>→</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
