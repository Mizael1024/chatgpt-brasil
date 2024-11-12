import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { BlogPosts } from '@/components/blog/blog-posts';

export const metadata: Metadata = {
  title: 'Blog | ChatGPT',
  description: 'Artigos e tutoriais sobre IA, tecnologia e programação',
  openGraph: {
    title: 'Blog | ChatGPT',
    description: 'Artigos e tutoriais sobre IA, tecnologia e programação',
    type: 'website',
  },
};

export default async function BlogPage() {
  const supabase = await createClient();
  
  const { data: posts } = await supabase
    .from('blog_posts')
    .select(`
      id,
      title,
      slug,
      summary,
      published_at,
      created_at,
      og_image,
      published,
      user_id,
      users (
        email
      ),
      blog_posts_categories (
        blog_categories (
          name,
          slug
        )
      )
    `)
    .eq('published', true)
    .order('published_at', { ascending: false });

  return (
    <div className="w-full max-w-[1024px] mx-auto min-h-[calc(100vh-4rem)]">
      <BlogPosts posts={posts || []} />
    </div>
  );
}
