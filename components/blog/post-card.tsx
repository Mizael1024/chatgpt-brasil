import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useIsMobile } from '@/hooks/use-mobile';

interface PostCardProps {
  post: {
    slug: string;
    title: string;
    summary: string;
    published_at: string;
    og_image?: string;
    author?: string;
    categories?: Array<{
      name: string;
      slug: string;
    }>;
  };
}

export function PostCard({ post }: PostCardProps) {
  const isMobile = useIsMobile();

  return (
    <article className="flex flex-col space-y-4 p-4 md:p-6 bg-card rounded-lg border">
      {post.og_image && (
        <div className="relative w-full aspect-video overflow-hidden rounded-md">
          <img 
            src={post.og_image}
            alt={post.title}
            className="object-cover w-full h-full"
            loading="lazy"
            width={1200}
            height={630}
          />
        </div>
      )}
      
      <div className="space-y-2 md:space-y-3">
        <Link 
          href={`/blog/${post.slug}`}
          aria-label={`Ler artigo: ${post.title}`}
        >
          <h2 className="text-xl md:text-2xl font-bold hover:text-primary transition-colors line-clamp-2">
            {post.title}
          </h2>
        </Link>
        
        <p 
          className="text-sm md:text-base text-muted-foreground line-clamp-3"
          aria-label={`Resumo: ${post.summary}`}
        >
          {post.summary}
        </p>
        
        <div 
          className={`flex ${isMobile ? 'flex-col space-y-2' : 'items-center gap-2'} text-sm text-muted-foreground`}
          role="contentinfo"
        >
          <time dateTime={post.published_at}>
            {formatDistanceToNow(new Date(post.published_at), {
              addSuffix: true,
              locale: ptBR
            })}
          </time>
          
          {post.author && (
            <>
              {!isMobile && <span>•</span>}
              <span>{post.author}</span>
            </>
          )}
          
          {post.categories && post.categories.length > 0 && (
            <>
              {!isMobile && <span>•</span>}
              <div className="flex flex-wrap gap-2">
                {post.categories.map((category) => (
                  <Link 
                    key={category.slug}
                    href={`/blog/categoria/${category.slug}`}
                    className="text-xs md:text-sm hover:text-primary transition-colors"
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </article>
  );
}
