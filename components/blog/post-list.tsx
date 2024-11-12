'use client';

import { useState } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Edit2, Trash2, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';

interface Post {
  id: string;
  title: string;
  slug: string;
  published: boolean;
  is_draft: boolean;
  created_at: string;
  published_at: string | null;
}

interface PostListProps {
  initialPosts: Post[];
}

export function PostList({ initialPosts }: PostListProps) {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [sort, setSort] = useState<'newest' | 'oldest'>('newest');

  // Filtra e ordena os posts
  const filteredPosts = posts
    .filter((post) => {
      // Filtro de busca
      const matchesSearch = post.title
        .toLowerCase()
        .includes(search.toLowerCase());

      // Filtro de status
      const matchesFilter =
        filter === 'all' ||
        (filter === 'published' && post.published) ||
        (filter === 'draft' && !post.published);

      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      // Ordenação
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return sort === 'newest' ? dateB - dateA : dateA - dateB;
    });

  // Função para excluir post
  async function handleDelete(postId: string) {
    if (!confirm('Tem certeza que deseja excluir este post?')) return;

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;

      setPosts(posts.filter((post) => post.id !== postId));
      toast.success('Post excluído com sucesso!');
    } catch (error) {
      toast.error('Erro ao excluir o post');
    }
  }

  return (
    <div className="space-y-6">
      {/* Filtros e Busca */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Input
          placeholder="Buscar posts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1"
        />
        
        <Select
          value={filter}
          onValueChange={(value: 'all' | 'published' | 'draft') =>
            setFilter(value)
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="published">Publicados</SelectItem>
            <SelectItem value="draft">Rascunhos</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={sort}
          onValueChange={(value: 'newest' | 'oldest') => setSort(value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Ordenar por" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Mais recentes</SelectItem>
            <SelectItem value="oldest">Mais antigos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Lista de Posts */}
      <div className="space-y-4">
        {filteredPosts.map((post) => (
          <div
            key={post.id}
            className="flex items-center justify-between p-4 bg-card rounded-lg border"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">{post.title}</h3>
                <Badge variant={post.published ? 'default' : 'secondary'}>
                  {post.published ? 'Publicado' : 'Rascunho'}
                </Badge>
              </div>
              
              <p className="text-sm text-muted-foreground">
                Criado{' '}
                {formatDistanceToNow(new Date(post.created_at), {
                  addSuffix: true,
                  locale: ptBR,
                })}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {post.published && (
                <Link
                  href={`/blog/${post.slug}`}
                  target="_blank"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Eye className="h-5 w-5" />
                </Link>
              )}
              
              <Link href={`/blog/admin/edit/${post.slug}`}>
                <Button variant="ghost" size="icon">
                  <Edit2 className="h-5 w-5" />
                </Button>
              </Link>
              
              <Button
                variant="ghost"
                size="icon"
                className="text-destructive hover:text-destructive/90"
                onClick={() => handleDelete(post.id)}
              >
                <Trash2 className="h-5 w-5" />
              </Button>
            </div>
          </div>
        ))}

        {filteredPosts.length === 0 && (
          <div className="text-center py-6 text-muted-foreground">
            Nenhum post encontrado
          </div>
        )}
      </div>
    </div>
  );
}
