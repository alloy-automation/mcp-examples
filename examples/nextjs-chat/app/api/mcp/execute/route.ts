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
    const { serverUrl, toolName, arguments: toolArgs } = await request.json();

    if (!serverUrl || !toolName) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Execute tool using real MCP server
    const response = await makeRequest(serverUrl, "tools/call", {
      name: toolName,
      arguments: toolArgs || {},
    });

    if (response.error) {
      throw new Error(`Tool execution failed: ${response.error.message}`);
    }

    return NextResponse.json({
      content: response.result?.content || []
    });
  } catch (error) {
    console.error('Error executing tool:', error);
    return NextResponse.json(
      { error: `Failed to execute tool: ${error}` },
      { status: 500 }
    );
  }
}