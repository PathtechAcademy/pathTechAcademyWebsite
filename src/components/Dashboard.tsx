import React, { useState, useEffect } from 'react';
import { 
  Home, 
  User, 
  Tag, 
  BookOpen, 
  Calendar as CalendarIcon, 
  Wallet, 
  HelpCircle, 
  Share2,
  Bell,
  LogOut,
  Facebook,
  Instagram,
  Linkedin,
  Lock,
  Play,
  Phone,
  ChevronLeft,
  ChevronRight,
  FileText,
  CheckCircle,
  Download
} from 'lucide-react';
import { supabase } from '../supabaseClient';
import { signOut } from '../lib/auth';
import { toast } from 'react-hot-toast';
import type { Course, Video,Payment, Enrollment, LiveSession } from '../types/types';
import { VideoPlayer } from './VideoPlayer';

const SIDEBAR_LINKS = [
  { icon: Home, label: 'Home', id: 'home' },
  { icon: User, label: 'My Profile', id: 'profile' },
  { icon: Tag, label: 'Offers', id: 'offers' },
  { icon: BookOpen, label: 'Subjects', id: 'subjects' },
  { icon: CalendarIcon, label: 'Live', id: 'live' },
  { icon: Wallet, label: 'Wallet', id: 'wallet' },
  { icon: HelpCircle, label: 'Assistance', id: 'assistance' },
  { icon: Share2, label: 'Referral Program', id: 'referral' },
];

