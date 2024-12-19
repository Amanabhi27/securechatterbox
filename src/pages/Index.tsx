import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';
import ChatMessage from '@/components/ChatMessage';
import { generateKeyPair, encryptMessage, decryptMessage } from '@/utils/encryption';

interface Message {
  id: string;
  text: string;
  sender: string;
  timestamp: Date;
}

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [keys, setKeys] = useState<{ privateKey: string; publicKey: string } | null>(null);

  useEffect(() => {
    const initializeKeys = async () => {
      const generatedKeys = await generateKeyPair();
      setKeys(generatedKeys);
    };

    initializeKeys();
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !keys) return;

    const encryptedMessage = await encryptMessage(newMessage, keys.publicKey);
    const decryptedMessage = await decryptMessage(encryptedMessage as string, keys.privateKey);

    const message: Message = {
      id: Date.now().toString(),
      text: decryptedMessage as string,
      sender: 'You',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, message]);
    setNewMessage('');
  };

  return (
    <div className="flex flex-col h-screen max-w-3xl mx-auto p-4">
      <div className="bg-card rounded-lg shadow-lg flex-1 flex flex-col p-4 mb-4 overflow-hidden">
        <h1 className="text-2xl font-bold mb-4">Secure Chat</h1>
        
        <div className="flex-1 overflow-y-auto space-y-4 mb-4">
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message.text}
              sender={message.sender}
              timestamp={message.timestamp}
              isOwn={message.sender === 'You'}
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