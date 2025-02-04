// types.ts - Define types for all Supabase tables

// User table
export interface Users {
    id: string;
    email: string;
    created_at: string;
    full_name: string;
    role : string | undefined;
    
  }
  
  // Courses table
  export interface Course {
    id: string;
    title: string;
    description: string;
    price: number;
    category ?: string;
    progress ?: string;
    created_at: string;
  }
  
  // Videos table (each course has multiple videos)
  export interface Video {
    id: string;
    course_id: string;
    title: string;
    url: string;
    completed ?: string;
    position ?: string;
    duration ?: string;
    created_at: string;
  }
  
  export interface Payment {
  id: string;
  amount: number;
  status: string;
  receipt_url: string;
  created_at: string;
  users: { id: string; email: string };  // Now matches query
  courses: { id: string; title: string; price: number };  // Now matches query
}

  // Live Sessions table
  export interface LiveSession {
    id: string;
    title: string;
    description: string;
    scheduled_at: string;
    url: string;
  }
  
  // Enrollment table (tracks user-course access)
  export interface Enrollment {
    id: string;
    user_id: string;
    course_id: string;
    status: 'pending' | 'approved';
    created_at: string;
  }
  