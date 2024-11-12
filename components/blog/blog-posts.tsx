'use client';

import { useIsMobile } from '@/hooks/use-mobile';
import { PostCard } from './post-card';

interface BlogPostsProps {
  posts: Array<{
    id: string;
    slug: string;
    title: string;
    summary: string;
    published_at: string;
    created_at: string;
    og_image?: string;
    users?: {
      email: string;
    };
    blog_posts_categories?: Array<{
      blog_categories: {
        name: string;
        slug: string;
      };
    }>;
  }>;
}

export function BlogPosts({ posts }: BlogPostsProps) {
  const isMobile = useIsMobile();

  return (
    <div className="py-4 md:py-8">
      <div className={`mx-auto ${isMobile ? 'w-full' : 'max-w-3xl'}`}>
        <header className="mb-6 md:mb-12 text-center">
          <h1 className="text-2xl md:text-4xl font-bold mb-2 md:mb-4">Blog</h1>
          <p className="text-base md:text-xl text-muted-foreground">
            Artigos e tutoriais sobre IA, tecnologia e programação
          </p>
        </header>

        <div className="grid gap-4 md:gap-8">
          {posts.map((post) => (
            <div key={post.id} className={isMobile ? 'w-full' : 'max-w-3xl mx-auto'}>
              <PostCard 
                post={{
                  slug: post.slug,
                  title: post.title,
                  summary: post.summary,
                  published_at: post.published_at || post.created_at,
                  og_image: post.og_image,
                  author: post.users?.email,
                  categories: post.blog_posts_categories?.map(
                    (category) => category.blog_categories
                  ) || []
                }} 
              />
            </div>
          ))}

          {!posts.length && (
            <div className="text-center py-8 md:py-12 text-muted-foreground">
              Nenhum post publicado ainda.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
