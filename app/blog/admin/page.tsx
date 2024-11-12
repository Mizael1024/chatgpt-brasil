import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { TrashIcon, PencilIcon } from 'lucide-react';

export default async function AdminPage() {
  const supabase = await createClient();
  
  // Verificar autenticação usando getUser
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/login');
  }

  // Buscar posts com informações adicionais
  const { data: posts } = await supabase
    .from('blog_posts')
    .select(`
      id,
      title,
      slug,
      published,
      created_at,
      users (
        email
      )
    `)
    .order('created_at', { ascending: false });

  // Separar posts publicados e rascunhos
  const publishedPosts = posts?.filter(post => post.published) || [];
  const draftPosts = posts?.filter(post => !post.published) || [];

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Gerenciar Posts</h1>
        <Link href="/blog/admin/new">
          <Button>Novo Post</Button>
        </Link>
      </div>
      
      {/* Seção de Posts Publicados */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Posts Publicados</h2>
        <div className="space-y-4">
          {publishedPosts.map((post) => (
            <div
              key={post.id}
              className="flex items-center justify-between p-6 bg-card rounded-lg border"
            >
              <div className="space-y-2">
                <h2 className="text-xl font-semibold">{post.title}</h2>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span className={`px-2 py-1 rounded-full ${
                    post.published 
                      ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' 
                      : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                  }`}>
                    {post.published ? 'Publicado' : 'Rascunho'}
                  </span>
                  <span>•</span>
                  <time dateTime={post.created_at}>
                    {format(new Date(post.created_at), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </time>
                  {post.users?.email && (
                    <>
                      <span>•</span>
                      <span>{post.users.email}</span>
                    </>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Link 
                  href={post.slug ? `/blog/admin/edit/${post.slug}` : '#'}
                  className={!post.slug ? 'pointer-events-none opacity-50' : ''}
                >
                  <Button variant="outline" size="sm" disabled={!post.slug}>
                    <PencilIcon className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                </Link>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      <TrashIcon className="h-4 w-4 mr-2" />
                      Excluir
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                      <AlertDialogDescription>
                        Tem certeza que deseja excluir o post "{post.title}"? 
                        Esta ação não pode ser desfeita.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <form action={async () => {
                        'use server';
                        const supabase = await createClient();
                        await supabase
                          .from('blog_posts')
                          .delete()
                          .eq('id', post.id);
                      }}>
                        <AlertDialogAction type="submit">
                          Confirmar Exclusão
                        </AlertDialogAction>
                      </form>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Seção de Rascunhos */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Rascunhos</h2>
        <div className="space-y-4">
          {draftPosts.map((post) => (
            <div
              key={post.id}
              className="flex items-center justify-between p-6 bg-card rounded-lg border"
            >
              <div className="space-y-2">
                <h2 className="text-xl font-semibold">{post.title}</h2>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span className={`px-2 py-1 rounded-full ${
                    post.published 
                      ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' 
                      : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                  }`}>
                    {post.published ? 'Publicado' : 'Rascunho'}
                  </span>
                  <span>•</span>
                  <time dateTime={post.created_at}>
                    {format(new Date(post.created_at), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </time>
                  {post.users?.email && (
                    <>
                      <span>•</span>
                      <span>{post.users.email}</span>
                    </>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Link 
                  href={post.slug ? `/blog/admin/edit/${post.slug}` : '#'}
                  className={!post.slug ? 'pointer-events-none opacity-50' : ''}
                >
                  <Button variant="outline" size="sm" disabled={!post.slug}>
                    <PencilIcon className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                </Link>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      <TrashIcon className="h-4 w-4 mr-2" />
                      Excluir
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                      <AlertDialogDescription>
                        Tem certeza que deseja excluir o post "{post.title}"? 
                        Esta ação não pode ser desfeita.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <form action={async () => {
                        'use server';
                        const supabase = await createClient();
                        await supabase
                          .from('blog_posts')
                          .delete()
                          .eq('id', post.id);
                      }}>
                        <AlertDialogAction type="submit">
                          Confirmar Exclusão
                        </AlertDialogAction>
                      </form>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
        </div>
      </div>

      {!posts?.length && (
        <div className="text-center py-12 text-muted-foreground">
          Nenhum post encontrado. Comece criando um novo post!
        </div>
      )}
    </div>
  );
}
