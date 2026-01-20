import { Activity, Heart, Scan, TrendingUp, Shield, Eye, Cpu, Database } from 'lucide-react';

export default function CancerInfoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-primary-50 to-slate-100">
      <div className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">Cancer Information</h1>
            <p className="text-xl text-gray-600">Understanding Cancer & How AI Can Help</p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              More About Cancers Affecting People Today
            </h2>
            <p className="text-lg text-gray-700 mb-6">
              Although cancer can occur anywhere in the body, some types are more common or more aggressive:
            </p>

            <div className="grid md:grid-cols-2 gap-4 mb-8">
              <div className="bg-primary-50 border-l-4 border-primary-600 p-4 rounded-r-lg">
                <h3 className="font-bold text-gray-900 mb-2">Lung Cancer</h3>
                <p className="text-gray-700 text-sm">
                  Includes non-small cell and small cell lung cancers; often identified through imaging.
                </p>
              </div>
              <div className="bg-pink-50 border-l-4 border-pink-600 p-4 rounded-r-lg">
                <h3 className="font-bold text-gray-900 mb-2">Breast Cancer</h3>
                <p className="text-gray-700 text-sm">
                  One of the most commonly diagnosed cancers globally.
                </p>
              </div>
              <div className="bg-orange-50 border-l-4 border-orange-600 p-4 rounded-r-lg">
                <h3 className="font-bold text-gray-900 mb-2">Colorectal Cancer</h3>
                <p className="text-gray-700 text-sm">
                  A leading cause of cancer deaths worldwide.
                </p>
              </div>
              <div className="bg-purple-50 border-l-4 border-purple-600 p-4 rounded-r-lg">
                <h3 className="font-bold text-gray-900 mb-2">Prostate Cancer</h3>
                <p className="text-gray-700 text-sm">
                  Common among men, especially above age 50.
                </p>
              </div>
              <div className="bg-red-50 border-l-4 border-red-600 p-4 rounded-r-lg">
                <h3 className="font-bold text-gray-900 mb-2">Leukemia & Lymphomas</h3>
                <p className="text-gray-700 text-sm">
                  Cancers of the blood and lymphatic system.
                </p>
              </div>
              <div className="bg-yellow-50 border-l-4 border-yellow-600 p-4 rounded-r-lg">
                <h3 className="font-bold text-gray-900 mb-2">Skin Cancer</h3>
                <p className="text-gray-700 text-sm">
                  Including melanoma, one of the most rapidly rising cancers.
                </p>
              </div>
            </div>

            <div className="bg-primary-100 border-2 border-primary-300 rounded-xl p-6">
              <p className="text-gray-800 font-semibold">
                Our project focuses primarily on <strong>lung cancer</strong>, because chest X-rays are
                often the first imaging test used in screening or initial assessment.
              </p>
            </div>
          </div>

          <div className="rounded-2xl shadow-xl p-8 md:p-12 mb-8 border-2 border-blue-600 bg-blue-600">
            <div className="flex items-start gap-4 mb-6">
              <TrendingUp className="h-10 w-10 flex-shrink-0 text-white" />
              <div>
                <h2 className="text-3xl font-bold mb-4 text-white">How Early Detection Helps</h2>
                <p className="text-lg mb-4 text-white">Early detection dramatically changes outcomes:</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-4 shadow-sm border border-accent-200">
                <p className="font-semibold mb-2 text-gray-900">Up to 90% Survival Rate</p>
                <p className="text-sm text-gray-700">
                  Identifying cancer early increases survival chances for many types
                </p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm border border-accent-200">
                <p className="font-semibold mb-2 text-gray-900">Less Aggressive Treatments</p>
                <p className="text-sm text-gray-700">
                  Early detection allows for higher recovery rates and lower cost of care
                </p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm border border-accent-200">
                <p className="font-semibold mb-2 text-gray-900">2-3x Survival Rate for Lung Cancer</p>
                <p className="text-sm text-gray-700">
                  Early detection can double or even triple survival rates
                </p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm border border-accent-200">
                <p className="font-semibold mb-2 text-gray-900">Faster Decision-Making</p>
                <p className="text-sm text-gray-700">
                  Empowers patients and doctors with information sooner
                </p>
              </div>
            </div>

            <div className="mt-6 bg-white border-2 border-blue-300 rounded-lg p-6">
              <p className="text-lg text-gray-900 font-medium">
                With AI, we can help flag potential risks earlier—not to replace doctors, but to support
                awareness and education around early screening.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">How It Works</h2>

            <div className="mb-8">
              <div className="flex items-start gap-4 mb-4">
                <Scan className="h-8 w-8 text-primary-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">AI-Powered Scan Analysis</h3>
                  <p className="text-gray-700 mb-4">
                    Our platform uses multiple machine-learning and deep-learning models trained on
                    medical imaging datasets. Each scan is processed through a series of specialized
                    algorithms that evaluate abnormalities and provide:
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-primary-600 font-bold">•</span>
                      <span className="text-gray-700">Risk prediction for possible cancer presence</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary-600 font-bold">•</span>
                      <span className="text-gray-700">
                        Insights on likely cancer types based on visual and structural markers
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary-600 font-bold">•</span>
                      <span className="text-gray-700">
                        Model-generated explanations to increase transparency
                      </span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 rounded-r-lg">
                <p className="text-gray-800">
                  While our system does <strong>NOT</strong> replace medical professionals, it offers an
                  additional, supportive layer of insight for early screening and awareness.
                </p>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Behind the Scenes</h3>
              <p className="text-gray-700 mb-6">
                Our models examine thousands of visual patterns—including textures, shadows, edges, and
                structural abnormalities—to generate a risk prediction and insights on possible cancer types.
              </p>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-primary-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Cpu className="h-5 w-5 text-primary-600" />
                    <h4 className="font-bold text-gray-900">CNNs</h4>
                  </div>
                  <p className="text-sm text-gray-700">
                    Convolutional Neural Networks that detect subtle features within medical images
                  </p>
                </div>

                <div className="bg-accent-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Database className="h-5 w-5 text-accent-600" />
                    <h4 className="font-bold text-gray-900">Transfer Learning</h4>
                  </div>
                  <p className="text-sm text-gray-700">
                    Models pre-trained on large imaging datasets and fine-tuned for cancer detection
                  </p>
                </div>

                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="h-5 w-5 text-purple-600" />
                    <h4 className="font-bold text-gray-900">Ensemble Learning</h4>
                  </div>
                  <p className="text-sm text-gray-700">
                    Multiple models work together to improve reliability
                  </p>
                </div>

                <div className="bg-yellow-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Eye className="h-5 w-5 text-yellow-600" />
                    <h4 className="font-bold text-gray-900">Explainable AI (XAI)</h4>
                  </div>
                  <p className="text-sm text-gray-700">
                    Tools that highlight specific regions that influenced each prediction
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-primary-50 to-purple-50 border-2 border-primary-200 rounded-xl p-6">
              <div className="flex items-start gap-3">
                <Shield className="h-6 w-6 text-primary-600 flex-shrink-0 mt-1" />
                <div>
                  <p className="text-gray-800 mb-3">
                    Our prediction system is continuously trained and improved as we refine datasets,
                    adjust architectures, and reduce model bias—helping boost accuracy and reliability
                    over time.
                  </p>
                  <p className="text-gray-700 italic">
                    While this is an educational tool and not a medical diagnostic device, it represents
                    an exciting step toward how AI can support future cancer screening.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
            <div className="flex items-start gap-4 mb-6">
              <Heart className="h-10 w-10 text-red-500 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Why We Built This</h2>
                <p className="text-lg text-gray-700 mb-4">
                  This project is entirely <strong>student-led</strong>—created by young researchers
                  passionate about the intersection of healthcare, AI, and social impact.
                </p>
              </div>
            </div>

            <div className="bg-primary-50 border-2 border-primary-200 rounded-xl p-6 mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-3">We believe:</h3>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-primary-600 font-bold">•</span>
                  <span className="text-gray-700">
                    Students can contribute meaningfully to real-world problems
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-600 font-bold">•</span>
                  <span className="text-gray-700">
                    Technology should break barriers, not create them
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-600 font-bold">•</span>
                  <span className="text-gray-700">
                    Early detection tools should be accessible, educational, and empowering
                  </span>
                </li>
              </ul>
            </div>

            <p className="text-lg text-gray-700">
              Our team is driven by a shared passion to understand cancer deeply—its challenges, its
              complexities, and its impact on millions of lives. Working on this project has inspired us
              to pursue cancer research, biomedical engineering, and AI innovation more seriously.
            </p>

            <div className="mt-6 bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-500 p-6 rounded-r-lg">
              <p className="text-gray-800 font-semibold italic">
                Every line of code, every model we train, and every improvement we make is fueled by a
                commitment to learning and helping others.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
