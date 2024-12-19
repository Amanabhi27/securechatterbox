import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, LogOut } from 'lucide-react';
import ChatMessage from '@/components/ChatMessage';
import { generateKeyPair, encryptMessage, decryptMessage } from '@/utils/encryption';
import { useAuth } from '@/components/AuthProvider';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  profiles: {
    username: string;
    avatar_url: string | null;
  };
}

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [keys, setKeys] = useState<{ privateKey: string; publicKey: string } | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  useEffect(() => {
    const initializeKeys = async () => {
      const generatedKeys = await generateKeyPair();
      setKeys(generatedKeys);
    };

    initializeKeys();
    fetchMessages();
    subscribeToMessages();
  }, []);

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        id,
        content,
        sender_id,
        created_at,
        profiles (
          username,
          avatar_url
        )
      `)
      .order('created_at', { ascending: true });

    if (error) {
      toast({
        title: 'Error fetching messages',
        description: error.message,
        variant: 'destructive',
      });
      return;
    }

    setMessages(data || []);
  };

  const subscribeToMessages = () => {
    const channel = supabase
      .channel('public:messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          const newMessage = payload.new as Message;
          setMessages((prev) => [...prev, newMessage]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !keys || !user) return;

    try {
      const encryptedContent = await encryptMessage(newMessage, keys.publicKey);
      
      const { error } = await supabase.from('messages').insert({
        content: newMessage,
        encrypted_content: encryptedContent,
        sender_id: user.id,
      });

      if (error) throw error;

      setNewMessage('');
    } catch (error: any) {
      toast({
        title: 'Error sending message',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <div className="flex flex-col h-screen max-w-3xl mx-auto p-4">
      <div className="bg-card rounded-lg shadow-lg flex-1 flex flex-col p-4 mb-4 overflow-hidden">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Secure Chat</h1>
          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex-1 overflow-y-auto space-y-4 mb-4">
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message.content}
              sender={message.profiles.username}
              timestamp={new Date(message.created_at)}
              isOwn={message.sender_id === user.id}
            />
          ))}
        </div>

        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1"
          />
          <Button type="submit" size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Index;