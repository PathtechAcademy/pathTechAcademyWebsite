import React, { useState, useEffect } from 'react';
import { BookOpen, Users, Calendar, ArrowRight, Mail, Phone, Facebook, Twitter, Instagram, Youtube, X, Check } from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';
import { signIn, signUp, signOut, fetchUserData} from './lib/auth';
import { supabase } from './supabaseClient';
import { Dashboard } from './components/Dashboard';
import { AdminDashboard } from './components/AdminDashboard';


function App() {
  const [showSignIn, setShowSignIn] = useState(false);
const [showSignUp, setShowSignUp] = useState(false);
const [isSignIn, setIsSignIn] = useState(true);
const [isLoading, setIsLoading] = useState(false);
const [signRole, setSignRole] = useState("")
const [user, setUser] = useState<{ id: string; email: string; role: string | undefined } | null>(null);

const toggleAuth = () => {
  setIsSignIn((prev) => !prev);
  setShowSignIn((prev) => !prev);
  setShowSignUp((prev) => !prev);
};

useEffect(() => {
  // Check active session
  supabase.auth.getSession().then(({ data: { session } }) => {
    if (session?.user) {
      setUser({
        id: session.user.id,
        email: session.user.email!,
        role: session.user.role || 'defaultRole', // Default role if undefined
      });
    }
  });

  // Listen for auth changes
  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    if (session?.user) {
      setUser({
        id: session.user.id,
        email: session.user.email!,
        role: session.user.role || 'defaultRole',
      });
    } else {
      setUser(null);
    }
  });

  return () => subscription.unsubscribe();
}, []);

const handleSignOut = async () => {
  try {
    await supabase.auth.signOut();
    setUser(null);
    toast.success('Signed out successfully');
  } catch (error) {
    toast.error(error instanceof Error ? error.message : 'Error signing out');
  }
};

