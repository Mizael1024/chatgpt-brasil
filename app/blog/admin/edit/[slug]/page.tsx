import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { PostForm } from '@/components/blog/post-form';
import { Metadata } from 'next';

interface EditPostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export const metadata: Metadata = {
  title: 'Editar Post | Admin Blog',
  description: 'Editar post existente no blog',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function EditPostPage({ params }: EditPostPageProps) {
  const supabase = await createClient();
  const resolvedParams = await params; // Aguardar os parâmetros
  
  // Verificar autenticação usando getUser em vez de getSession
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/login');
  }

  // Buscar post para edição
  const { data: post, error: postError } = await supabase
    .from('blog_posts')
    .select(`
      *,
      users (
        email
      )
    `)
    .eq('slug', resolvedParams.slug)
    .single();

  if (postError || !post) {
    redirect('/blog/admin');
  }

  // Verificar se o usuário é o autor do post
  if (post.user_id !== user.id) {
    redirect('/blog/admin');
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Editar Post</h1>
        <p className="text-muted-foreground mt-2">
          Edite os campos abaixo para atualizar o post
        </p>
      </div>

      <div className="bg-card p-6 rounded-lg border">
        <PostForm 
          initialData={post} 
          isEditing={true} 
        />
      </div>
    </div>
  );
}
