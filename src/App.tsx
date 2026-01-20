import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import CancerInfoPage from './pages/CancerInfoPage';
import ScanPage from './pages/ScanPage';
import DisclaimersPage from './pages/DisclaimersPage';
import FAQPage from './pages/FAQPage';
import ComparePage from './pages/ComparePage';
import AnalyticsDashboard from './pages/AnalyticsDashboard';

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow pt-20 pb-20">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/cancer-info" element={<CancerInfoPage />} />
            <Route path="/scan" element={<ScanPage />} />
            <Route path="/compare" element={<ComparePage />} />
            <Route path="/analytics" element={<AnalyticsDashboard />} />
            <Route path="/disclaimers" element={<DisclaimersPage />} />
            <Route path="/faq" element={<FAQPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
