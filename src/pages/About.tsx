import React from 'react';
import { Zap, Brain, Cog as Cogs, TrendingUp, Shield, Users } from 'lucide-react';

const About: React.FC = () => {
  const features = [
    {
      icon: <Brain className="w-8 h-8 text-blue-600" />,
      title: 'Node Testing Framework',
      description: 'ProbationPilot provides comprehensive testing infrastructure to validate nodes before production deployment, ensuring system reliability.',
    },
    {
      icon: <Cogs className="w-8 h-8 text-blue-600" />,
      title: 'CRC & Burnin Management',
      description: 'Track and manage CRC experiments and burnin processes with detailed status monitoring and automated test orchestration.',
    },
    {
      icon: <Zap className="w-8 h-8 text-blue-600" />,
      title: 'Qualification Tracking',
      description: 'Monitor node qualification status with detailed container counts, session tracking, and availability state management.',
    },
    {
      icon: <TrendingUp className="w-8 h-8 text-blue-600" />,
      title: 'Production Pipeline',
      description: 'Streamlined workflow from probation through testing to production deployment with comprehensive audit trails.',
    },
  ];

  const benefits = [
    'Pre-Production Node Validation',
    'Reduced Production Failures',
    'Improved System Reliability',
    'Automated Test Orchestration',
    'Comprehensive Status Tracking',
  ];

  const useCases = [
    'Hardware node qualification before production deployment',
    'CRC experiment management and tracking',
    'Burnin process monitoring and validation',
    'Multi-region node testing and qualification workflows',
  ];

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="premium-card text-center space-y-6 p-12 animate-scale-in">
        <div className="flex items-center justify-center space-x-4 mb-8">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl blur-xl opacity-75 animate-pulse-slow"></div>
            <div className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 p-4 rounded-2xl shadow-2xl glow-effect">
              <Zap className="w-12 h-12 text-white animate-float" />
            </div>
          </div>
          <h1 className="text-5xl font-black text-gradient">ProbationPilot</h1>
        </div>
        <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300">
          Node Testing & Qualification Platform
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-4xl mx-auto leading-relaxed">
          ProbationPilot is an intelligent node testing and qualification platform designed to streamline and automate the validation of hardware nodes before production deployment. By providing comprehensive testing workflows, CRC experiment management, and burnin process tracking, ProbationPilot ensures only qualified nodes enter production environments.
        </p>
      </div>

      {/* Key Features */}
      <section>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
          Key Features
        </h3>
        <div className="grid md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="card-enhanced p-8 animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  {feature.icon}
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {feature.title}
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Benefits */}
      <section>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
          Benefits
        </h3>
        <div className="premium-card p-10 animate-slide-up">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center space-x-3">
                <Shield className="w-5 h-5 text-green-600 flex-shrink-0" />
                <span className="text-gray-700 dark:text-gray-300">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
          Ideal Use Cases
        </h3>
        <div className="premium-card p-10 animate-slide-up">
          <div className="space-y-4">
            {useCases.map((useCase, index) => (
              <div key={index} className="flex items-start space-x-3">
                <Users className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
                <span className="text-gray-700 dark:text-gray-300 leading-relaxed">{useCase}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Getting Started */}
      <section>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
          Getting Started
        </h3>
        <div className="premium-card shine-effect p-10 animate-scale-in">
          <p className="text-gray-700 dark:text-gray-300 text-center leading-relaxed max-w-4xl mx-auto">
            ProbationPilot integrates seamlessly with your existing infrastructure management systems, providing automated testing workflows and comprehensive node qualification tracking across multiple regions and device types.
          </p>
          <div className="mt-6 text-center">
            <button className="btn-primary-enhanced glow-effect">
              Get Started Today
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;