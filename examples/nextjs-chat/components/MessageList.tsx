import React from "react";
import { Message } from "@/types";
import { Bot, User, Settings, Hammer } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface MessageListProps {
  messages: Message[];
}

export default function MessageList({ messages }: MessageListProps) {
  const getIcon = (role: Message["role"]) => {
    switch (role) {
      case "user":
        return <User className="w-5 h-5" />;
      case "assistant":
        return <Bot className="w-5 h-5" />;
      case "system":
        return <Settings className="w-5 h-5" />;
      case "tool":
        return <Hammer className="w-5 h-5" />;
      default:
        return null;
    }
  };

  const getRoleColor = (role: Message["role"]) => {
    switch (role) {
      case "user":
        return "bg-blue-600 text-white";
      case "assistant":
        return "bg-green-600 text-white";
      case "system":
        return "bg-gray-600 text-white";
      case "tool":
        return "bg-yellow-600 text-white";
      default:
        return "bg-gray-600 text-white";
    }
  };

  return (
    <div className="space-y-4">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex gap-3 ${
            message.role === "user" ? "justify-end" : "justify-start"
          }`}
        >
          {message.role !== "user" && (
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center ${getRoleColor(
                message.role
              )}`}
            >
              {getIcon(message.role)}
            </div>
          )}

          <div
            className={`max-w-2xl rounded-lg p-4 ${
              message.role === "user"
                ? "bg-blue-600 text-white"
                : "bg-gray-800 border border-gray-700 text-white"
            }`}
          >
            {message.toolName && (
              <div className="text-xs font-semibold mb-2 opacity-75">
                Tool: {message.toolName}
              </div>
            )}

            <div
              className={`prose prose-invert max-w-none`}
            >
              {message.role === "tool" &&
              typeof message.content === "object" ? (
                <pre className="text-xs overflow-x-auto">
                  <code>{JSON.stringify(message.content, null, 2)}</code>
                </pre>
              ) : (
                <ReactMarkdown>{message.content}</ReactMarkdown>
              )}
            </div>

            <div
              className={`text-xs mt-2 ${
                message.role === "user" ? "text-blue-200" : "text-gray-400"
              }`}
            >
              {new Date(message.timestamp).toLocaleTimeString()}
            </div>
          </div>

          {message.role === "user" && (
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center ${getRoleColor(
                message.role
              )}`}
            >
              {getIcon(message.role)}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
