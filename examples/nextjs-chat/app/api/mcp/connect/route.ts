import { NextRequest, NextResponse } from 'next/server';

interface MCPRequest {
  jsonrpc: string;
  method: string;
  params?: any;
  id: number;
}

async function makeRequest(serverUrl: string, method: string, params?: any): Promise<any> {
  const request: MCPRequest = {
    jsonrpc: "2.0",
    method,
    id: Math.floor(Math.random() * 1000000),
    ...(params && { params }),
  };

  const response = await fetch(serverUrl, {
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
}

export async function POST(request: NextRequest) {
  try {
    const { serverUrl, apiKey } = await request.json();

    if (!serverUrl) {
      return NextResponse.json(
        { error: 'Missing server URL' },
        { status: 400 }
      );
    }

    // Initialize connection to real MCP server
    const initResponse = await makeRequest(serverUrl, "initialize", {
      protocolVersion: "2024-11-05",
      capabilities: {},
      clientInfo: {
        name: "alloy-mcp-nextjs-chat",
        version: "1.0.0",
      },
    });

    if (initResponse.error) {
      throw new Error(`Initialization failed: ${initResponse.error.message}`);
    }

    // List available tools
    const toolsResponse = await makeRequest(serverUrl, "tools/list");
    
    if (toolsResponse.error) {
      throw new Error(`Failed to list tools: ${toolsResponse.error.message}`);
    }

    const tools = toolsResponse.result?.tools || [];

    // Transform tools to match our interface
    const transformedTools = tools.map((tool: any) => ({
      name: tool.name,
      description: tool.description,
      category: getCategoryFromToolName(tool.name),
      inputSchema: tool.inputSchema
    }));

    return NextResponse.json({
      success: true,
      tools: transformedTools
    });
  } catch (error) {
    console.error('Error connecting to MCP server:', error);
    return NextResponse.json(
      { error: `Failed to connect to MCP server: ${error}` },
      { status: 500 }
    );
  }
}

function getCategoryFromToolName(name: string): string {
  if (name.includes('connector') || name.includes('credential')) return 'connectivity';
  if (name.includes('workflow') || name.includes('embedded')) return 'embedded';
  if (name.includes('discover')) return 'discovery';
  return 'general';
}