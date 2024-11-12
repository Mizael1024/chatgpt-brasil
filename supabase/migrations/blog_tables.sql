-- Políticas para blog_posts
CREATE POLICY "Todos podem ver posts publicados" ON blog_posts
    FOR SELECT USING (published = true);

CREATE POLICY "Usuários podem ver seus próprios posts" ON blog_posts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar posts" ON blog_posts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus posts" ON blog_posts
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar seus posts" ON blog_posts
    FOR DELETE USING (auth.uid() = user_id);
