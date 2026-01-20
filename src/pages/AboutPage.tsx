import { Users, Target, Lightbulb, TrendingUp, Shield } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <div className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">About Us</h1>
            <p className="text-xl text-gray-600">A Student-Led Initiative for Global Health Impact</p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Who We Are</h2>
            <p className="text-lg text-gray-700 mb-4">
              We are a team of student innovators passionate about the intersection of AI, healthcare,
              and cancer research. Our journey began with a simple question:
            </p>
            <blockquote className="border-l-4 border-blue-600 pl-6 py-2 my-6 bg-blue-50 rounded-r-lg">
              <p className="text-xl italic text-gray-800">
                "How can students contribute to solving one of the world's biggest health challenges?"
              </p>
            </blockquote>
            <p className="text-lg text-gray-700">
              From that idea grew <strong>OncoScanAI</strong>, a platform designed to explore how
              artificial intelligence can support early cancer risk detection through chest X-ray analysis.
            </p>
          </div>

          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl shadow-xl p-8 md:p-12 mb-8 text-white">
            <h2 className="text-3xl font-bold mb-4">Our Journey</h2>
            <p className="text-lg mb-4">
              What started as a high-school research project has evolved into a collaborative initiative
              involving students exploring data science, radiology, biology, and human-centered design.
            </p>
            <p className="text-lg">
              Every improvement we make pushes us closer to our dream:{' '}
              <strong className="text-yellow-300">
                a world where early detection is accessible to everyone.
              </strong>
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
            <p className="text-lg text-gray-700 mb-4">
              Our mission is to create <strong>accessible</strong>, <strong>educational</strong>, and{' '}
              <strong>impactful</strong> AI tools that help raise awareness about early cancer
              indicators—while inspiring young people to pursue careers in biomedical engineering,
              medicine, and machine learning.
            </p>
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 rounded-r-lg">
              <p className="text-lg text-gray-800 italic">
                We believe that meaningful innovation isn't limited by age—only by curiosity and effort.
              </p>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Our Values</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-lg p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-blue-600 rounded-lg">
                    <Lightbulb className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Innovation</h3>
                </div>
                <p className="text-gray-700">
                  We experiment with multiple deep-learning models, constantly refining accuracy and
                  transparency.
                </p>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-green-600 rounded-lg">
                    <Target className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Impact</h3>
                </div>
                <p className="text-gray-700">
                  Our long-term vision is to contribute to global cancer awareness and inspire future
                  breakthroughs.
                </p>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
              A Platform with Purpose
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                <Users className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-3">Accessible</h3>
                <p className="text-gray-700">
                  Designed to help individuals, students, and communities understand imaging-based
                  cancer risks.
                </p>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                <Lightbulb className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-3">Educational</h3>
                <p className="text-gray-700">
                  We offer resources that explain how AI interprets medical scans, helping users and
                  future healthcare innovators learn.
                </p>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                <TrendingUp className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-3">Innovative</h3>
                <p className="text-gray-700">
                  By combining neural networks, image processing, and explainable AI, we're exploring
                  the future of cancer detection.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
            <div className="flex items-start gap-4 mb-6">
              <Shield className="h-8 w-8 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Our Commitment to Safety, Ethics, and Transparency
                </h2>
              </div>
            </div>

            <p className="text-lg text-gray-700 mb-4">
              We prioritize safety, transparency, and the ethical use of AI in every part of our platform.
              OncoScanAI is designed purely as an <strong>educational and research tool</strong>—not a
              diagnostic system.
            </p>

            <p className="text-lg text-gray-700 mb-4">
              We are not medical professionals; we are students and learners driven by a passion to
              explore how technology can contribute to global health challenges.
            </p>

            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-3">Our Goal</h3>
              <p className="text-gray-700 mb-4">
                To build a platform that helps people understand how AI interprets medical images, while
                also inspiring curiosity in cancer research and biomedical innovation.
              </p>
              <p className="text-gray-700 font-semibold">
                Every prediction generated by our models is experimental and should never be used for
                clinical decisions.
              </p>
            </div>

            <h3 className="text-xl font-bold text-gray-900 mb-3">As part of our learning journey, we continuously:</h3>
            <ul className="space-y-2 mb-6">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span className="text-gray-700">Refine and retrain our models</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span className="text-gray-700">Improve dataset quality and balance</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span className="text-gray-700">Reduce biases and false predictions</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span className="text-gray-700">Analyze errors to strengthen model performance</span>
              </li>
            </ul>

            <div className="bg-green-50 border-l-4 border-green-600 p-6 rounded-r-lg">
              <p className="text-gray-800">
                With each dataset we study and each version we improve, we come closer to creating a
                reliable, ethical, and transparent AI system that demonstrates the future potential of
                cancer detection technology.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
