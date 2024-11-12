'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { RichTextEditor } from './rich-text-editor';
import { Loader2 } from 'lucide-react';

interface PostFormProps {
  initialData?: any;
  isEditing?: boolean;
}

export function PostForm({ initialData, isEditing }: PostFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isPublished, setIsPublished] = useState(initialData?.published || false);
  const [showEditor, setShowEditor] = useState(false);

  // Função para gerar artigo usando a OpenAI
  const generateArticle = async () => {
    if (!keyword.trim()) {
      toast.error('Por favor, insira uma palavra-chave ou título');
      return;
    }

    setIsGenerating(true);

    try {
      const response = await fetch('/api/ai/generate-article', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          keyword,
        }),
      });

      if (!response.ok) {
        throw new Error('Falha ao gerar artigo');
      }

      const data = await response.json();
      setGeneratedContent(data.content);
      setShowEditor(true);
      toast.success('Artigo gerado com sucesso!');
    } catch (error) {
      toast.error('Erro ao gerar artigo');
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData(event.currentTarget);
      const supabase = createClient();
      
      // Obter o usuário atual
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      const postData = {
        title: formData.get('title')?.toString(),
        content: formData.get('content')?.toString(),
        published: isPublished,
        user_id: user.id,
        slug: formData.get('title')?.toString().toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-'),
        summary: formData.get('content')?.toString().slice(0, 160) || '',
        published_at: isPublished ? new Date().toISOString() : null,
        meta_title: formData.get('title')?.toString(),
        meta_description: formData.get('content')?.toString().slice(0, 160),
      };

      if (isEditing) {
        const { error } = await supabase
          .from('blog_posts')
          .update(postData)
          .eq('id', initialData.id);

        if (error) throw error;
        toast.success('Post atualizado com sucesso!');
      } else {
        const { error } = await supabase
          .from('blog_posts')
          .insert([postData]);

        if (error) throw error;
        toast.success('Post criado com sucesso!');
      }

      router.push('/blog/admin');
      router.refresh();
    } catch (error) {
      console.error('Erro ao salvar post:', error);
      toast.error('Erro ao salvar post');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {!showEditor ? (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="keyword">Palavra-chave ou Título do Artigo</Label>
            <Input
              id="keyword"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Digite uma palavra-chave ou título para gerar o artigo"
            />
          </div>
          
          <Button
            type="button"
            onClick={generateArticle}
            disabled={isGenerating}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Gerando artigo...
              </>
            ) : (
              'Gerar Artigo'
            )}
          </Button>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              name="title"
              defaultValue={keyword}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Conteúdo</Label>
            <RichTextEditor
              content={generatedContent}
              onChange={(content) => {
                const textarea = document.getElementById('content') as HTMLTextAreaElement;
                if (textarea) {
                  textarea.value = content;
                }
              }}
            />
            <Input
              id="content"
              name="content"
              type="hidden"
              defaultValue={generatedContent}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="published"
              checked={isPublished}
              onCheckedChange={setIsPublished}
            />
            <Label htmlFor="published">Publicar post</Label>
          </div>

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? 'Salvando...' : isEditing ? 'Atualizar Post' : 'Criar Post'}
          </Button>
        </>
      )}
    </form>
  );
}
