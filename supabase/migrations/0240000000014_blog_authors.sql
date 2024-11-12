-- Create Blog Authors table
CREATE TABLE IF NOT EXISTS public.blog_authors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    bio TEXT,
    avatar_url TEXT,
    website_url TEXT,
    twitter_username TEXT,
    github_username TEXT,
    linkedin_url TEXT,
    meta_title TEXT, -- SEO: título otimizado para página do autor
    meta_description TEXT, -- SEO: descrição para página do autor
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    
    CONSTRAINT unique_user_id UNIQUE(user_id)
);

-- Adicionar coluna author_id na tabela blog_posts
ALTER TABLE public.blog_posts 
ADD COLUMN author_id UUID REFERENCES public.blog_authors(id) ON DELETE SET NULL;

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_blog_authors_user_id ON public.blog_authors(user_id);
CREATE INDEX IF NOT EXISTS idx_blog_authors_slug ON public.blog_authors(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_author_id ON public.blog_posts(author_id);

-- Enable RLS
ALTER TABLE public.blog_authors ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para autores
CREATE POLICY "Todos podem ver autores" ON public.blog_authors
    FOR SELECT USING (true);

CREATE POLICY "Usuários podem criar seu próprio perfil de autor" ON public.blog_authors
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seu próprio perfil de autor" ON public.blog_authors
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar seu próprio perfil de autor" ON public.blog_authors
    FOR DELETE USING (auth.uid() = user_id);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_blog_authors_updated_at
    BEFORE UPDATE ON public.blog_authors
    FOR EACH ROW
    EXECUTE FUNCTION update_blog_updated_at();

-- Compression para campos de texto longos
ALTER TABLE public.blog_authors ALTER COLUMN bio SET STORAGE EXTENDED;
ALTER TABLE public.blog_authors ALTER COLUMN meta_description SET STORAGE EXTENDED;

-- Comentários nas tabelas
COMMENT ON TABLE public.blog_authors IS 'Tabela de autores do blog';
COMMENT ON COLUMN public.blog_authors.user_id IS 'Referência ao usuário do sistema';
COMMENT ON COLUMN public.blog_authors.name IS 'Nome público do autor';
COMMENT ON COLUMN public.blog_authors.slug IS 'Slug para URL do perfil do autor';
COMMENT ON COLUMN public.blog_authors.bio IS 'Biografia do autor';
COMMENT ON COLUMN public.blog_posts.author_id IS 'Referência ao autor do post';
