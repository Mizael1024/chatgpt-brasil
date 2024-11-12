'use client';

import { motion } from 'framer-motion';
import { FileText, HeartHandshake, Sparkles, Image, PenLine } from 'lucide-react';
import { Message, CreateMessage } from 'ai';
import { useRouter } from 'next/navigation';
import { useIsMobile } from '@/hooks/use-mobile';
import { Vote } from '@/lib/supabase/types';
import useSWR from 'swr';
import { fetcher } from '@/lib/utils';
import { UISuggestion } from '@/lib/editor/suggestions';
import { useState } from 'react';
import { Suggestion as PreviewSuggestion } from './suggestion';
import { toast } from 'sonner';

interface OverviewProps {
  id: string;
  append: {
    (message: {
      role: 'user' | 'assistant' | 'system';
      content: string;
      id?: string;
    }): Promise<string | null | undefined>;
  };
  modelId?: string;
  onApply?: (suggestion: UISuggestion) => void;
}

export const Overview = ({ id, append, modelId = 'gpt-4', onApply }: OverviewProps) => {
  const router = useRouter();
  const isMobile = useIsMobile();
  const [selectedSuggestion, setSelectedSuggestion] = useState<UISuggestion | null>(null);
  
  const { data: votes } = useSWR<Vote[]>(`/api/vote?chatId=${id}`, fetcher);

  const buttons = [
    { 
      text: 'Resumir Texto', 
      icon: <FileText className="w-5 h-5 text-blue-500" />, 
      action: 'Gostaria de resumir um texto.' 
    },
    { 
      text: 'Aconselhar', 
      icon: <HeartHandshake className="w-5 h-5 text-pink-500" />, 
      action: 'Como posso te aconselhar hoje?' 
    },
    { 
      text: 'Surpreenda-me', 
      icon: <Sparkles className="w-5 h-5 text-purple-500" />, 
      action: 'Me surpreenda com algo interessante e inesperado!' 
    },
    { 
      text: 'Analisar Imagens', 
      icon: <Image className="w-5 h-5 text-green-500" />, 
      action: 'Por favor, envie a imagem que você gostaria que eu analisasse.' 
    },
    { 
      text: 'Ajudar a escrever', 
      icon: <PenLine className="w-5 h-5 text-orange-500" />, 
      action: 'Como posso te ajudar com a escrita hoje?' 
    }
  ];

  const handleButtonClick = async (action: string) => {
    try {
      if (onApply) {
        const suggestion: UISuggestion = {
          id: Math.random().toString(),
          original_text: action,
          suggested_text: action,
          description: action,
          selectionStart: 0,
          selectionEnd: action.length,
          document_id: id,
          created_at: new Date().toISOString(),
          document_created_at: new Date().toISOString(),
          is_resolved: false,
          user_id: id
        };

        setSelectedSuggestion(suggestion);
        onApply(suggestion);
        return;
      }

      window.history.replaceState({}, '', `/chat/${id}`);
      await fetcher(`/api/vote?chatId=${id}`);
      
      const messageId = await append({
        role: 'user',
        content: action,
        id: id,
      });

      router.refresh();
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      toast.error('Erro ao enviar mensagem. Por favor, tente novamente.');
    }
  };

  return (
    <motion.div
      key="overview"
      className={`w-full mx-auto ${isMobile ? 'mt-4 px-2' : 'max-w-3xl md:mt-20'}`}
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ delay: 0.5 }}
    >
      {selectedSuggestion && (
        <PreviewSuggestion
          suggestion={selectedSuggestion}
          onApply={() => {
            if (onApply) onApply(selectedSuggestion);
          }}
        />
      )}
      
      <div className="rounded-xl p-3 md:p-6 flex flex-col gap-3 md:gap-8 leading-relaxed text-center">
        <h2 className={`${isMobile ? 'text-2xl' : 'text-4xl'} font-bold`}>
          Como posso ajudar?
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:flex md:flex-wrap justify-center gap-1.5 md:gap-4">
          {buttons.map((button, index) => (
            <button
              key={index}
              onClick={() => handleButtonClick(button.action)}
              className={`
                rounded-lg bg-muted hover:bg-muted/80 
                transition-colors flex items-center gap-1.5
                ${isMobile 
                  ? 'px-2 py-1.5 w-full justify-center text-sm' 
                  : 'px-4 py-2'
                }
              `}
            >
              {button.icon}
              <span className={`${isMobile ? 'text-xs' : 'text-base'}`}>
                {button.text}
              </span>
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
