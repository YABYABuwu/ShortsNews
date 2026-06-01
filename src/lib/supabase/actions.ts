import { supabase } from './client';

export interface ArticleInput {
  title: string;
  summary: string;
  original_url?: string;
  source?: string;
  category_id?: string;
  image_url?: string;
}

// ==========================================
// Authentication Functions
// ==========================================

/**
 * Sign in using Email and Password
 */
export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
}

/**
 * Sign up using Email and Password
 */
export async function signUpWithEmail(email: string, password: string, fullName: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });
  if (error) throw error;
  return data;
}

/**
 * Sign in using Google OAuth
 */
export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : '',
    },
  });
  if (error) throw error;
  return data;
}

/**
 * Sign out of current session
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/**
 * Get current session state
 */
export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) return null;
  return user;
}

// ==========================================
// News Articles Database Functions
// ==========================================

/**
 * Fetch list of articles with search and category filters
 */
export async function fetchArticles(searchQuery?: string, categoryId?: string) {
  let query = supabase
    .from('articles')
    .select(`
      id,
      title,
      summary,
      original_url,
      source,
      image_url,
      created_at,
      category_id,
      categories:category_id (id, name, slug)
    `)
    .order('created_at', { ascending: false });

  if (categoryId) {
    query = query.eq('category_id', categoryId);
  }

  if (searchQuery) {
    query = query.or(`title.ilike.%${searchQuery}%,summary.ilike.%${searchQuery}%`);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

/**
 * Fetch all categories for filter selector
 */
export async function fetchCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('id, name, slug')
    .order('name');
  if (error) throw error;
  return data || [];
}

/**
 * Insert a manual news article post
 */
export async function addArticle(article: ArticleInput) {
  // Get current user session to assign author_id
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) throw new Error('Unauthorized');

  const { data, error } = await supabase
    .from('articles')
    .insert([
      {
        ...article,
        author_id: user.id,
      },
    ])
    .select();

  if (error) throw error;
  return data;
}
