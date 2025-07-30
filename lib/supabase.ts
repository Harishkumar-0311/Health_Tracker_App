import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://whwdwehekwxbhubatecu.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indod2R3ZWhla3d4Ymh1YmF0ZWN1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5NjQyMDksImV4cCI6MjA2NzU0MDIwOX0.oxS0BUzTO4AHVrY6VjKUvTr5ZibPSAPeyvGVbyGLLVY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Upsert user data after login
export async function upsertUserData(user: { id: string; email: string }) {
  const { id, email } = user;
  const { error } = await supabase
    .from('users')
    .upsert([
      { id, email, last_login: new Date().toISOString() }
    ]);
  if (error) {
    console.error('Failed to update user:', error);
  }
}
