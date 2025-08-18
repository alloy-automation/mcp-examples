# Next.js Chat Application with Alloy MCP

A full-featured chat application built with Next.js 14 and Alloy MCP integration.

## Features

- 🎨 Modern, responsive UI with Tailwind CSS
- 🌙 Dark mode interface for comfortable usage
- 💬 Real-time chat interface
- 🔧 Dynamic tool discovery and execution (real data)
- 🔄 Real MCP server integration using JSON-RPC protocol
- 📊 Tool execution visualization
- 💾 Message history
- ⚙️ Server configuration UI
- 🔍 Tool search and filtering
- ✨ Markdown support for messages
- 🔗 Environment variable loading from parent directory
- 🚀 Real-time connection to Alloy MCP servers

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm or npm
- Alloy API key

### Installation

1. Install dependencies:

```bash
pnpm install
```

2. Configure environment variables:

This application automatically loads environment variables from the parent directory's `.env` file (`../../.env`). If you prefer local configuration, create a `.env.local` file:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your credentials:

```env
NEXT_PUBLIC_ALLOY_API_KEY=your_api_key_here
NEXT_PUBLIC_MCP_SERVER_URL=https://mcp.runalloy.com
NEXT_PUBLIC_MCP_SERVER_URL=https://mcp.runalloy.com
```

**Note:** The application is configured to load environment variables from the root `.env` file by default through `next.config.js`. This allows sharing configurations across multiple examples.

3. Install dotenv dependency (required for environment variable loading):

```bash
npm install dotenv
```

4. Run the development server:

```bash
pnpm dev
```

5. Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
nextjs-chat/
├── app/                    # Next.js 14 app directory
│   ├── api/               # API routes
│   │   └── mcp/          # MCP-related endpoints
│   ├── globals.css       # Global styles
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Main chat page (dark mode)
├── components/            # React components
│   ├── MessageList.tsx   # Message display component (dark mode)
│   ├── ToolPanel.tsx     # Tool selection panel (dark mode)
│   └── ServerConfig.tsx  # Server configuration UI (dark mode)
├── lib/                   # Utility libraries
│   └── mcp-client.ts     # MCP client implementation
├── types/                 # TypeScript type definitions
│   └── index.ts          # Shared types
├── next.config.js         # Next.js config with env loading
└── public/               # Static assets
```

## Key Components

### MCP Client (`lib/mcp-client.ts`)

The MCP client handles:

- JSON-RPC connection to real MCP servers
- Tool discovery and caching from live server
- Real tool execution with server-side processing
- Enhanced tool matching for Alloy-specific tools
- Response generation

### Message List (`components/MessageList.tsx`)

Displays chat messages with:

- Role-based styling (user, assistant, system, tool)
- Markdown rendering
- Tool execution results
- Timestamps

### Tool Panel (`components/ToolPanel.tsx`)

Manages available tools:

- Search and filter tools
- Category grouping
- Selection management
- Tool descriptions

### Server Configuration (`components/ServerConfig.tsx`)

Configure MCP connection:

- Server URL input
- API key management
- Connection testing
- Advanced settings

## Usage

### Basic Chat

1. Type a message in the input field
2. Press Enter or click Send
3. The app will determine which tools to invoke based on your message
4. View tool executions and responses in the chat

### Tool Selection

1. Click on tools in the sidebar to enable/disable them
2. Use the search bar to find specific tools
3. Expand categories to see grouped tools
4. Selected tools will be available for the chat to use

### Server Configuration

1. Click the settings icon in the sidebar
2. Enter your Alloy server URL and API key
3. Test the connection
4. Save configuration

## API Routes

### `/api/mcp/connect`

Initializes connection to MCP server and lists available tools.

**Request:**

```json
{
  "serverUrl": "https://mcp.runalloy.com/mcp/your-server/token",
  "apiKey": "not_used_url_contains_auth"
}
```

**Response:**

```json
{
  "success": true,
  "tools": [
    {
      "name": "list_connectors_alloy",
      "description": "Discover available integration connectors",
      "category": "connectivity",
      "inputSchema": {...}
    }
  ]
}
```

### `/api/mcp/execute`

Executes tools on the real MCP server.

**Request:**

```json
{
  "serverUrl": "https://mcp.runalloy.com/mcp/your-server/token",
  "toolName": "list_connectors_alloy",
  "arguments": {}
}
```

### `/api/mcp/test`

Tests connection using JSON-RPC initialize call.

## Customization

### Styling

The application uses a dark theme by default. Modify `tailwind.config.js` to customize colors:

```js
theme: {
  extend: {
    colors: {
      'alloy-blue': '#2563eb',
      'alloy-purple': '#7c3aed',
      'dark-bg': '#111827',      // Custom dark background
      'dark-card': '#1f2937',    // Custom dark cards
    }
  }
}
```

**Dark Mode Classes Used:**

- `bg-gray-900` - Main background
- `bg-gray-800` - Sidebar and header
- `bg-gray-700` - Input fields and buttons
- `text-white` - Primary text
- `text-gray-300` - Secondary text
- `border-gray-700` - Borders

### Tool Categories

Edit the `Tool` type in `types/index.ts` to add custom categories:

```typescript
interface Tool {
  category?: "connectivity" | "embedded" | "workflow" | "custom";
}
```

## Deployment

### Vercel

```bash
vercel deploy
```

### Docker

```bash
docker build -t alloy-chat .
docker run -p 3000:3000 alloy-chat
```

## Troubleshooting

### Environment Variable Issues

1. Ensure the root `.env` file exists at `../../.env`
2. Check that `dotenv` package is installed
3. Verify `next.config.js` is correctly configured
4. Restart the development server after env changes

### Connection Issues

1. Verify your API key is correct
2. Check the server URL format
3. Ensure your network allows WebSocket connections
4. Check browser console for detailed errors

### Tool Execution Errors

1. Check tool parameters in the console
2. Verify tool permissions
3. Review server logs for detailed error messages

### Dark Mode Issues

1. Clear browser cache if styles appear incorrect
2. Check that Tailwind CSS is properly configured
3. Verify component classes are using dark mode variants

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT
