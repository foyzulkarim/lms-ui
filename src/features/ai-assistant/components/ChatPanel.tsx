import { useRef, useEffect } from "react";
import ChatMessage, { Message } from "./ChatMessage";
import ChatInput from "./ChatInput";

interface ChatPanelProps {
  messages: Message[];
  onSendMessage: (content: string) => void;
  isTyping?: boolean;
  disabled?: boolean;
}

export default function ChatPanel({ 
  messages, 
  onSendMessage, 
  isTyping = false,
  disabled = false
}: ChatPanelProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom when messages change or AI is typing
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping]);
  
  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-center text-gray-500">
            <div>
              <h3 className="text-lg font-medium mb-2">Ask the AI Assistant</h3>
              <p className="max-w-md">
                Have questions about this lesson? Ask the AI assistant for help understanding concepts, 
                solving problems, or exploring related topics.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            
            {isTyping && (
              <div className="flex items-center text-gray-500 text-sm ml-11 animate-pulse">
                <span className="mr-2">AI is typing</span>
                <span className="flex">
                  <span className="animate-bounce mx-0.5">.</span>
                  <span className="animate-bounce mx-0.5 animation-delay-200">.</span>
                  <span className="animate-bounce mx-0.5 animation-delay-400">.</span>
                </span>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      
      <div className="p-4 border-t border-gray-200">
        <ChatInput 
          onSendMessage={onSendMessage} 
          disabled={isTyping || disabled}
        />
      </div>
    </div>
  );
}
