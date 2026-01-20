import { Link } from 'react-router-dom';
import { Brain, Heart, AlertTriangle } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="fixed bottom-0 left-0 right-0 z-40 bg-gray-900/95 backdrop-blur-sm text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-blue-400" />
            <span className="text-sm font-medium">OncoScan.AI</span>
            <span className="text-xs text-gray-400">© 2025 Student-Led Initiative</span>
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-300">
            <AlertTriangle className="h-4 w-4 text-yellow-400" />
            <span>For Educational & Research Purposes Only</span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              to="/disclaimers"
              className="text-xs text-gray-300 hover:text-white transition-colors"
            >
              Disclaimers
            </Link>
            <Link
              to="/faq"
              className="text-xs text-gray-300 hover:text-white transition-colors"
            >
              FAQ
            </Link>
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <span>Made with</span>
              <Heart className="h-3 w-3 text-red-400 fill-red-400" />
              <span>by Students</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
