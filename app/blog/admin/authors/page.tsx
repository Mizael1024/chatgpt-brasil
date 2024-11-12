import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { PopupAddAuthor } from '@/components/blog/popup-add-author';

interface Author {
  id: string;
  name: string;
  slug: string;
  bio: string | null;
  website_url: string | null;
  twitter_username: string | null;
  github_username: string | null;
  linkedin_url: string | null;
  created_at: string;
  users: {
    email: string;
  };
}

export default async function AuthorsPage() {
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    redirect('/login');
  }

  const { data: authors, error } = await supabase
    .from('blog_authors')
    .select(`
      id,
      name,
      slug,
      bio,
      website_url,
      twitter_username,
      github_username,
      linkedin_url,
      created_at,
      users (
        email
      )
    `)
    .order('name');

  if (error) {
    console.error('Erro ao buscar autores:', error);
    return <div>Erro ao carregar autores</div>;
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Autores</h1>
        <div className="flex gap-4">
          <Link href="/blog/admin">
            <Button variant="outline">Voltar</Button>
          </Link>
          <PopupAddAuthor />
        </div>
      </div>

      <div className="grid gap-6">
        {authors?.map((author: Author) => (
          <div
            key={author.id}
            className="flex items-center justify-between p-6 bg-card rounded-lg border"
          >
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">{author.name}</h2>
              <div className="text-sm text-muted-foreground">
                {author.users?.email}
              </div>
              {author.bio && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {author.bio}
                </p>
              )}
              <div className="flex gap-4 text-sm text-muted-foreground">
                {author.website_url && (
                  <a href={author.website_url} target="_blank" rel="noopener noreferrer">
                    Website
                  </a>
                )}
                {author.twitter_username && (
                  <a href={`https://twitter.com/${author.twitter_username}`} target="_blank" rel="noopener noreferrer">
                    Twitter
                  </a>
                )}
                {author.github_username && (
                  <a href={`https://github.com/${author.github_username}`} target="_blank" rel="noopener noreferrer">
                    GitHub
                  </a>
                )}
                {author.linkedin_url && (
                  <a href={author.linkedin_url} target="_blank" rel="noopener noreferrer">
                    LinkedIn
                  </a>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Link href={`/blog/admin/authors/edit/${author.slug}`}>
                <Button variant="outline" size="sm">
                  Editar
                </Button>
              </Link>
            </div>
          </div>
        ))}
      </div>

      {!authors?.length && (
        <div className="text-center py-12 text-muted-foreground">
          Nenhum autor encontrado. Comece adicionando um novo autor!
        </div>
      )}
    </div>
  );
}
