-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- Create OR REPLACE FUNCTION immutable_unaccent(text)
CREATE OR REPLACE FUNCTION immutable_unaccent(text)
RETURNS text AS
$$
  SELECT unaccent($1)
$$ LANGUAGE SQL IMMUTABLE;

-- Create Blog Posts table
CREATE TABLE IF NOT EXISTS public.blog_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    meta_title TEXT, -- SEO: título otimizado para mecanismos de busca
    meta_description TEXT, -- SEO: descrição para snippets do Google
    summary TEXT NOT NULL, -- Resumo do post para listagens
    content TEXT NOT NULL,
    published BOOLEAN DEFAULT false,
    featured BOOLEAN DEFAULT false,
    canonical_url TEXT, -- SEO: URL canônica para evitar conteúdo duplicado
    structured_data JSONB, -- SEO: Schema.org markup
    og_image TEXT, -- SEO: Open Graph image URL
    og_title TEXT, -- SEO: Open Graph title
    og_description TEXT, -- SEO: Open Graph description
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    published_at TIMESTAMP WITH TIME ZONE,
    -- SEO: Search vector para busca full-text
    search_vector tsvector GENERATED ALWAYS AS (
        setweight(to_tsvector('portuguese', immutable_unaccent(COALESCE(title, ''))), 'A') ||
        setweight(to_tsvector('portuguese', immutable_unaccent(COALESCE(meta_title, ''))), 'A') ||
        setweight(to_tsvector('portuguese', immutable_unaccent(COALESCE(meta_description, ''))), 'B') ||
        setweight(to_tsvector('portuguese', immutable_unaccent(COALESCE(summary, ''))), 'B') ||
        setweight(to_tsvector('portuguese', immutable_unaccent(COALESCE(content, ''))), 'C')
    ) STORED
);

-- Create Blog Categories table
CREATE TABLE IF NOT EXISTS public.blog_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    meta_title TEXT, -- SEO: título otimizado para categoria
    meta_description TEXT, -- SEO: descrição para categoria
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Create Blog Tags table
CREATE TABLE IF NOT EXISTS public.blog_tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Create junction tables
CREATE TABLE IF NOT EXISTS public.blog_posts_categories (
    post_id UUID REFERENCES public.blog_posts(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.blog_categories(id) ON DELETE CASCADE,
    PRIMARY KEY (post_id, category_id)
);

CREATE TABLE IF NOT EXISTS public.blog_posts_tags (
    post_id UUID REFERENCES public.blog_posts(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES public.blog_tags(id) ON DELETE CASCADE,
    PRIMARY KEY (post_id, tag_id)
);

-- Create indexes (seguindo o padrão do projeto)
CREATE INDEX IF NOT EXISTS idx_blog_posts_user_id ON public.blog_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_created_at ON public.blog_posts(created_at);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON public.blog_posts(published_at) WHERE published = true;
CREATE INDEX IF NOT EXISTS idx_blog_posts_featured ON public.blog_posts(featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON public.blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_search_vector ON public.blog_posts USING gin(search_vector);

-- Add text search capabilities para categorias e tags
CREATE INDEX IF NOT EXISTS idx_blog_categories_name_gin ON public.blog_categories USING gin(name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_blog_tags_name_gin ON public.blog_tags USING gin(name gin_trgm_ops);

-- Enable RLS (seguindo o padrão do projeto em migrations/20240000000008_document_rls.sql)
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_tags ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Everyone can view published blog posts" ON public.blog_posts
    FOR SELECT USING (published = true);

CREATE POLICY "Users can view all own blog posts" ON public.blog_posts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own blog posts" ON public.blog_posts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own blog posts" ON public.blog_posts
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own blog posts" ON public.blog_posts
    FOR DELETE USING (auth.uid() = user_id);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_blog_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_blog_posts_updated_at
    BEFORE UPDATE ON public.blog_posts
    FOR EACH ROW
    EXECUTE FUNCTION update_blog_updated_at();

-- Compression para campos de texto longos (seguindo o padrão em migrations/20240000000007_indexes.sql)
ALTER TABLE public.blog_posts ALTER COLUMN content SET STORAGE EXTENDED;
ALTER TABLE public.blog_posts ALTER COLUMN meta_description SET STORAGE EXTENDED;
