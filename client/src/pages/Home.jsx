import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="min-h-screen bg-background text-text">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">Internship Learning Management System</h1>
          <nav className="space-x-4">
            <Link to="/" className="text-primary hover:text-secondary">Home</Link>
            <Link to="/login" className="text-primary hover:text-secondary">Login</Link>
            <Link to="/register" className="text-primary hover:text-secondary">Register</Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-secondary text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Empower Your Learning Journey</h2>
          <p className="text-xl mb-8">A comprehensive platform for internships, courses, and skill development with role-based access control.</p>
          <div className="space-x-4">
            <Link to="/login" className="bg-white text-primary px-6 py-3 rounded-lg font-semibold hover:bg-gray-100">Login</Link>
            <Link to="/register" className="bg-white text-primary px-6 py-3 rounded-lg font-semibold hover:bg-gray-100">Register</Link>
          </div>
        </div>
      </section>

      {/* Roles Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold text-center mb-12">Our Roles</h3>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Student */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h4 className="text-2xl font-semibold text-primary mb-4">Student</h4>
              <p className="mb-4">Learn step-by-step, track your progress, and earn certificates upon completion.</p>
              <ul className="list-disc list-inside">
                <li>Access assigned courses</li>
                <li>Monitor learning progress</li>
                <li>Receive certificates</li>
              </ul>
            </div>
            {/* Mentor */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h4 className="text-2xl font-semibold text-primary mb-4">Mentor</h4>
              <p className="mb-4">Create engaging courses, assign students, and track their progress.</p>
              <ul className="list-disc list-inside">
                <li>Design and upload courses</li>
                <li>Assign students to courses</li>
                <li>Monitor student performance</li>
              </ul>
            </div>
            {/* Admin */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h4 className="text-2xl font-semibold text-primary mb-4">Admin</h4>
              <p className="mb-4">Manage users, approve mentors, and oversee the platform.</p>
              <ul className="list-disc list-inside">
                <li>Manage user accounts</li>
                <li>Approve mentor applications</li>
                <li>Oversee platform operations</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-text text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2025 Internship LMS</p>
          <p>Built using MERN Stack</p>
        </div>
      </footer>
    </div>
  );
}

export default Home;
