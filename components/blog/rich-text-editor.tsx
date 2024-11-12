'use client';

import { useState, useRef, useEffect } from 'react';
import { Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import { useEditor, EditorContent } from '@tiptap/react';
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Heading1,
  Heading2,
  Heading3,
  Image as ImageIcon,
  Link as LinkIcon,
  Eye,
  Wand2,
  MessageSquarePlus,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from 'sonner';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
}

export function RichTextEditor({ content, onChange }: RichTextEditorProps) {
  const [isPreview, setIsPreview] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [wordsCount, setWordsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Link.configure({
        openOnClick: false,
      }),
    ],
    content: content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
      setWordsCount(editor.getText().split(/\s+/).length);
    },
  });

  const handleRephrase = async (type: 'rephrase' | 'simplify' | 'expand' | 'summarize') => {
    if (!editor) return;
    
    const selection = editor.state.selection;
    const text = editor.state.doc.textBetween(selection.from, selection.to);
    
    if (!text) {
      toast.error('Selecione um texto para reformular');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/rephrase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          type,
        }),
      });

      if (!response.ok) {
        throw new Error('Falha ao processar o texto');
      }

      const data = await response.json();
      
      // Substitui o texto selecionado pelo texto reformulado
      editor
        .chain()
        .focus()
        .deleteSelection()
        .insertContent(data.result)
        .run();

      toast.success('Texto reformulado com sucesso!');
    } catch (error) {
      toast.error('Erro ao reformular texto');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!editor) return null;

  return (
    <div className="border rounded-lg">
      {/* Barra de ferramentas */}
      <div className="border-b p-2 flex items-center gap-2 flex-wrap">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive('bold') ? 'bg-muted' : ''}
        >
          <Bold className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive('italic') ? 'bg-muted' : ''}
        >
          <Italic className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={editor.isActive('heading', { level: 1 }) ? 'bg-muted' : ''}
        >
          <Heading1 className="h-4 w-4" />
        </Button>

        {/* Botões de IA */}
        <div className="border-l mx-2 h-6" />
        
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Wand2 className="h-4 w-4 mr-2" />
              )}
              Rephraser
            </Button>
          </PopoverTrigger>
          <PopoverContent>
            <div className="space-y-2">
              <Button 
                onClick={() => handleRephrase('rephrase')} 
                className="w-full"
                disabled={isLoading}
              >
                Rephrase
              </Button>
              <Button 
                onClick={() => handleRephrase('simplify')} 
                className="w-full"
                disabled={isLoading}
              >
                Simplify
              </Button>
              <Button 
                onClick={() => handleRephrase('expand')} 
                className="w-full"
                disabled={isLoading}
              >
                Expand
              </Button>
              <Button 
                onClick={() => handleRephrase('summarize')} 
                className="w-full"
                disabled={isLoading}
              >
                Summarize
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        <Button variant="outline" size="sm">
          <MessageSquarePlus className="h-4 w-4 mr-2" />
          Compose
        </Button>

        <div className="ml-auto flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {wordsCount} palavras
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsPreview(!isPreview)}
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Área do Editor */}
      <div className="w-full">
        <EditorContent 
          editor={editor} 
          className="p-4 min-h-[400px] prose max-w-none"
        />
      </div>
    </div>
  );
}
