"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useState } from 'react';
import { ThemeToggle } from '@/components/theme-toggle';

export function BlogHeader() {
  const isMobile = useIsMobile();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
      <div className="max-w-4xl mx-auto px-4 py-4">
        <nav className="flex items-center justify-between">
          <Link href="/blog" className="text-xl font-bold">
            Blog ChatGPT
          </Link>
          
          {isMobile ? (
            <>
              <div className="flex items-center gap-2">
                <ThemeToggle />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  aria-label="Menu de navegação"
                >
                  {isMenuOpen ? <X /> : <Menu />}
                </Button>
              </div>

              {isMenuOpen && (
                <div className="absolute top-full left-0 right-0 bg-background border-b p-4 flex flex-col gap-2">
                  <Link href="/blog" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start">
                      Artigos
                    </Button>
                  </Link>
                  <Link href="/blog/categorias" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start">
                      Categorias
                    </Button>
                  </Link>
                  <Link href="/blog/sobre" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start">
                      Sobre
                    </Button>
                  </Link>
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center gap-4">
              <Link href="/blog">
                <Button variant="ghost">Artigos</Button>
              </Link>
              <Link href="/blog/categorias">
                <Button variant="ghost">Categorias</Button>
              </Link>
              <Link href="/blog/sobre">
                <Button variant="ghost">Sobre</Button>
              </Link>
              <ThemeToggle />
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
