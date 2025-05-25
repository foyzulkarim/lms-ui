import { Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface ChatTopic {
  id: string;
  title: string;
}

interface ChatSidebarProps {
  topics: ChatTopic[];
  activeTopic: string | null;
  onSelectTopic: (topicId: string) => void;
  onNewChat: () => void;
  disabled?: boolean;
}

export default function ChatSidebar({ 
  topics, 
  activeTopic, 
  onSelectTopic, 
  onNewChat, 
  disabled = false
}: ChatSidebarProps) {
  return (
    <div className="flex flex-col h-full bg-gray-50 border-r border-gray-200">
      {!disabled && (
        <div className="p-4 border-b border-gray-200 sticky top-0 bg-gray-50 z-10">
          <Button 
            onClick={onNewChat}
            className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90"
            variant="default"
          >
            <Plus className="h-4 w-4" />
            <span>New Chat</span>
          </Button>
        </div>
      )}
      
      <div className="overflow-y-auto flex-1 py-2">
        {topics.length === 0 ? (
          <div className="text-center text-gray-500 p-4">
            <p>No chats yet</p>
            <p className="text-sm">Start a new conversation</p>
          </div>
        ) : (
          <ul className="space-y-1 px-2">
            {topics.map((topic) => (
              <li key={topic.id}>
                <button
                  onClick={() => onSelectTopic(topic.id)}
                  className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                    activeTopic === topic.id 
                      ? "bg-gray-200 text-gray-900" 
                      : "hover:bg-gray-100 text-gray-700"
                  }`}
                >
                  <div className="truncate">{topic.title}</div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