export function Dashboard({ user }: { user: { id: string; email: string } }) {
  const [activeSection, setActiveSection] = useState('home');
  const [courses, setCourses] = useState<Course[]>([]);
  const [subscriptions, setSubscriptions] = useState<Enrollment[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [liveSessions, setLiveSessions] = useState<LiveSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [profile, setProfile] = useState({ full_name: '', points: 0 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (profileData) setProfile(profileData);

        // Fetch courses
        const { data: coursesData } = await supabase
          .from('courses')
          .select('*')
          .order('created_at');
        
        if (coursesData) setCourses(coursesData);

        // Fetch user's subscriptions
        const { data: subscriptionsData } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', user.id);
        
        if (subscriptionsData) setSubscriptions(subscriptionsData);

        // Fetch videos for subscribed courses
        if (subscriptionsData?.length) {
          const courseIds = subscriptionsData.map(s => s.course_id);
          const { data: videosData } = await supabase
            .from('videos')
            .select('*')
            .in('course_id', courseIds)
            .order('order');
          
          if (videosData) setVideos(videosData);
        }

        // Fetch upcoming live sessions
        const { data: sessionsData } = await supabase
          .from('live_sessions')
          .select('*')
          .gte('start_time', new Date().toISOString())
          .order('start_time');
        
        if (sessionsData) setLiveSessions(sessionsData);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user.id]);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully');
    } catch (error) {
      toast.error('Error signing out');
    }
  };

  const isSubscribed = (courseId: string) => {
    return subscriptions.some(s => s.course_id === courseId);
  };

  const getWeekDates = () => {
    const dates = [];
    const startOfWeek = new Date(currentWeek);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1);

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'home':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Welcome back, {profile.full_name || user.email}!
              </h2>
              <p className="mt-2 text-gray-600">
                Continue your learning journey with PathTech Academy.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Courses Enrolled</span>
                    <span className="font-semibold">{subscriptions.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Points Balance</span>
                    <span className="font-semibold">{profile.points || 0} Pts</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4">Next Live Session</h3>
                {liveSessions[0] ? (
                  <div>
                    <p className="font-medium">{liveSessions[0].title}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      {new Date(liveSessions[0].scheduled_at).toLocaleString()}
                    </p>
                  </div>
                ) : (
                  <p className="text-gray-600">No upcoming sessions</p>
                )}
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
                <p className="text-gray-600">No recent activity</p>
              </div>
            </div>
          </div>
        );

      case 'subjects':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Baccalauréat Informatique Resources</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map(course => {
                const isUnlocked = isSubscribed(course.id);
                const progress = course.progress || 0;

                return (
                  <div key={course.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="relative">
                      <div className="aspect-video bg-gray-100 flex items-center justify-center">
                        <BookOpen className="h-12 w-12 text-gray-400" />
                      </div>
                      {!isUnlocked && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                          <div className="text-center">
                            <Lock className="h-8 w-8 text-white mx-auto mb-2" />
                            <button 
                              onClick={() => setActiveSection('offers')}
                              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                            >
                              Unlock Full Access
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold">{course.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">{course.description}</p>
                        </div>
                        {isUnlocked && (
                          <div className="flex items-center text-sm text-gray-600">
                            <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                            <span>{progress}% Complete</span>
                          </div>
                        )}
                      </div>

                      {isUnlocked && (
                        <>
                          <div className="h-2 bg-gray-200 rounded-full mb-4">
                            <div 
                              className="h-full bg-green-500 rounded-full"
                              style={{ width: `${progress}%` }}
                            />
                          </div>

                          <div className="space-y-3">
                            {videos
                              .filter(video => video.course_id === course.id)
                              .map(video => (
                                <div key={video.id} className="bg-gray-50 rounded-lg p-4">
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center">
                                      <Play className="h-5 w-5 text-indigo-600 mr-2" />
                                      <span className="font-medium">{video.title}</span>
                                    </div>
                                    {video.completed && (
                                      <CheckCircle className="h-5 w-5 text-green-500" />
                                    )}
                                  </div>
                                  <VideoPlayer url={video.url} title={video.title} />
                                  
                                  <div className="mt-2 flex justify-between items-center text-sm text-gray-600">
                                    <span>{Math.floor(Number(video.duration) / 60)}min</span>
                                    <button className="flex items-center text-indigo-600 hover:text-indigo-700">
                                      <FileText className="h-4 w-4 mr-1" />
                                      Download PDF
                                    </button>
                                  </div>
                                </div>
                              ))}
                          </div>
                        </>
                      )}
                      
                      {!isUnlocked && (
                        <div className="mt-4 space-y-2">
                          <div className="flex items-center text-gray-600">
                            <Play className="h-4 w-4 mr-2" />
                            <span>Access to all video lessons</span>
                          </div>
                          <div className="flex items-center text-gray-600">
                            <Download className="h-4 w-4 mr-2" />
                            <span>Downloadable PDF resources</span>
                          </div>
                          <div className="flex items-center text-gray-600">
                            <CheckCircle className="h-4 w-4 mr-2" />
                            <span>Progress tracking</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 'live':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Live Sessions Calendar</h2>
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    const newDate = new Date(currentWeek);
                    newDate.setDate(newDate.getDate() - 7);
                    setCurrentWeek(newDate);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-md"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={() => {
                    const newDate = new Date(currentWeek);
                    newDate.setDate(newDate.getDate() + 7);
                    setCurrentWeek(newDate);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-md"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="grid grid-cols-7 gap-px bg-gray-200">
                {getWeekDates().map((date, index) => (
                  <div
                    key={index}
                    className="bg-white p-4"
                  >
                    <div className="text-sm font-medium text-gray-900">
                      {date.toLocaleDateString('en-US', { weekday: 'short' })}
                    </div>
                    <div className="mt-1 text-sm text-gray-500">
                      {date.getDate()}
                    </div>
                    <div className="mt-2 space-y-1">
                      {liveSessions
                        .filter(session => {
                          const sessionDate = new Date(session.scheduled_at);
                          return (
                            sessionDate.getDate() === date.getDate() &&
                            sessionDate.getMonth() === date.getMonth() &&
                            sessionDate.getFullYear() === date.getFullYear()
                          );
                        })
                        .map(session => (
                          <div
                            key={session.id}
                            className="px-2 py-1 text-sm bg-indigo-50 text-indigo-700 rounded"
                          >
                            {new Date(session.scheduled_at).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                            <div className="font-medium">{session.title}</div>
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'offers':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Course Packages</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  title: 'Bac Lettres',
                  price: 35,
                  features: [
                    'Complete Informatics Course',
                    'Exam Correction Guide',
                    'Practice Questions',
                    'Digital Study Book'
                  ]
                },
                {
                  title: 'Bac Math',
                  price: 50,
                  features: [
                    'Advanced Informatics Course',
                    'Comprehensive Exam Guide',
                    'Interactive Practice Problems',
                    'Digital Study Materials',
                    'Video Solutions'
                  ],
                  featured: true
                },
                {
                  title: 'Bac Science',
                  price: 50,
                  features: [
                    'Complete Informatics Course',
                    'Exam Preparation Guide',
                    'Practice Exercises',
                    'Digital Resources',
                    'Video Tutorials'
                  ]
                }
              ].map((pkg, index) => (
                <div 
                  key={index}
                  className={`bg-white rounded-lg shadow-sm p-6 ${
                    pkg.featured ? 'ring-2 ring-indigo-600' : ''
                  }`}
                >
                  <h3 className="text-xl font-bold text-center">{pkg.title}</h3>
                  <div className="mt-4 text-center">
                    <span className="text-4xl font-bold">{pkg.price}</span>
                    <span className="text-xl font-semibold ml-1">DT</span>
                  </div>
                  <ul className="mt-6 space-y-4">
                    {pkg.features.map((feature, i) => (
                      <li key={i} className="flex items-center">
                        <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <button className="mt-8 w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">
                    Get Started
                  </button>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {SIDEBAR_LINKS.find(link => link.id === activeSection)?.label}
            </h2>
            <p className="mt-4 text-gray-600">
              This section is coming soon!
            </p>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm fixed w-full z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-indigo-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">PathTech Academy</span>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-gray-500">
                <Bell className="h-6 w-6" />
              </button>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">
                  {profile.full_name || user.email}
                </span>
                <button
                  onClick={handleSignOut}
                  className="p-2 text-gray-400 hover:text-gray-500"
                >
                  <LogOut className="h-6 w-6" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex pt-16">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-sm fixed h-full">
          <nav className="mt-5 px-2">
            <div className="space-y-1">
              {SIDEBAR_LINKS.map(({ icon: Icon, label, id }) => (
                <button
                  key={id}
                  onClick={() => setActiveSection(id)}
                  className={`w-full flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    activeSection === id
                      ? 'bg-indigo-50 text-indigo-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {label}
                </button>
              ))}
            </div>
          </nav>

          <div className="absolute bottom-0 w-full p-4 border-t border-gray-200">
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500">Our Contacts</h4>
                <div className="mt-2 flex items-center text-sm text-gray-600">
                  <Phone className="h-4 w-4 mr-2" />
                  73.832.000
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Our Social Networks</h4>
                <div className="mt-2 flex space-x-2">
                  <Facebook className="h-5 w-5 text-gray-400 hover:text-gray-500 cursor-pointer" />
                  <Instagram className="h-5 w-5 text-gray-400 hover:text-gray-500 cursor-pointer" />
                  <Linkedin className="h-5 w-5 text-gray-400 hover:text-gray-500 cursor-pointer" />
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 ml-64">
          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}