import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { unified } from 'unified';
import rehypeParse from 'rehype-parse';
import rehypeStringify from 'rehype-stringify';
import rehypeSanitize from 'rehype-sanitize';

interface BlogPostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

// Gerar metadata dinâmica para SEO
export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const supabase = await createClient();
  const resolvedParams = await params; // Aguardar os parâmetros
  
  const { data: post } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', resolvedParams.slug)
    .eq('published', true)
    .single();

  if (!post) {
    return {
      title: 'Post não encontrado',
      description: 'O post que você está procurando não existe',
      robots: 'noindex, nofollow',
    };
  }

  return {
    title: post.meta_title || post.title,
    description: post.meta_description || post.summary,
    openGraph: {
      title: post.og_title || post.title,
      description: post.og_description || post.summary,
      images: post.og_image ? [{ url: post.og_image }] : undefined,
      type: 'article',
      publishedTime: post.published_at,
      modifiedTime: post.updated_at,
      locale: 'pt_BR',
      siteName: 'ChatGPT Oficial',
    },
    twitter: {
      card: 'summary_large_image',
      title: post.og_title || post.title,
      description: post.og_description || post.summary,
      images: post.og_image ? [post.og_image] : undefined,
    },
    alternates: {
      canonical: post.canonical_url,
    },
  };
}

// Função para processar o conteúdo HTML
async function processContent(content: string) {
  // Remove todas as ocorrências de tags HTML visíveis no texto
  const cleanContent = content
    // Remove o texto de instrução do final
    .replace(/```.*?```/gs, '') // Remove blocos de código markdown
    .replace(/Note: This HTML structure.*?principles\./gs, '') // Remove nota de instrução
    .replace(/If you need to reference.*?endLine: \d+`$/gs, '') // Remove instruções de referência
    .replace(/<\/?[^>]+(>|$)/g, '') // Remove tags HTML que aparecem como texto
    .replace(/&lt;.*?&gt;/g, '') // Remove entidades HTML codificadas
    .replace(/`/g, '') // Remove backticks
    .replace(/\s+/g, ' ') // Normaliza espaços em branco
    .trim();
  
  // Processa o conteúdo limpo
  const result = await unified()
    .use(rehypeParse, { fragment: true })
    .use(rehypeSanitize)
    .use(rehypeStringify)
    .process(cleanContent);

  return result.toString();
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const supabase = await createClient();
  const resolvedParams = await params; // Aguardar os parâmetros

  // Buscar post e autor
  const { data: post } = await supabase
    .from('blog_posts')
    .select(`
      *,
      users (
        email
      ),
      blog_posts_categories (
        blog_categories (
          name,
          slug
        )
      ),
      blog_posts_tags (
        blog_tags (
          name,
          slug
        )
      )
    `)
    .eq('slug', resolvedParams.slug)
    .eq('published', true)
    .single();

  // Retornar 404 se o post não existir ou não estiver publicado
  if (!post) {
    notFound();
  }

  const processedContent = await processContent(post.content);

  return (
    <article className="container mx-auto py-8 px-4 max-w-3xl">
      {/* Cabeçalho do Post */}
      <header className="mb-8">
        {post.og_image && (
          <img
            src={post.og_image}
            alt={post.title}
            className="w-full h-[400px] object-cover rounded-lg mb-6"
          />
        )}

        <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
        
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <time dateTime={post.published_at}>
            {format(new Date(post.published_at || post.created_at), 
              "d 'de' MMMM 'de' yyyy", 
              { locale: ptBR }
            )}
          </time>
          
          {post.users?.email && (
            <span>por {post.users.email}</span>
          )}
        </div>

        {/* Categorias */}
        {post.blog_posts_categories?.length > 0 && (
          <div className="flex gap-2 mt-4">
            {post.blog_posts_categories.map(({ blog_categories }) => (
              <a
                key={blog_categories.slug}
                href={`/blog/categoria/${blog_categories.slug}`}
                className="text-sm text-primary hover:underline"
              >
                {blog_categories.name}
              </a>
            ))}
          </div>
        )}
      </header>

      {/* Conteúdo do Post */}
      <div 
        className="prose prose-lg dark:prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: processedContent }} 
      />

      {/* Tags */}
      {post.blog_posts_tags?.length > 0 && (
        <div className="mt-8 pt-8 border-t">
          <h2 className="text-lg font-semibold mb-4">Tags:</h2>
          <div className="flex flex-wrap gap-2">
            {post.blog_posts_tags.map(({ blog_tags }) => (
              <a
                key={blog_tags.slug}
                href={`/blog/tag/${blog_tags.slug}`}
                className="px-3 py-1 bg-muted rounded-full text-sm hover:bg-muted/80"
              >
                {blog_tags.name}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Schema.org structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BlogPosting',
            headline: post.title,
            description: post.summary,
            image: post.og_image,
            datePublished: post.published_at,
            dateModified: post.updated_at,
            author: {
              '@type': 'Person',
              email: post.users?.email,
            },
            publisher: {
              '@type': 'Organization',
              name: 'ChatGPT',
              logo: {
                '@type': 'ImageObject',
                url: 'https://chatgptoficial.com/logo.png',
              },
            },
          }),
        }}
      />
    </article>
  );
}
