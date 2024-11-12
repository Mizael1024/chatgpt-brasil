"use client";

import Link from 'next/link';
import { useIsMobile } from '@/hooks/use-mobile';

export function BlogFooter() {
  const isMobile = useIsMobile();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t mt-auto w-full">
      <div className="container mx-auto px-4 py-8 overflow-x-hidden">
        <div className={`grid gap-8 ${isMobile ? 'grid-cols-1' : 'grid-cols-3'}`}>
          <div className={isMobile ? 'text-center' : ''}>
            <h3 className="font-bold mb-4">Sobre o Blog</h3>
            <p className="text-sm text-muted-foreground">
              Artigos e tutoriais sobre IA, tecnologia e programação.
            </p>
          </div>
          
          <div className={isMobile ? 'text-center' : ''}>
            <h3 className="font-bold mb-4">Links Rápidos</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/blog" className="text-sm text-muted-foreground hover:text-primary">
                  Artigos
                </Link>
              </li>
              <li>
                <Link href="/blog/categorias" className="text-sm text-muted-foreground hover:text-primary">
                  Categorias
                </Link>
              </li>
              <li>
                <Link href="/blog/sobre" className="text-sm text-muted-foreground hover:text-primary">
                  Sobre
                </Link>
              </li>
            </ul>
          </div>
          
          <div className={isMobile ? 'text-center' : ''}>
            <h3 className="font-bold mb-4">Redes Sociais</h3>
            <ul className="space-y-2">
              <li>
                <a 
                  href="https://twitter.com/chatgpt" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  Twitter
                </a>
              </li>
              <li>
                <a 
                  href="https://github.com/chatgpt" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  GitHub
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>© {currentYear} ChatGPT. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
