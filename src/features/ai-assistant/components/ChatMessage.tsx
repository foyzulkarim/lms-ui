import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Copy, ThumbsUp, ThumbsDown, Volume2, Sparkles, Check } from "lucide-react";
import { useState } from "react";

export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

interface ChatMessageProps {
  message: Message;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.sender === 'user';
  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  
  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const handleLike = () => {
    setLiked(!liked);
    if (disliked) setDisliked(false);
  };
  
  const handleDislike = () => {
    setDisliked(!disliked);
    if (liked) setLiked(false);
  };
  
  return (
    <div className={cn(
      "flex w-full mb-4 group",
      isUser ? "justify-end" : "justify-start"
    )}>
      <div className={cn(
        "flex max-w-[80%]",
        isUser ? "flex-row-reverse" : "flex-row"
      )}>
        <div className={cn(
          "flex-shrink-0 h-8 w-8",
          isUser ? "ml-3" : "mr-3"
        )}>
          <Avatar>
            <AvatarFallback>
              {isUser ? 'U' : 'AI'}
            </AvatarFallback>
            <AvatarImage src={isUser ? "/user-avatar.png" : "/ai-avatar.png"} />
          </Avatar>
        </div>
        
        <div className="relative">
          <div className={cn(
            "px-4 py-2 rounded-lg text-sm",
            isUser 
              ? "bg-primary text-white rounded-tr-none" 
              : "bg-gray-100 text-gray-800 rounded-tl-none"
          )}>
            {message.content}
            
            {/* Message action buttons - only show for AI responses */}
            {!isUser && (
              <div className="absolute -bottom-8 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 pl-1">
                <button 
                  onClick={handleCopy}
                  className="text-gray-500 hover:text-gray-700 p-1 rounded-md hover:bg-gray-100"
                  title="Copy to clipboard"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                </button>
                <button 
                  onClick={handleLike}
                  className={`p-1 rounded-md hover:bg-gray-100 ${liked ? 'text-green-600' : 'text-gray-500 hover:text-gray-700'}`}
                  title="Thumbs up"
                >
                  <ThumbsUp size={14} />
                </button>
                <button 
                  onClick={handleDislike}
                  className={`p-1 rounded-md hover:bg-gray-100 ${disliked ? 'text-red-600' : 'text-gray-500 hover:text-gray-700'}`}
                  title="Thumbs down"
                >
                  <ThumbsDown size={14} />
                </button>
                <button 
                  className="text-gray-500 hover:text-gray-700 p-1 rounded-md hover:bg-gray-100"
                  title="Read aloud"
                >
                  <Volume2 size={14} />
                </button>
                <button 
                  className="text-gray-500 hover:text-gray-700 p-1 rounded-md hover:bg-gray-100"
                  title="Switch model"
                >
                  <Sparkles size={14} />
                </button>
              </div>
            )}
          </div>
          <div className={cn(
            "text-xs text-gray-500 mt-1",
            isUser ? "text-right" : "text-left"
          )}>
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>
    </div>
  );
}