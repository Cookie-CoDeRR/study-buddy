import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Send, Trash2 } from 'lucide-react';
import { 
  sendChatMessage, 
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
}

export function ChatRoom({ groupId, userId, userName, userAvatar }: ChatRoomProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLoading(true);
    
    // Set a timeout to stop loading after 5 seconds (in case there are no messages or error)
    const loadingTimeout = setTimeout(() => {
      setLoading(false);
    }, 5000);

    // Subscribe to messages
    const unsubscribe = subscribeToGroupMessages(groupId, (newMessages) => {
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
    if (!inputValue.trim()) return;

    setSending(true);
    try {
      await sendChatMessage(groupId, userId, userName, userAvatar, inputValue);
      setInputValue('');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive',
      });
    }
    setSending(false);
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
    if (e.key === 'Enter' && e.ctrlKey) {
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
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          <>
            {messages.map((msg) => {
              const isOwn = msg.userId === userId;
              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : ''}`}
                >
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarImage src={msg.userAvatar} />
                    <AvatarFallback>
                      {msg.userName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div className={`flex-1 max-w-xs ${isOwn ? 'text-right' : ''}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {msg.userName}
                      </p>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDistanceToNow(new Date(msg.createdAt), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>

                    <div className={`flex gap-2 items-start ${isOwn ? 'justify-end' : ''}`}>
                      <Card
                        className={`p-3 rounded-lg ${
                          isOwn
                            ? 'bg-blue-600 text-white dark:bg-blue-700'
                            : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                        }`}
                      >
                        <p className="text-sm break-words">{msg.message}</p>
                      </Card>

                      {isOwn && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteMessage(msg.id)}
                          className="text-xs h-8 w-8 p-0"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 dark:border-gray-800 p-4 bg-white dark:bg-gray-800">
        <div className="flex gap-2">
          <Textarea
            placeholder="Type a message... (Ctrl+Enter to send)"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            className="min-h-12 resize-none"
            rows={2}
          />
          <Button
            onClick={handleSendMessage}
            disabled={sending || !inputValue.trim()}
            className="bg-blue-600 hover:bg-blue-700 self-end"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          Press Ctrl+Enter to send quickly
        </p>
      </div>
    </div>
  );
}
