"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, Loader2, Settings } from "lucide-react";
import { MCPClient } from "@/lib/mcp-client";
import { Message, Tool } from "@/types";
import MessageList from "@/components/MessageList";
import ToolPanel from "@/components/ToolPanel";
import ServerConfig from "@/components/ServerConfig";

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mcpClient, setMcpClient] = useState<MCPClient | null>(null);
  const [availableTools, setAvailableTools] = useState<Tool[]>([]);
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [showConfig, setShowConfig] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initializeMCP();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const initializeMCP = async () => {
    try {
      const client = new MCPClient({
        serverUrl: process.env.NEXT_PUBLIC_MCP_SERVER_URL || "",
        apiKey: process.env.NEXT_PUBLIC_ALLOY_API_KEY || "",
      });

      await client.connect();
      const tools = await client.getAvailableTools();

      setMcpClient(client);
      setAvailableTools(tools);
      setSelectedTools(tools.slice(0, 5).map((t) => t.name)); // Select first 5 tools by default
    } catch (error) {
      console.error("Failed to initialize MCP:", error);
      addMessage({
        role: "system",
        content:
          "Failed to connect to Alloy MCP server. Please check your configuration.",
      });
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const addMessage = (message: Omit<Message, "id" | "timestamp">) => {
    const newMessage: Message = {
      ...message,
      id: crypto.randomUUID(),
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);
    return newMessage;
  };

  const handleSend = async () => {
    if (!input.trim() || !mcpClient || isLoading) return;

    const userMessage = addMessage({
      role: "user",
      content: input,
    });

    setInput("");
    setIsLoading(true);

    try {
      // Check if any tools should be invoked based on the message
      const toolsToInvoke = await mcpClient.determineTools(
        input,
        selectedTools
      );
      let toolResults: any[] = [];

      if (toolsToInvoke.length > 0) {
        // Show which tools are being invoked
        addMessage({
          role: "system",
          content: `Invoking tools: ${toolsToInvoke
            .map((t) => t.name)
            .join(", ")}`,
        });

        // Execute tools in parallel
        toolResults = await Promise.all(
          toolsToInvoke.map((tool) =>
            mcpClient.executeTool(tool.name, tool.arguments)
          )
        );

        // Add tool results to messages
        toolResults.forEach((result, index) => {
          addMessage({
            role: "tool",
            content: JSON.stringify(result.content),
            toolName: toolsToInvoke[index].name,
          });
        });
      }

      // Generate assistant response based on context
      const response = await mcpClient.generateResponse(
        messages,
        input,
        toolsToInvoke.length > 0 ? toolResults : undefined
      );

      addMessage({
        role: "assistant",
        content: response,
      });
    } catch (error) {
      console.error("Error processing message:", error);
      addMessage({
        role: "system",
        content: "An error occurred while processing your request.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-900">
      {/* Sidebar with Tools */}
      <div className="w-80 bg-gray-800 border-r border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">
              Alloy MCP Tools
            </h2>
            <button
              onClick={() => setShowConfig(!showConfig)}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors text-gray-300 hover:text-white"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>

        {showConfig ? (
          <ServerConfig
            onClose={() => setShowConfig(false)}
            onSave={initializeMCP}
          />
        ) : (
          <ToolPanel
            tools={availableTools}
            selectedTools={selectedTools}
            onToggleTool={(toolName) => {
              setSelectedTools((prev) =>
                prev.includes(toolName)
                  ? prev.filter((t) => t !== toolName)
                  : [...prev, toolName]
              );
            }}
          />
        )}
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-gray-800 border-b border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-white">
                Alloy MCP Chat
              </h1>
              <p className="text-sm text-gray-400">
                {mcpClient ? "Connected" : "Connecting..."} •{" "}
                {selectedTools.length} tools active
              </p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-900">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <Bot className="w-16 h-16 mb-4" />
              <p className="text-lg text-gray-300">
                Start a conversation with Alloy MCP
              </p>
              <p className="text-sm mt-2 text-gray-400">
                Select tools from the sidebar to enhance capabilities
              </p>
            </div>
          ) : (
            <MessageList messages={messages} />
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="bg-gray-800 border-t border-gray-700 p-4">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
              placeholder="Type your message..."
              className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 text-white placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading || !mcpClient}
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !mcpClient || !input.trim()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
