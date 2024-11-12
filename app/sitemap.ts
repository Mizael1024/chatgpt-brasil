import { createClient } from '@/lib/supabase/server';

export default async function sitemap() {
  const supabase = await createClient();
  
  // Buscar todos os posts publicados
  const { data: posts } = await supabase
    .from('blog_posts')
    .select('slug, updated_at')
    .eq('published', true);

  return [
    {
      url: 'https://chatgptoficial.com',
      lastModified: new Date(),
    },
    ...posts?.map((post) => ({
      url: `https://chatgptoficial.com/blog/${post.slug}`,
      lastModified: new Date(post.updated_at),
    })) || [],
  ];
}
