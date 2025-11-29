import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Send, Trash2, Smile } from 'lucide-react';
import { 
  subscribeToGroupMessages,
  deleteMessage,
  ChatMessage,
} from '@/lib/group-chat';
import { formatDistanceToNow } from 'date-fns';
import { toast } from '@/hooks/use-toast';

interface ChatRoomProps {
  groupId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  inputValue: string;
  onInputChange: (value: string) => void;
  onSendMessage: () => Promise<void>;
  sending: boolean;
}

export function ChatRoom({ 
  groupId, 
  userId, 
  userName, 
  userAvatar,
  inputValue,
  onInputChange,
  onSendMessage,
  sending
}: ChatRoomProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLoading(true);
    console.log(`[ChatRoom] Subscribing to messages for group: ${groupId}`);
    
    // Set a timeout to stop loading after 5 seconds (in case there are no messages or error)
    const loadingTimeout = setTimeout(() => {
      console.log('[ChatRoom] Loading timeout reached, stopping loading state');
      setLoading(false);
    }, 5000);

    // Subscribe to messages
    const unsubscribe = subscribeToGroupMessages(groupId, (newMessages) => {
      console.log(`[ChatRoom] Received ${newMessages.length} messages from subscription`);
      setMessages(newMessages);
      setLoading(false);
      clearTimeout(loadingTimeout);
    });

    return () => {
      unsubscribe();
      clearTimeout(loadingTimeout);
    };
  }, [groupId]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    await onSendMessage();
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      await deleteMessage(messageId);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete message',
        variant: 'destructive',
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-background to-secondary/10 rounded-xl overflow-hidden border border-border/50 shadow-lg">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Smile className="w-12 h-12 text-primary/30 mx-auto mb-3" />
              <p className="text-sm md:text-base text-muted-foreground">No messages yet</p>
              <p className="text-xs text-muted-foreground mt-1">Start the conversation!</p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg, idx) => {
              const isOwn = msg.userId === userId;
              const showAvatar = idx === 0 || messages[idx - 1].userId !== msg.userId;
              
              return (
                <div
                  key={msg.id}
                  className={`flex gap-2 md:gap-3 items-end group animate-fade-in ${
                    isOwn ? 'flex-row-reverse' : ''
                  }`}
                >
                  {showAvatar ? (
                    <Avatar className="h-8 w-8 md:h-9 md:w-9 flex-shrink-0 border-2 border-primary/20">
                      <AvatarImage src={msg.userAvatar} />
                      <AvatarFallback className="text-xs md:text-sm font-bold bg-gradient-to-br from-primary to-accent text-white">
                        {msg.userName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <div className="h-8 w-8 md:h-9 md:w-9 flex-shrink-0" />
                  )}

                  <div className={`flex-1 max-w-xs md:max-w-md ${isOwn ? 'items-end' : ''} flex flex-col`}>
                    {showAvatar && (
                      <p className={`text-xs md:text-sm font-semibold text-foreground mb-1 ${
                        isOwn ? 'text-right' : ''
                      }`}>
                        {msg.userName}
                      </p>
                    )}

                    <div className={`flex gap-2 items-end ${isOwn ? 'flex-row-reverse' : ''}`}>
                      <div
                        className={`px-3 md:px-4 py-2 md:py-3 rounded-2xl text-sm md:text-base transition-all duration-200 ${
                          isOwn
                            ? 'bg-gradient-to-br from-primary to-primary/80 text-primary-foreground rounded-br-none shadow-lg'
                            : 'bg-secondary dark:bg-secondary/80 text-foreground rounded-bl-none shadow-sm border border-border/30'
                        }`}
                      >
                        <p className="break-words leading-relaxed">{msg.message}</p>
                      </div>

                      {isOwn && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteMessage(msg.id)}
                          className="h-7 w-7 md:h-8 md:w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-3 h-3 md:w-4 md:h-4 text-destructive" />
                        </Button>
                      )}
                    </div>

                    <span className={`text-xs text-muted-foreground mt-1 ${
                      isOwn ? 'text-right' : ''
                    }`}>
                      {formatDistanceToNow(new Date(msg.createdAt), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Area at Bottom */}
      <div className="border-t border-border/50 p-4 md:p-6 bg-card/50 backdrop-blur-sm">
        <div className="flex gap-2">
          <Textarea
            placeholder="Message... (Press Enter to send)"
            value={inputValue}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyPress={handleKeyPress}
            className="min-h-10 md:min-h-12 resize-none text-sm md:text-base rounded-2xl border-primary/20 focus:border-primary/50 transition-colors"
            rows={2}
          />
          <Button
            onClick={handleSendMessage}
            disabled={sending || !inputValue.trim()}
            className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 self-end px-4 md:px-6 rounded-2xl shadow-lg transition-all"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2 hidden md:block">
          💡 Tip: Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
