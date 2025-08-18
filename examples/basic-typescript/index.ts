import * as dotenv from "dotenv";
import { resolve } from "path";

// Load .env from project root
dotenv.config({ path: resolve(__dirname, "../../.env") });

interface MCPRequest {
  jsonrpc: string;
  method: string;
  params?: any;
  id: number;
}

class AlloyMCPClient {
  private serverUrl: string;
  private requestId: number = 1;

  constructor() {
    this.serverUrl = process.env.NEXT_PUBLIC_MCP_SERVER_URL || "";
    if (!this.serverUrl) {
      throw new Error(
        "NEXT_PUBLIC_MCP_SERVER_URL environment variable is required"
      );
    }
  }

  private async makeRequest(method: string, params?: any): Promise<any> {
    const request: MCPRequest = {
      jsonrpc: "2.0",
      method,
      id: this.requestId++,
      ...(params && { params }),
    };

    console.log(`🔄 Making MCP request: ${method}`);

    try {
      const response = await fetch(this.serverUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json,text/event-stream",
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Handle Server-Sent Events response
      const contentType = response.headers.get("content-type");
      if (contentType?.includes("text/event-stream")) {
        const text = await response.text();
        // Parse SSE format: "event: message\ndata: {...}\n\n"
        const dataMatch = text.match(/data: (.+)/);
        if (dataMatch) {
          return JSON.parse(dataMatch[1]);
        }
      } else {
        // Handle regular JSON response
        return await response.json();
      }
    } catch (error) {
      console.error(`❌ Request failed:`, error);
      throw error;
    }
  }

  async initialize(): Promise<void> {
    console.log("🚀 Initializing connection to Alloy MCP Server...");

    try {
      const response = await this.makeRequest("initialize", {
        protocolVersion: "2024-11-05",
        capabilities: {},
        clientInfo: {
          name: "alloy-mcp-basic-example",
          version: "1.0.0",
        },
      });

      if (response.error) {
        throw new Error(`Initialization failed: ${response.error.message}`);
      }

      console.log("✅ Connected to Alloy MCP Server");
      console.log(
        `📋 Server: ${response.result?.serverInfo?.name || "Unknown"}`
      );

      if (response.result?.instructions) {
        console.log(`💡 Instructions: ${response.result.instructions}`);
      }
    } catch (error) {
      console.error("❌ Failed to initialize:", error);
      throw error;
    }
  }

  async listAvailableTools(): Promise<any[]> {
    try {
      const response = await this.makeRequest("tools/list");

      if (response.error) {
        throw new Error(`Failed to list tools: ${response.error.message}`);
      }

      const tools = response.result?.tools || [];
      console.log(`\n📋 Available Tools (${tools.length}):`);
      tools.forEach((tool: any) => {
        console.log(`  - ${tool.name}: ${tool.description}`);
      });

      return tools;
    } catch (error) {
      console.error("❌ Failed to list tools:", error);
      throw error;
    }
  }

  async listResources(): Promise<void> {
    try {
      const response = await this.makeRequest("resources/list");

      if (response.error) {
        throw new Error(`Failed to list resources: ${response.error.message}`);
      }

      const resources = response.result?.resources || [];
      console.log(`\n📚 Available Resources (${resources.length}):`);
      resources.forEach((resource: any) => {
        console.log(
          `  - ${resource.name}: ${resource.description || "No description"}`
        );
      });
    } catch (error) {
      console.error("❌ Failed to list resources:", error);
      throw error;
    }
  }

  async executeTool(toolName: string, args: any): Promise<any> {
    console.log(`\n🔧 Executing tool: ${toolName}`);

    try {
      const response = await this.makeRequest("tools/call", {
        name: toolName,
        arguments: args,
      });

      if (response.error) {
        throw new Error(`Tool execution failed: ${response.error.message}`);
      }

      console.log("✅ Tool execution successful");
      return response.result;
    } catch (error) {
      console.error(`❌ Failed to execute tool ${toolName}:`, error);
      throw error;
    }
  }

  async listPrompts(): Promise<any[]> {
    try {
      const response = await this.makeRequest("prompts/list");

      if (response.error) {
        throw new Error(`Failed to list prompts: ${response.error.message}`);
      }

      const prompts = response.result?.prompts || [];
      console.log(`\n💬 Available Prompts (${prompts.length}):`);
      prompts.forEach((prompt: any) => {
        console.log(
          `  - ${prompt.name}: ${prompt.description || "No description"}`
        );
      });

      return prompts;
    } catch (error) {
      console.error("❌ Failed to list prompts:", error);
      throw error;
    }
  }
}

// Demo functions
async function demonstrateConnectivity(client: AlloyMCPClient): Promise<void> {
  console.log("\n" + "=".repeat(50));
  console.log("🔗 CONNECTIVITY API DEMO");
  console.log("=".repeat(50));

  try {
    // List available connectors
    const result1 = await client.executeTool("list_connectors_alloy", {});
    console.log("\n📱 Available Connectors:");
    console.log(JSON.stringify(result1, null, 2));

    // Get connector resources (for Slack)
    const result2 = await client.executeTool("get_connector_resources_alloy", {
      connectorId: "slack",
    });
    console.log("\n⚡ Slack Actions:");
    console.log(JSON.stringify(result2, null, 2));
  } catch (error) {
    console.error("❌ Connectivity demo failed:", error);
  }
}

async function demonstrateCredentials(client: AlloyMCPClient): Promise<void> {
  console.log("\n" + "=".repeat(50));
  console.log("🔐 CREDENTIALS API DEMO");
  console.log("=".repeat(50));

  try {
    // Get credentials to demonstrate the workflow
    const result1 = await client.executeTool("get_credentials_alloy", {
      connectorId: "slack",
    });
    console.log("\n🔐 Slack Credentials:");
    console.log(JSON.stringify(result1, null, 2));

    // Get credential metadata
    const result2 = await client.executeTool("get_credential_metadata_alloy", {
      connectorId: "slack",
    });
    console.log("\n📋 Slack Auth Requirements:");
    console.log(JSON.stringify(result2, null, 2));
  } catch (error) {
    console.error("❌ Credentials demo failed:", error);
  }
}

async function demonstrateDiscovery(client: AlloyMCPClient): Promise<void> {
  console.log("\n" + "=".repeat(50));
  console.log("🔍 DISCOVERY & PROMPTS DEMO");
  console.log("=".repeat(50));

  try {
    await client.listPrompts();

    // Since resources/list is not supported, let's demonstrate action discovery instead
    const result = await client.executeTool("discover_action_path_alloy", {
      goal: "send a message to a Slack channel",
    });
    console.log("\n🔍 Action Discovery for 'send Slack message':");
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error("❌ Prompts & discovery demo failed:", error);
  }
}

async function main(): Promise<void> {
  console.log("🚀 Alloy MCP Basic TypeScript Example\n");

  try {
    const client = new AlloyMCPClient();

    // Initialize connection
    await client.initialize();

    // List available tools first
    await client.listAvailableTools();

    // Run demonstrations
    await demonstrateConnectivity(client);
    await demonstrateCredentials(client);
    await demonstrateDiscovery(client);

    console.log("\n✨ All demonstrations completed!");
  } catch (error) {
    console.error("❌ Main execution failed:", error);
    process.exit(1);
  }
}

// Run the example
if (require.main === module) {
  main().catch(console.error);
}