const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  setIsLoading(true);

  const formData = new FormData(e.currentTarget);
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    toast.error('Please enter both email and password');
    setIsLoading(false);
    return;
  }



  try {
    if (isSignIn) {
      const {user, userData} = await signIn({ email, password });
      
      if (user) {
        console.log(user)
      }
      if (userData) {
        console.log(userData)
      }
      setSignRole(userData.role)

      
      toast.success('Successfully signed in!');
      setShowSignIn(false);
    } else {
      const fullName = formData.get('fullName') as string;
      await signUp({ email, password, fullName, });
      toast.success('Successfully signed up! Please check your email for verification.');
      setShowSignUp(false);
    }
  } catch (error) {
    toast.error(error instanceof Error ? error.message : 'An error occurred');
  } finally {
    setIsLoading(false);
  }
};
  if (signRole == "admin") {
    return (
      <>
        <nav className="bg-white shadow-sm fixed w-full z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <BookOpen className="h-8 w-8 text-indigo-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">PathTech Academy</span>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-gray-600">{user?.email}</span>
                <button
                  onClick={handleSignOut}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </nav>
        <div className="pt-16">
          {user && <AdminDashboard user={user} />}
        </div>
      </>
    );
  }
  // If user is logged in, show appropriate dashboard
  if (user) {
    return (
      <>
        {/* <nav className="bg-white shadow-sm fixed w-full z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <BookOpen className="h-8 w-8 text-indigo-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">PathTech Academy</span>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-gray-600">{user.email}</span>
                <button
                  onClick={handleSignOut}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </nav> */}
        <div>
          {user.role === "admin" ? <AdminDashboard user={user} /> : <Dashboard user={user} />}
        </div>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Toaster position="top-right" />
      
      {/* Navigation */}
      <nav className="bg-white shadow-sm fixed w-full z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-indigo-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">PathTech Academy</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#courses" className="text-gray-700 hover:text-indigo-600">Courses</a>
              <a href="#about" className="text-gray-700 hover:text-indigo-600">About</a>
              <a href="#testimonials" className="text-gray-700 hover:text-indigo-600">Testimonials</a>
              <a href="#contact" className="text-gray-700 hover:text-indigo-600">Contact</a>
              <button 
                onClick={() => setShowSignIn(true)}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Authentication Modal */}
      {(showSignIn || showSignUp) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">{isSignIn ? 'Sign In' : 'Sign Up'}</h2>
              <button 
                onClick={() => {setShowSignIn(false); setShowSignUp(false)}} 
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isSignIn && (
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
              )}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  required
                  minLength={6}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Loading...' : isSignIn ? 'Sign In' : 'Sign Up'}
              </button>
            </form>
            <p className="mt-4 text-center text-sm text-gray-600">
              {isSignIn ? "Don't have an account? " : "Already have an account? "}
              <button
                onClick={toggleAuth}
                className="text-indigo-600 hover:text-indigo-500"
              >
                {isSignIn ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <div className="relative bg-white pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
                Transform Your Future with Tech Education
              </h1>
              <p className="mt-4 text-xl text-gray-600">
                Access world-class courses, live sessions, and resources to build your tech career.
              </p>
              <div className="mt-8 flex space-x-4">
                <button className="bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 flex items-center">
                  Explore Courses
                  <ArrowRight className="ml-2 h-5 w-5" />
                </button>
                <button 
                  onClick={() => setShowSignUp(true)}
                  className="border-2 border-indigo-600 text-indigo-600 px-6 py-3 rounded-md hover:bg-indigo-50"
                >
                  Sign Up Free
                </button>
              </div>
            </div>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1471&q=80"
                alt="Students learning"
                className="rounded-lg shadow-xl"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">Baccalaureate Exam Preparation Courses</h2>
            <p className="mt-4 text-xl text-gray-600">Choose the package that best fits your needs</p>
          </div>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Bac Lettres Package */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="px-6 py-8">
                <h3 className="text-2xl font-bold text-center text-gray-900">Bac Lettres</h3>
                <div className="mt-4 flex justify-center">
                  <span className="text-5xl font-bold">35</span>
                  <span className="text-2xl font-semibold self-end mb-1 ml-1">DT</span>
                </div>
                <ul className="mt-6 space-y-4">
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    <span>Complete Informatics Course</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    <span>Exam Correction Guide</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    <span>Practice Questions</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    <span>Digital Study Book</span>
                  </li>
                </ul>
                <button
                  onClick={() => setShowSignUp(true)}
                  className="mt-8 w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                >
                  Get Started
                </button>
              </div>
            </div>

            {/* Bac Math Package */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden border-2 border-indigo-600">
              <div className="px-6 py-8">
                <h3 className="text-2xl font-bold text-center text-gray-900">Bac Math</h3>
                <div className="mt-4 flex justify-center">
                  <span className="text-5xl font-bold">50</span>
                  <span className="text-2xl font-semibold self-end mb-1 ml-1">DT</span>
                </div>
                <ul className="mt-6 space-y-4">
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    <span>Advanced Informatics Course</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    <span>Comprehensive Exam Guide</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    <span>Interactive Practice Problems</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    <span>Digital Study Materials</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    <span>Video Solutions</span>
                  </li>
                </ul>
                <button
                  onClick={() => setShowSignUp(true)}
                  className="mt-8 w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                >
                  Get Started
                </button>
              </div>
            </div>

            {/* Bac Science Package */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="px-6 py-8">
                <h3 className="text-2xl font-bold text-center text-gray-900">Bac Science</h3>
                <div className="mt-4 flex justify-center">
                  <span className="text-5xl font-bold">50</span>
                  <span className="text-2xl font-semibold self-end mb-1 ml-1">DT</span>
                </div>
                <ul className="mt-6 space-y-4">
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    <span>Complete Informatics Course</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    <span>Exam Preparation Guide</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    <span>Practice Exercises</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    <span>Digital Resources</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    <span>Video Tutorials</span>
                  </li>
                </ul>
                <button
                  onClick={() => setShowSignUp(true)}
                  className="mt-8 w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                >
                  Get Started
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">Why Choose PathTech Academy?</h2>
          </div>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="bg-indigo-100 w-12 h-12 rounded-lg flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="mt-4 text-xl font-semibold">Expert-Led Courses</h3>
              <p className="mt-2 text-gray-600">Learn from industry professionals with real-world experience.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="bg-indigo-100 w-12 h-12 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="mt-4 text-xl font-semibold">Community Support</h3>
              <p className="mt-2 text-gray-600">Join a community of learners and get support when you need it.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="bg-indigo-100 w-12 h-12 rounded-lg flex items-center justify-center">
                <Calendar className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="mt-4 text-xl font-semibold">Live Sessions</h3>
              <p className="mt-2 text-gray-600">Interactive live sessions with instructors and peers.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">What Our Students Say</h2>
          </div>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center">
                  <img
                    src={`https://i.pravatar.cc/150?img=${i}`}
                    alt={`Student ${i}`}
                    className="h-12 w-12 rounded-full"
                  />
                  <div className="ml-4">
                    <h4 className="text-lg font-semibold">Student Name</h4>
                    <p className="text-gray-600">Web Development</p>
                  </div>
                </div>
                <p className="mt-4 text-gray-600">
                  "PathTech Academy helped me transition into tech. The courses are practical and the community is supportive."
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Get in Touch</h2>
              <p className="mt-4 text-gray-600">
                Have questions? We're here to help. Send us a message and we'll respond as soon as possible.
              </p>
              <div className="mt-8 space-y-4">
                <div className="flex items-center">
                  <Mail className="h-6 w-6 text-indigo-600" />
                  <span className="ml-4 text-gray-600">contact@pathtech.academy</span>
                </div>
                <div className="flex items-center">
                  <Phone className="h-6 w-6 text-indigo-600" />
                  <span className="ml-4 text-gray-600">+1 (555) 123-4567</span>
                </div>
              </div>
              <div className="mt-8 flex space-x-4">
                <Facebook className="h-6 w-6 text-gray-600 hover:text-indigo-600 cursor-pointer" />
                <Twitter className="h-6 w-6 text-gray-600 hover:text-indigo-600 cursor-pointer" />
                <Instagram className="h-6 w-6 text-gray-600 hover:text-indigo-600 cursor-pointer" />
                <Youtube className="h-6 w-6 text-gray-600 hover:text-indigo-600 cursor-pointer" />
              </div>
            </div>
            <form className="bg-white p-6 rounded-lg shadow-md">
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                    Message
                  </label>
                  <textarea
                    id="message"
                    rows={4}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                >
                  Send Message
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center">
                <BookOpen className="h-8 w-8 text-indigo-400" />
                <span className="ml-2 text-xl font-bold">PathTech Academy</span>
              </div>
              <p className="mt-4 text-gray-400">
                Empowering the next generation of tech professionals through quality education.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold">Quick Links</h3>
              <ul className="mt-4 space-y-2">
                <li><a href="#courses" className="text-gray-400 hover:text-white">Courses</a></li>
                <li><a href="#about" className="text-gray-400 hover:text-white">About Us</a></li>
                <li><a href="#testimonials" className="text-gray-400 hover:text-white">Testimonials</a></li>
                <li><a href="#contact" className="text-gray-400 hover:text-white">Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold">Legal</h3>
              <ul className="mt-4 space-y-2">
                <li><a href="#privacy" className="text-gray-400 hover:text-white">Privacy Policy</a></li>
                <li><a href="#terms" className="text-gray-400 hover:text-white">Terms of Service</a></li>
                <li><a href="#cookies" className="text-gray-400 hover:text-white">Cookie Policy</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold">Newsletter</h3>
              <p className="mt-4 text-gray-400">Subscribe to get updates on new courses and features.</p>
              <form className="mt-4">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full px-3 py-2 bg-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button className="mt-2 w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">
                  Subscribe
                </button>
              </form>
            </div>
          </div>
          <div className="mt-12 border-t border-gray-800 pt-8 text-center">
            <p className="text-gray-400">© 2024 PathTech Academy. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;