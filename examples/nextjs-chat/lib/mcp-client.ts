export interface Tool {
  name: string;
  description: string;
  inputSchema?: any;
  category?: string;
}

export interface ToolResult {
  content: any;
  isError?: boolean;
}

export interface MCPClientConfig {
  serverUrl: string;
  apiKey: string;
}

export class MCPClient {
  private config: MCPClientConfig;
  private connected: boolean = false;
  private availableTools: Tool[] = [];

  constructor(config: MCPClientConfig) {
    this.config = config;
  }

  async connect(): Promise<void> {
    if (this.connected) return;

    try {
      // For browser environment, we'll use fetch API to communicate with MCP server
      // This would typically go through your Next.js API routes
      const response = await fetch("/api/mcp/connect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          serverUrl: this.config.serverUrl,
          apiKey: this.config.apiKey,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to connect to MCP server");
      }

      const data = await response.json();
      this.availableTools = data.tools || [];
      this.connected = true;

      console.log("Connected to MCP server");
    } catch (error) {
      console.error("Failed to connect to MCP server:", error);
      throw error;
    }
  }

  async getAvailableTools(): Promise<Tool[]> {
    if (!this.connected) {
      await this.connect();
    }
    return this.availableTools;
  }

  async executeTool(name: string, args: any): Promise<ToolResult> {
    if (!this.connected) {
      throw new Error("Not connected to MCP server");
    }

    try {
      const response = await fetch("/api/mcp/execute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          serverUrl: this.config.serverUrl,
          apiKey: this.config.apiKey,
          toolName: name,
          arguments: args,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to execute tool: ${name}`);
      }

      const result = await response.json();
      return {
        content: result.content,
        isError: false,
      };
    } catch (error: any) {
      console.error(`Error executing tool ${name}:`, error);
      return {
        content: { error: error.message },
        isError: true,
      };
    }
  }

  async determineTools(
    message: string,
    availableTools: string[]
  ): Promise<Array<{ name: string; arguments: any }>> {
    // Enhanced heuristics for Alloy MCP tools
    const toolsToInvoke: Array<{ name: string; arguments: any }> = [];

    // Connector/Integration related
    if (message.toLowerCase().includes("connector") || 
        message.toLowerCase().includes("integration") ||
        message.toLowerCase().includes("list integrations")) {
      if (availableTools.includes("list_connectors_alloy")) {
        toolsToInvoke.push({
          name: "list_connectors_alloy",
          arguments: {}
        });
      }
    }

    // Credentials related
    if (message.toLowerCase().includes("credential") ||
        message.toLowerCase().includes("auth") ||
        message.toLowerCase().includes("authentication")) {
      const connectorMatch = message.match(/\b(slack|salesforce|hubspot|shopify)\b/i);
      if (connectorMatch && availableTools.includes("get_credentials_alloy")) {
        toolsToInvoke.push({
          name: "get_credentials_alloy",
          arguments: { connectorId: connectorMatch[1].toLowerCase() }
        });
      }
    }

    // Discovery related
    if (message.toLowerCase().includes("discover") ||
        message.toLowerCase().includes("how to") ||
        message.toLowerCase().includes("send message")) {
      if (availableTools.includes("discover_action_path_alloy")) {
        toolsToInvoke.push({
          name: "discover_action_path_alloy",
          arguments: { goal: message }
        });
      }
    }

    // Slack specific actions
    if (message.toLowerCase().includes("slack")) {
      if (availableTools.includes("get_connector_resources_alloy")) {
        toolsToInvoke.push({
          name: "get_connector_resources_alloy",
          arguments: { connectorId: "slack" }
        });
      }
    }

    return toolsToInvoke;
  }

  async generateResponse(
    messages: any[],
    currentMessage: string,
    toolResults?: any[]
  ): Promise<string> {
    // Generate a response based on the context
    // In a real implementation, this would call an LLM API

    if (toolResults && toolResults.length > 0) {
      return `Based on the tool execution results, here's what I found:\n\n${JSON.stringify(
        toolResults[0],
        null,
        2
      )}`;
    }

    // Simple response generation
    const responses = [
      "I can help you with Alloy integrations and workflows.",
      "Let me check that for you using the available tools.",
      "I've processed your request using Alloy MCP.",
    ];

    return responses[Math.floor(Math.random() * responses.length)];
  }

  async disconnect(): Promise<void> {
    if (this.connected) {
      this.connected = false;
      this.availableTools = [];
      console.log("Disconnected from MCP server");
    }
  }
}
