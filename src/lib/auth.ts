import { supabase } from '../supabaseClient';





export type SignUpData = {
  email: string;
  password: string;
  fullName: string;
  role?: 'student'; // Default role is student
};

export type SignInData = {
  email: string;
  password: string;
};

export const signUp = async ({ email, password, fullName, role = 'student' }: SignUpData) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role , // Store role in user metadata
      },
    },
  });
  // Ensure we have a valid user ID before querying the `users` table
  const userId = data.user?.id;
  if (!userId) {
    throw new Error('User ID not found after sign-up');
  }


  const { data: userData, error: fetchError } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single(); // Ensure we get only one row

  if (fetchError) {
    console.error('Error fetching user data:', fetchError.message);
    throw new Error(fetchError.message);
  }

  return { data, userData }; // Return both auth data and user table data
 
  
  
  
  if (error) {
    console.error('Sign-up error:', error.message);
    throw new Error(error.message);
  }

  return data;
};



export const signIn = async ({ email, password }: SignInData) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error('Sign-in error:', error.message);
    throw new Error(error.message);
  }

  // Fetch user data from public.users table
  const { data: userData, error: userError } = await supabase
    .from('users') // Assuming your table is named 'users'
    .select('*')
    .eq('id', data.user?.id) // Filter by the user's ID
    .single(); // Ensure we fetch only one row

  if (userError) {
    console.error('Error fetching user data:', userError.message);
    throw new Error(userError.message);
  }

  return { user: data.user, userData };
};





export const fetchUserData = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('users') // Replace with the correct table name
      .select('*') // Select all fields or specify which fields you want
      .eq('id', userId) // Filter by userId
      .single(); // Retrieve only one row

    if (error) {
      throw new Error(error.message); // Handle any error
    }

    return data; // Return the fetched data
  } catch (error) {
    console.error('Error fetching user data:', error);
    throw new Error('Error fetching user data');
  }
};
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error('Sign-out error:', error.message);
    throw new Error(error.message);
  }
};
