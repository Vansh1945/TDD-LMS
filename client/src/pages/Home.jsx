import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Users, ShieldCheck, ArrowRight } from 'lucide-react';

function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-white to-background/50 text-text">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm">
        <div className="container mx-auto px-4 py-3 md:py-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-3 md:mb-0">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                EduMentor LMS
              </h1>
            </div>
            
            <nav className="flex items-center space-x-4 md:space-x-6">
              <Link 
                to="/" 
                className="text-primary font-semibold hover:text-secondary transition-colors"
              >
                Home
              </Link>
              <Link 
                to="/login" 
                className="px-4 py-2 rounded-lg border border-primary text-primary hover:bg-primary hover:text-white transition-all duration-300"
              >
                Login
              </Link>
              <Link 
                to="/register" 
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-primary to-secondary text-white hover:shadow-lg hover:shadow-primary/25 transition-all duration-300"
              >
                Register
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-12 md:py-20">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 -skew-y-3 transform origin-top-right"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 text-primary font-semibold mb-6">
              <ShieldCheck className="w-4 h-4 mr-2" />
              Student Registration Open
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Transform Your <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Learning</span> Experience
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
              EduMentor connects passionate students with expert mentors through structured 
              internship programs and interactive courses. Start your journey today!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/register" 
                className="group inline-flex items-center justify-center px-8 py-4 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-semibold text-lg hover:shadow-xl hover:shadow-primary/30 transition-all duration-300"
              >
                Start Learning Free
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                to="/login" 
                className="inline-flex items-center justify-center px-8 py-4 rounded-xl border-2 border-primary text-primary font-semibold text-lg hover:bg-primary hover:text-white transition-all duration-300"
              >
                Existing Student
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Roles Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-primary">
              Platform Access Levels
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              EduMentor offers three distinct roles, each with specific responsibilities and privileges
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Student Card */}
            <div className="group relative bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-success to-emerald-400"></div>
              <div className="p-8">
                <div className="flex items-center mb-6">
                  <div className="w-14 h-14 rounded-xl bg-success/10 flex items-center justify-center mr-4">
                    <Users className="w-7 h-7 text-success" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800">Student</h3>
                    <p className="text-success font-semibold">Self Registration Available</p>
                  </div>
                </div>
                
                <p className="text-gray-600 mb-8 leading-relaxed">
                  Access curated courses, track your progress, complete assignments, and earn verifiable certificates upon successful completion.
                </p>
                
                <div className="space-y-4 mb-10">
                  <div className="flex items-center">
                    <div className="w-6 h-6 rounded-full bg-success/20 flex items-center justify-center mr-3">
                      <span className="text-success text-sm">✓</span>
                    </div>
                    <span>Access to assigned courses</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-6 h-6 rounded-full bg-success/20 flex items-center justify-center mr-3">
                      <span className="text-success text-sm">✓</span>
                    </div>
                    <span>Progress tracking dashboard</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-6 h-6 rounded-full bg-success/20 flex items-center justify-center mr-3">
                      <span className="text-success text-sm">✓</span>
                    </div>
                    <span>Certificate generation</span>
                  </div>
                </div>
                
                <Link 
                  to="/register" 
                  className="block w-full py-4 rounded-xl bg-gradient-to-r from-success to-emerald-500 text-white text-center font-semibold hover:shadow-lg hover:shadow-success/30 transition-all duration-300 group-hover:scale-[1.02]"
                >
                  Register as Student
                </Link>
              </div>
            </div>

            {/* Mentor Card */}
            <div className="group relative bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-warning to-amber-400"></div>
              <div className="p-8">
                <div className="flex items-center mb-6">
                  <div className="w-14 h-14 rounded-xl bg-warning/10 flex items-center justify-center mr-4">
                    <BookOpen className="w-7 h-7 text-warning" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800">Mentor</h3>
                    <p className="text-warning font-semibold">Admin Approval Required</p>
                  </div>
                </div>
                
                <p className="text-gray-600 mb-8 leading-relaxed">
                  Create comprehensive courses, guide students through their learning journey, and monitor their progress with detailed analytics.
                </p>
                
                <div className="space-y-4 mb-10">
                  <div className="flex items-center">
                    <div className="w-6 h-6 rounded-full bg-warning/20 flex items-center justify-center mr-3">
                      <span className="text-warning text-sm">✓</span>
                    </div>
                    <span>Course creation tools</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-6 h-6 rounded-full bg-warning/20 flex items-center justify-center mr-3">
                      <span className="text-warning text-sm">✓</span>
                    </div>
                    <span>Student progress monitoring</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-6 h-6 rounded-full bg-warning/20 flex items-center justify-center mr-3">
                      <span className="text-warning text-sm">✓</span>
                    </div>
                    <span>Assignment evaluation</span>
                  </div>
                </div>
                
                <div className="py-4 px-6 rounded-xl bg-gray-50 text-center border border-gray-200">
                  <p className="text-gray-600 font-medium">
                    Contact administrator for mentor application
                  </p>
                </div>
              </div>
            </div>

            {/* Admin Card */}
            <div className="group relative bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-danger to-red-400"></div>
              <div className="p-8">
                <div className="flex items-center mb-6">
                  <div className="w-14 h-14 rounded-xl bg-danger/10 flex items-center justify-center mr-4">
                    <ShieldCheck className="w-7 h-7 text-danger" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800">Administrator</h3>
                    <p className="text-danger font-semibold">Restricted Access</p>
                  </div>
                </div>
                
                <p className="text-gray-600 mb-8 leading-relaxed">
                  Manage platform operations, approve mentor applications, oversee user management, and ensure system integrity.
                </p>
                
                <div className="space-y-4 mb-10">
                  <div className="flex items-center">
                    <div className="w-6 h-6 rounded-full bg-danger/20 flex items-center justify-center mr-3">
                      <span className="text-danger text-sm">✓</span>
                    </div>
                    <span>User account management</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-6 h-6 rounded-full bg-danger/20 flex items-center justify-center mr-3">
                      <span className="text-danger text-sm">✓</span>
                    </div>
                    <span>Mentor application review</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-6 h-6 rounded-full bg-danger/20 flex items-center justify-center mr-3">
                      <span className="text-danger text-sm">✓</span>
                    </div>
                    <span>Platform oversight</span>
                  </div>
                </div>
                
                <div className="py-4 px-6 rounded-xl bg-gray-50 text-center border border-gray-200">
                  <p className="text-gray-600 font-medium">
                    System administrator access only
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary/5 to-secondary/5">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8 md:p-12">
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-primary">
                Ready to Start Your Learning Journey?
              </h2>
              <p className="text-gray-600 mb-10 text-lg">
                Join thousands of students who have transformed their skills through EduMentor's structured learning programs.
                Registration takes less than 2 minutes!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  to="/register" 
                  className="px-10 py-4 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-bold text-lg hover:shadow-2xl hover:shadow-primary/30 transition-all duration-300 transform hover:-translate-y-1"
                >
                  Create Student Account
                </Link>
                <Link 
                  to="/login" 
                  className="px-10 py-4 rounded-xl border-2 border-primary text-primary font-bold text-lg hover:bg-primary hover:text-white transition-all duration-300"
                >
                  Already Have Account?
                </Link>
              </div>
              <p className="mt-6 text-gray-500 text-sm">
                * Only student registration is available for self-signup
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-text text-white pt-12 pb-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8">
            <div className="mb-6 md:mb-0">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white">EduMentor LMS</h3>
              </div>
              <p className="text-gray-300 max-w-md">
                Empowering the next generation of learners with structured mentorship and practical skills.
              </p>
            </div>
            <div className="flex space-x-6">
              <Link to="/" className="text-gray-300 hover:text-white transition-colors">Home</Link>
              <Link to="/login" className="text-gray-300 hover:text-white transition-colors">Login</Link>
              <Link to="/register" className="text-gray-300 hover:text-white transition-colors">Register</Link>
            </div>
          </div>
          
          <div className="pt-8 border-t border-gray-700 text-center">
            <p className="text-gray-400">
              © 2025 EduMentor Learning Management System. All rights reserved.
            </p>
            <p className="text-gray-500 text-sm mt-2">
              Built with MERN Stack • Designed for modern education
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Home;