import { Message } from 'ai';
import { toast } from 'sonner';
import { useSWRConfig } from 'swr';
import { useCopyToClipboard } from 'usehooks-ts';

import { Vote } from '@/lib/supabase/types';
import { getMessageIdFromAnnotations } from '@/lib/utils';

import { CopyIcon, ThumbDownIcon, ThumbUpIcon } from './icons';
import { Button } from '../ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip';

export function MessageActions({
  chatId,
  message,
  vote,
  isLoading,
}: {
  chatId: string;
  message: Message;
  vote: Vote | undefined;
  isLoading: boolean;
}) {
  const { mutate } = useSWRConfig();
  const [_, copyToClipboard] = useCopyToClipboard();

  if (isLoading) return null;
  if (message.role === 'user') return null;
  if (message.toolInvocations && message.toolInvocations.length > 0)
    return null;

  return (
    <TooltipProvider delayDuration={0}>
      <div className="flex flex-row gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              className="py-1 px-2 h-fit text-muted-foreground"
              variant="outline"
              onClick={async () => {
                await copyToClipboard(message.content as string);
                toast.success('Copied to clipboard!');
              }}
            >
              <CopyIcon />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Copiar</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              className="py-1 px-2 h-fit text-muted-foreground !pointer-events-auto"
              disabled={vote && vote.is_upvoted}
              variant="outline"
              onClick={async () => {
                const messageId = getMessageIdFromAnnotations(message);

                const upvote = fetch('/api/vote', {
                  method: 'PATCH',
                  body: JSON.stringify({
                    chatId,
                    messageId,
                    type: 'up',
                  }),
                });

                toast.promise(upvote, {
                  loading: 'Avaliando resposta...',
                  success: () => {
                    mutate<Array<Vote>>(
                      `/api/vote?chatId=${chatId}`,
                      (currentVotes) => {
                        if (!currentVotes) return [];

                        const votesWithoutCurrent = currentVotes.filter(
                          (vote) => vote.message_id !== message.id
                        );

                        return [
                          ...votesWithoutCurrent,
                          {
                            chat_id: chatId,
                            message_id: message.id,
                            is_upvoted: true,
                            updated_at: new Date().toISOString(), // Add this line
                          },
                        ];
                      },
                      { revalidate: false }
                    );

                    return 'Resposta avaliada!';
                  },
                  error: 'Falha ao avaliar resposta.',
                });
              }}
            >
              <ThumbUpIcon />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Avaliar resposta</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              className="py-1 px-2 h-fit text-muted-foreground !pointer-events-auto"
              variant="outline"
              disabled={vote && !vote.is_upvoted}
              onClick={async () => {
                const messageId = getMessageIdFromAnnotations(message);

                const downvote = fetch('/api/vote', {
                  method: 'PATCH',
                  body: JSON.stringify({
                    chatId,
                    messageId,
                    type: 'down',
                  }),
                });

                toast.promise(downvote, {
                  loading: 'Avaliando resposta...',
                  success: () => {
                    mutate<Array<Vote>>(
                      `/api/vote?chatId=${chatId}`,
                      (currentVotes) => {
                        if (!currentVotes) return [];

                        const votesWithoutCurrent = currentVotes.filter(
                          (vote) => vote.message_id !== message.id
                        );

                        return [
                          ...votesWithoutCurrent,
                          {
                            chat_id: chatId, // Changed from chatId
                            message_id: message.id, // Changed from messageId
                            is_upvoted: false, // Changed from isUpvoted
                            updated_at: new Date().toISOString(), // Add this line
                          },
                        ];
                      },
                      { revalidate: false }
                    );

                    return 'Resposta avaliada!';
                  },
                  error: 'Falha ao avaliar resposta.',
                });
              }}
            >
              <ThumbDownIcon />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Avaliar resposta</TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
