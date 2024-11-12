import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { PostForm } from '@/components/blog/post-form';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Novo Post | Admin Blog',
  description: 'Criar novo post no blog',
  // Impedir indexação da área administrativa
  robots: {
    index: false,
    follow: false,
  },
};

export default async function NewPostPage() {
  const supabase = await createClient();
  
  // Verificar autenticação
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login');
  }

  // Verificar se o usuário tem permissão de admin
  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('id', session.user.id)
    .single();

  if (!user) {
    redirect('/');
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Criar Novo Post</h1>
        <p className="text-muted-foreground mt-2">
          Preencha os campos abaixo para criar um novo post no blog
        </p>
      </div>
      <div className="bg-card p-6 rounded-lg border">
        <PostForm />
      </div>
    </div>
  );
}
