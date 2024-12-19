import React from 'react';
import { Avatar, AvatarFallback } from './ui/avatar';

interface ChatMessageProps {
  message: string;
  sender: string;
  timestamp: Date;
  isOwn: boolean;
}

const ChatMessage = ({ message, sender, timestamp, isOwn }: ChatMessageProps) => {
  return (
    <div className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : 'flex-row'} mb-4`}>
      <Avatar className="h-8 w-8">
        <AvatarFallback>{sender[0].toUpperCase()}</AvatarFallback>
      </Avatar>
      <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
        <div className={`rounded-lg px-4 py-2 max-w-[70%] ${
          isOwn ? 'bg-primary text-primary-foreground' : 'bg-secondary'
        }`}>
          <p className="text-sm">{message}</p>
        </div>
        <span className="text-xs text-muted-foreground mt-1">
          {timestamp.toLocaleTimeString()}
        </span>
      </div>
    </div>
  );
};

export default ChatMessage;