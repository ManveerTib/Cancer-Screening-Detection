import { HelpCircle, ChevronDown } from 'lucide-react';
import { useState } from 'react';

interface FAQItemProps {
  question: string;
  answer: string | JSX.Element;
  defaultOpen?: boolean;
}

function FAQItem({ question, answer, defaultOpen = false }: FAQItemProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden border-2 border-gray-200 hover:border-primary-300 transition-colors">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
      >
        <span className="font-semibold text-gray-900 pr-4">{question}</span>
        <ChevronDown
          className={`h-5 w-5 text-primary-600 flex-shrink-0 transition-transform ${
            isOpen ? 'transform rotate-180' : ''
          }`}
        />
      </button>
      {isOpen && (
        <div className="px-6 pb-6 text-gray-700">
          {typeof answer === 'string' ? <p>{answer}</p> : answer}
        </div>
      )}
    </div>
  );
}

export default function FAQPage() {
  const faqs = [
    {
      question: '1. What is OncoScanAI?',
      answer:
        'OncoScanAI is a student-led research project that uses artificial intelligence to analyze chest X-ray images and identify patterns that may be associated with early cancer indicators. The platform is designed for educational and awareness purposes, not for medical diagnosis.',
    },
    {
      question: '2. Is this an official medical tool?',
      answer:
        'No. OncoScanAI is not a medical device and should not be used for clinical decisions, treatment, or diagnosis. All medical concerns should be reviewed by a licensed healthcare professional.',
    },
    {
      question: '3. How does the AI detect cancer risk?',
      answer: (
        <div>
          <p className="mb-3">
            Our system uses deep-learning models, primarily Convolutional Neural Networks (CNNs),
            trained on large sets of medical images. The models examine:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Texture changes</li>
            <li>Shadows or opacities</li>
            <li>Irregular shapes</li>
            <li>Structural abnormalities</li>
            <li>Pattern deviations in lung fields</li>
          </ul>
          <p className="mt-3">
            Multiple models work together (ensemble learning) to improve reliability, and explainable
            AI tools highlight which parts of the X-ray influenced each prediction.
          </p>
        </div>
      ),
    },
    {
      question: '4. What types of cancer can the AI identify?',
      answer: (
        <div>
          <p className="mb-3">
            The platform mainly focuses on lung cancer detection, as chest X-rays are commonly used for
            initial assessment. The model may provide insights into:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Lung nodules</li>
            <li>Masses</li>
            <li>Possible tumor-like patterns</li>
            <li>Structural changes associated with certain cancer types</li>
          </ul>
          <p className="mt-3 font-semibold">Predictions are experimental and not diagnostic.</p>
        </div>
      ),
    },
    {
      question: '5. How accurate is the AI?',
      answer: (
        <div>
          <p className="mb-3">Accuracy depends on:</p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Image quality</li>
            <li>Dataset balance</li>
            <li>Model training</li>
            <li>Preprocessing steps</li>
          </ul>
          <p className="mt-3">
            Our models are continuously improved as we refine datasets, adjust architectures, and reduce
            bias. However, accuracy is not guaranteed, and results should never replace professional
            medical advice.
          </p>
        </div>
      ),
    },
    {
      question: '6. Do you store my X-ray images?',
      answer:
        'No. Uploaded scans are not stored unless users explicitly choose to save them for educational purposes. We do not share data with third parties.',
    },
    {
      question: '7. Who created this project?',
      answer:
        'OncoScanAI is created and managed by a team of high school students passionate about AI, healthcare, and cancer research. Our goal is to learn, innovate, and contribute to global health awareness.',
    },
    {
      question: '8. Why did you build this platform?',
      answer: (
        <div>
          <p className="mb-3">We built OncoScanAI to:</p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Explore how AI can assist medical imaging</li>
            <li>Educate students and families about early cancer detection</li>
            <li>Inspire research and innovation in healthcare</li>
            <li>Make AI in healthcare more accessible and understandable</li>
          </ul>
        </div>
      ),
    },
    {
      question: '9. Can doctors use this tool?',
      answer:
        'Doctors, radiologists, and researchers are welcome to explore the platform for educational or experimental purposes, but it is not intended for clinical use.',
    },
    {
      question: '10. What technology powers the predictions?',
      answer: (
        <div>
          <p className="mb-3">Our system uses:</p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>CNNs (Convolutional Neural Networks)</li>
            <li>Transfer learning models (ResNet, DenseNet, etc.)</li>
            <li>Ensemble learning for stable predictions</li>
            <li>Image preprocessing pipelines for clarity and consistency</li>
            <li>Explainable AI (XAI) for heatmaps and visual insights</li>
          </ul>
        </div>
      ),
    },
    {
      question: '11. Can this detect all types of cancer?',
      answer:
        'No. The platform focuses primarily on abnormalities commonly associated with lung cancer in chest X-rays. Many cancers cannot be seen on an X-ray and require CT scans, MRIs, biopsies, or lab tests.',
    },
    {
      question: '12. How should I respond if the AI shows a high-risk prediction?',
      answer:
        'Do not panic and do not rely on the AI result. Consult a licensed doctor or radiologist for proper evaluation.',
    },
    {
      question: '13. Does the AI replace doctors or radiologists?',
      answer:
        'No. AI is meant to support education and awareness, not replace trained medical professionals. All medical decisions must be guided by licensed clinicians.',
    },
    {
      question: '14. Is this project still improving?',
      answer: (
        <div>
          <p className="mb-3">Yes! We continuously:</p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Retrain our models</li>
            <li>Add new features</li>
            <li>Refine accuracy</li>
            <li>Improve transparency</li>
            <li>Update our research</li>
          </ul>
          <p className="mt-3">
            This is a learning journey, and we are committed to growing responsibly.
          </p>
        </div>
      ),
    },
    {
      question: '15. Is this only a website, or do you have a mobile app as well?',
      answer:
        'Right now, OncoScanAI is available only as a website. We are testing early mobile app prototypes, but they are still in the trial and development phase. Once stable, we plan to make it available to users.',
    },
    {
      question: '16. Do I need to create an account or share personal information?',
      answer:
        'No. You do not need an account to use the prototype. We do not save any user profiles or uploaded X-rays. All scans are processed temporarily for educational and research purposes. When the platform becomes market-ready, we will update users on any account or data policies.',
    },
    {
      question: '17. Is OncoScanAI HIPAA-compliant?',
      answer: (
        <div>
          <p className="mb-3">
            OncoScanAI is not a HIPAA-covered entity because it is a student-led educational and
            research project, not a medical provider.
          </p>
          <p className="mb-3">However, we take data privacy and security seriously:</p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>
              Uploaded X-rays are not stored unless users explicitly save them for educational purposes
            </li>
            <li>We do not share data with third parties</li>
            <li>The platform is strictly for research, learning, and awareness, not clinical use</li>
          </ul>
          <p className="mt-3 font-semibold">
            Users should not upload any personally identifiable health information protected under HIPAA.
          </p>
        </div>
      ),
    },
    {
      question: '18. Is the platform safe and ethical to use?',
      answer: (
        <div>
          <p className="mb-3">
            Yes. We prioritize safety, transparency, and ethical AI usage. OncoScanAI is
            educational—not diagnostic. We are students learning how technology can create meaningful
            impact.
          </p>
          <p className="mb-3">We continuously:</p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Refine and retrain our models</li>
            <li>Improve dataset quality and reduce bias</li>
            <li>Analyze errors to improve predictions</li>
            <li>Make all processes transparent and responsible</li>
          </ul>
          <p className="mt-3">
            The platform demonstrates the potential of AI in healthcare while ensuring safe and ethical
            learning.
          </p>
        </div>
      ),
    },
    {
      question: '19. Is OncoScanAI liable for any damages?',
      answer:
        'No. Since OncoScanAI is a student-led educational and research initiative, we are not liable for any financial, medical, or other damages resulting from the use of this platform. The website is intended solely for educational and awareness purposes. Users should never rely on it for medical, legal, or financial decisions, and all health concerns must be addressed by licensed professionals.',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-primary-50 to-slate-100">
      <div className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <HelpCircle className="h-16 w-16 text-primary-600 mx-auto mb-4" />
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-xl text-gray-600">Find answers to common questions about OncoScanAI</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <FAQItem
                key={index}
                question={faq.question}
                answer={faq.answer}
                defaultOpen={index === 0}
              />
            ))}
          </div>

          <div className="mt-12 bg-primary-600 rounded-2xl shadow-xl p-8 text-white text-center">
            <h3 className="text-2xl font-bold mb-3">Still Have Questions?</h3>
            <p className="text-lg mb-4">
              We're here to help! OncoScanAI is continuously evolving, and we welcome feedback,
              questions, and suggestions.
            </p>
            <p className="text-sm opacity-90">
              Remember: This platform is for educational purposes only. Always consult licensed
              healthcare professionals for medical advice.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
