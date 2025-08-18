# Basic TypeScript MCP Example

A foundational TypeScript example demonstrating direct integration with Alloy MCP servers using the standard JSON-RPC protocol.

## Features

- 🚀 **Pure TypeScript Implementation** - Clean, well-typed MCP client
- 📡 **JSON-RPC Protocol** - Standard MCP communication protocol
- 🔍 **Tool Discovery** - Dynamic discovery of available tools from server
- ⚡ **Real Tool Execution** - Execute actual Alloy connector tools
- 🛡️ **Error Handling** - Comprehensive error handling with detailed logging
- 📊 **Server-Sent Events** - Proper handling of SSE responses
- 🔐 **Credential Management** - Demonstrate authentication workflows
- 🎯 **Action Discovery** - Discover API paths for specific goals

## Prerequisites

- Node.js 18+
- npm, yarn, or pnpm
- MCP server URL and access token

## Installation

1. Install dependencies:

```bash
npm install
```

2. Configure environment variables:

Ensure the root `.env` file contains:

```env
MCP_SERVER_URL=https://mcp.runalloy.com/mcp/your-server-id/your-access-token
MCP_ACCESS_TOKEN=your_access_token
```

3. Run the example:

```bash
npm start
# or
npx ts-node index.ts
```

## Usage

The example will run through several demonstrations:

```
🚀 Alloy MCP Basic TypeScript Example

Initializing connection to Alloy MCP Server...
✅ Connected to Alloy MCP Server
📋 Server: Alloy Connectivity MCP Server

📋 Available Tools (8):
  - list_connectors_alloy: Discover available integration connectors
  - get_connector_resources_alloy: Explore available API actions
  - execute_action_alloy: Execute API actions on connected platforms
  - create_credential_alloy: Establish authentication with platforms
```

## Code Structure

### AlloyMCPClient Class

The core client implementation handles all MCP communication:

```typescript
class AlloyMCPClient {
  private serverUrl: string;
  private requestId: number = 1;

  constructor() {
    this.serverUrl = process.env.MCP_SERVER_URL || "";
  }

  private async makeRequest(method: string, params?: any): Promise<any>
  async initialize(): Promise<void>
  async listAvailableTools(): Promise<any[]>
  async executeTool(toolName: string, args: any): Promise<any>
  async listResources(): Promise<void>
  async listPrompts(): Promise<any[]>
}
```

### JSON-RPC Implementation

Standard MCP protocol implementation:

```typescript
interface MCPRequest {
  jsonrpc: string;  // "2.0"
  method: string;   // "initialize", "tools/list", "tools/call"
  params?: any;     // Method parameters
  id: number;       // Request identifier
}
```

### Server-Sent Events Handling

Properly handles both SSE and JSON responses:

```typescript
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
```

## Available Demonstrations

### 1. Connectivity API Demo

Explores available connectors and their resources:

```typescript
// List available connectors
const result1 = await client.executeTool("list_connectors_alloy", {});

// Get connector resources (for Slack)
const result2 = await client.executeTool("get_connector_resources_alloy", {
  connectorId: "slack",
});
```

**Example Output:**
```json
{
  "connectors": [
    {
      "id": "notion",
      "name": "Notion",
      "category": ["content-management"]
    },
    {
      "id": "hubspot", 
      "name": "Hubspot",
      "category": ["crm"]
    },
    {
      "id": "slack",
      "name": "Slack", 
      "category": ["communication"]
    }
  ]
}
```

### 2. Credentials API Demo

Demonstrates authentication workflow management:

```typescript
// Get credentials for a connector
const result1 = await client.executeTool("get_credentials_alloy", {
  connectorId: "slack",
});

// Get credential metadata (auth requirements)
const result2 = await client.executeTool("get_credential_metadata_alloy", {
  connectorId: "slack",
});
```

### 3. Discovery & Prompts Demo

Shows action discovery capabilities:

```typescript
// Discover action paths for specific goals
const result = await client.executeTool("discover_action_path_alloy", {
  goal: "send a message to a Slack channel",
});
```

## Available Tools

The example dynamically discovers tools from the Alloy MCP server:

- **`list_connectors_alloy`** - Discover available integration connectors (Slack, Notion, HubSpot, etc.)
- **`get_connector_resources_alloy`** - Explore API actions and resources for specific connectors
- **`get_action_details_alloy`** - Get detailed parameter requirements for actions
- **`execute_action_alloy`** - Execute API actions on connected platforms
- **`create_credential_alloy`** - Establish OAuth2/API key authentication
- **`get_credentials_alloy`** - List existing credentials for connectors
- **`get_credential_metadata_alloy`** - Get authentication requirements
- **`discover_action_path_alloy`** - Discover API paths for specific integration goals

## Error Handling

Comprehensive error handling with detailed logging:

```typescript
try {
  const response = await this.makeRequest(method, params);
  if (response.error) {
    throw new Error(`Request failed: ${response.error.message}`);
  }
  return response.result;
} catch (error) {
  console.error(`❌ Request failed:`, error);
  throw error;
}
```

## Protocol Details

### Standard MCP Methods

- **`initialize`** - Establish connection with protocol version and capabilities
- **`tools/list`** - Discover available tools from server
- **`tools/call`** - Execute specific tools with parameters
- **`resources/list`** - List available resources (if supported)
- **`prompts/list`** - List available prompts (if supported)

### Request Format

```json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "list_connectors_alloy",
    "arguments": {}
  },
  "id": 123
}
```

### Response Format

```json
{
  "jsonrpc": "2.0", 
  "result": {
    "content": [
      {
        "type": "text",
        "text": "{...connector data...}"
      }
    ]
  },
  "id": 123
}
```

## Environment Variables

Required environment variables:

- `MCP_SERVER_URL` - Full MCP server URL with embedded authentication token
- `MCP_ACCESS_TOKEN` - Access token (optional, usually embedded in URL)

## Example Output

```
🚀 Alloy MCP Basic TypeScript Example

🔄 Making MCP request: initialize
✅ Connected to Alloy MCP Server
📋 Server: Alloy Connectivity MCP Server

🔄 Making MCP request: tools/list
📋 Available Tools (8):
  - list_connectors_alloy: Discover available integration connectors
  - get_connector_resources_alloy: Explore available API actions
  - execute_action_alloy: Execute API actions on connected platforms
  - create_credential_alloy: Establish authentication with platforms

==================================================
🔗 CONNECTIVITY API DEMO
==================================================

🔄 Making MCP request: tools/call
🔧 Executing tool: list_connectors_alloy
✅ Tool execution successful

📱 Available Connectors:
{
  "connectors": [
    {
      "id": "notion",
      "name": "Notion", 
      "category": ["content-management"]
    }
  ],
  "count": 3,
  "message": "Found 3 available connectors"
}
```

## Troubleshooting

### Connection Issues

1. Verify `MCP_SERVER_URL` is correct and contains the full path with token
2. Check network connectivity to the MCP server
3. Ensure the access token is valid and not expired

### Tool Execution Errors

1. Check tool parameters match the expected schema
2. Verify tool name spelling (case-sensitive)
3. Review server logs for detailed error messages

### TypeScript Compilation

```bash
npx tsc --noEmit  # Check for type errors
```

## Integration Patterns

This example serves as the reference implementation for:

- Next.js API routes integration
- Python SDK implementation
- Custom MCP client development

The clean TypeScript implementation makes it easy to understand the core MCP protocol and adapt for other platforms.

## License

MIT License - see root project for details.