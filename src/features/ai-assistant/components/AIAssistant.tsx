import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import ChatSidebar from "./ChatSidebar";
import ChatPanel from "./ChatPanel";
import { Message } from "./ChatMessage";

interface ChatTopic {
  id: string;
  title: string;
  messages: Message[];
}

interface AIAssistantProps {
  lessonTitle?: string; // Optional lesson title to contextualize AI responses
  disabled?: boolean;
}

// Simulate AI responses based on keywords
const generateAIResponse = (message: string, lessonContext?: string): string => {
  // Lowercase message for easier matching
  const lowerMessage = message.toLowerCase();
  
  // Welcome message
  if (lowerMessage.includes("hello") || lowerMessage.includes("hi")) {
    return `Hello! I'm your AI learning assistant. How can I help you with${lessonContext ? ` this lesson on "${lessonContext}"?` : " your learning journey today?"}`;
  }
  
  // Explanation request
  if (lowerMessage.includes("explain") || lowerMessage.includes("what is")) {
    return `Great question! ${lessonContext ? `In the context of "${lessonContext}", ` : ""}To explain this concept clearly: this topic involves understanding the core principles and their practical applications. Would you like me to elaborate on a specific aspect of this?`;
  }
  
  // Help with coding
  if (lowerMessage.includes("code") || lowerMessage.includes("programming") || lowerMessage.includes("function")) {
    return `When working with code, it's important to understand both the syntax and the logic behind it. Here's a simple breakdown of the concept:
    
1. Start by understanding the problem you're trying to solve
2. Break it down into smaller, manageable parts
3. Implement each part step by step
4. Test your solution with different inputs

Would you like me to provide a specific example or code snippet?`;
  }
  
  // Not understood/default response
  return `That's an interesting question. ${lessonContext ? `Based on the lesson "${lessonContext}", ` : ""}I would suggest focusing on understanding the fundamental concepts first, then applying them to practical scenarios. Can you share more details about what you're trying to understand?`;
};

export default function AIAssistant({ lessonTitle, disabled = false }: AIAssistantProps) {
  const [topics, setTopics] = useState<ChatTopic[]>([]);
  const [activeTopic, setActiveTopic] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  
  // Initialize with welcome message for first-time users
  useEffect(() => {
    if (topics.length === 0) {
      const initialTopicId = uuidv4();
      const welcomeMessage: Message = {
        id: uuidv4(),
        content: `What would you like to know about this lesson?`,
        sender: 'ai',
        timestamp: new Date()
      };
      
      const initialTopic: ChatTopic = {
        id: initialTopicId,
        title: "New Conversation",
        messages: [welcomeMessage]
      };
      
      setTopics([initialTopic]);
      setActiveTopic(initialTopicId);
    }
  }, []);
  
  // Get active chat topic
  const activeChat = topics.find(topic => topic.id === activeTopic);
  
  // Handle creating a new chat
  const handleNewChat = () => {
    const newTopicId = uuidv4();
    const welcomeMessage: Message = {
      id: uuidv4(),
      content: `What would you like to know about this lesson?`,
      sender: 'ai',
      timestamp: new Date()
    };
    
    const newTopic: ChatTopic = {
      id: newTopicId,
      title: `Chat #${topics.length + 1}`,
      messages: [welcomeMessage]
    };
    
    setTopics([...topics, newTopic]);
    setActiveTopic(newTopicId);
  };
  
  // Handle selecting a chat topic
  const handleSelectTopic = (topicId: string) => {
    setActiveTopic(topicId);
  };
  
  // Handle sending a message
  const handleSendMessage = (content: string) => {
    if (!activeTopic) return;
    
    // Add user message
    const userMessage: Message = {
      id: uuidv4(),
      content,
      sender: 'user',
      timestamp: new Date()
    };
    
    // Update chat with user message
    const updatedTopics = topics.map(topic => {
      if (topic.id === activeTopic) {
        // Update chat title based on first user message if it's still the default
        const updatedTitle = topic.title === `Chat #${topics.indexOf(topic) + 1}` && 
                             topic.messages.length === 1 ? 
                             content.slice(0, 25) + (content.length > 25 ? '...' : '') : 
                             topic.title;
        
        return {
          ...topic,
          title: updatedTitle,
          messages: [...topic.messages, userMessage]
        };
      }
      return topic;
    });
    
    setTopics(updatedTopics);
    
    // Simulate AI thinking
    setIsTyping(true);
    
    // Simulate AI response after a delay
    setTimeout(() => {
      const aiResponse: Message = {
        id: uuidv4(),
        content: generateAIResponse(content, lessonTitle),
        sender: 'ai',
        timestamp: new Date()
      };
      
      const finalTopics = updatedTopics.map(topic => {
        if (topic.id === activeTopic) {
          return {
            ...topic,
            messages: [...topic.messages, aiResponse]
          };
        }
        return topic;
      });
      
      setTopics(finalTopics);
      setIsTyping(false);
    }, 1500);
  };
  
  return (
    <div className="flex h-full border border-gray-200 rounded-lg overflow-hidden">
      {/* Left sidebar with chat topics */}
      <div className="w-1/3 max-w-xs border-r border-gray-200 hidden md:block">
        <ChatSidebar 
          topics={topics} 
          activeTopic={activeTopic} 
          onSelectTopic={handleSelectTopic} 
          onNewChat={handleNewChat} 
          disabled={disabled}
        />
      </div>
      
      {/* Main chat area */}
      <div className="flex-1">
        {/* Mobile-only top bar with new chat button */}
        { !disabled && (
          <div className="md:hidden border-b border-gray-200 p-2">
            <button 
              onClick={handleNewChat}
              className="w-full py-2 px-4 bg-primary text-white rounded-md flex items-center justify-center gap-2"
            >
              <span>+ New Chat</span>
            </button>
          </div>
        )}
        
        {activeChat ? (
          <ChatPanel 
            messages={activeChat.messages} 
            onSendMessage={handleSendMessage} 
            isTyping={isTyping}
            disabled={disabled}
          />
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500">
            <p>Select a chat or start a new conversation</p>
          </div>
        )}
      </div>
    </div>
  );
}
