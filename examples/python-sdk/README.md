# Alloy MCP Python SDK Example

A comprehensive Python example demonstrating how to interact with Alloy MCP servers using Python and asyncio.

## Features

- 🐍 **Pure Python Implementation** - Uses aiohttp for async HTTP requests
- 🔧 **Real Tool Execution** - Connects to actual Alloy MCP servers
- 📊 **JSON-RPC Protocol** - Implements MCP standard communication
- 📋 **Dynamic Tool Discovery** - Discovers tools from live server
- 🔗 **Connection Management** - Proper session handling and cleanup
- ⚡ **Real-time Results** - Execute actual tools and get server responses
- 🛡️ **Error Handling** - Comprehensive error handling and recovery

## Prerequisites

- Python 3.8+
- pip or pipenv
- MCP server URL and access token

## Installation

1. Install dependencies:

```bash
pip install -r requirements.txt
```

2. Configure environment variables:

The application loads environment variables from the root `.env` file (`../../.env`). Ensure these variables are set:

```env
MCP_SERVER_URL=https://mcp.runalloy.com/mcp/your-server-id/your-access-token
MCP_ACCESS_TOKEN=your_access_token
```

## Usage

Run the example:

```bash
python3 main.py
```

The example will demonstrate:

1. **Connectivity Server Demo** - Connect to real MCP server and discover available tools
2. **Tool Execution** - Execute real Alloy connector tools (list_connectors_alloy, etc.)
3. **Resources Demo** - Access server resources and documentation

**Sample Output:**
```
🚀 Alloy MCP Python SDK Example

=== Connectivity Server Demo ===
🔗 Initializing connection to Alloy MCP Server...
✅ Connected to Alloy MCP Server
📋 Discovered 8 tools

Available tools:
  - list_connectors_alloy: Discover available integration connectors
  - get_connector_resources_alloy: Explore available API actions
  - execute_action_alloy: Execute API actions on connected platforms
  - create_credential_alloy: Establish authentication with platforms

🔧 Executing tool: list_connectors_alloy
   ✅ Success

Tool execution successful: list_connectors_alloy
Result: Found 3 available connectors (Notion, HubSpot, Slack)
```

## Code Structure

### AlloyMCPClient Class

The main client class that handles:

```python
client = AlloyMCPClient(
    server_url=os.getenv('MCP_SERVER_URL'),
    api_key=os.getenv('MCP_ACCESS_TOKEN')
)

await client.connect()
tools = await client.list_tools()
result = await client.execute_tool('connectivity.listIntegrations', {'limit': 10})
```

### Available Tools

The example discovers real tools from the Alloy MCP server:

- `list_connectors_alloy` - Discover available integration connectors (Slack, Notion, HubSpot, etc.)
- `get_connector_resources_alloy` - Explore API actions for specific connectors
- `get_action_details_alloy` - Get detailed parameter requirements for actions
- `execute_action_alloy` - Execute API actions on connected platforms
- `create_credential_alloy` - Establish authentication with external platforms
- `get_credentials_alloy` - List existing credentials
- `get_credential_metadata_alloy` - Get auth requirements for connectors
- `discover_action_path_alloy` - Discover API paths for specific goals

### Workflow Executor

Complex workflow orchestration:

```python
executor = WorkflowExecutor(client)
await executor.data_pipeline_workflow()
await executor.sync_contacts_workflow()
```

## Example Workflows

### Data Pipeline Workflow

```python
# Create a scheduled workflow
workflow = await client.execute_tool('embedded.createWorkflow', {
    'name': 'Daily Data Pipeline',
    'trigger': {'type': 'schedule', 'schedule': '0 9 * * *'},
    'steps': [
        {'id': 'extract', 'type': 'extract', 'config': {...}},
        {'id': 'transform', 'type': 'transform', 'config': {...}},
        {'id': 'load', 'type': 'load', 'config': {...}}
    ]
})

# Execute and monitor
execution = await client.execute_tool('embedded.executeWorkflow', {
    'workflowId': workflow_id
})
```

### Contact Sync Workflow

```python
# Sync contacts between CRM systems
async def sync_contacts_workflow(self):
    # 1. List integrations
    integrations = await self.client.execute_tool('connectivity.listIntegrations', {})
    
    # 2. Create connections
    source = await self.client.execute_tool('connectivity.createConnection', {
        'integrationId': 'salesforce',
        'name': 'Salesforce Production'
    })
    
    # 3. Fetch and transform data
    contacts = await self.client.execute_tool('connectivity.getData', {
        'connectionId': source_id,
        'object': 'Contact'
    })
```

## Output Example

```
🚀 Alloy MCP Python SDK Example

=== Connectivity Server Demo ===
🔗 Testing connection to Alloy MCP Server...
✅ Connected to Alloy MCP Server
📋 Loaded 5 demo tools

Available tools:
  - connectivity.listIntegrations: List available integrations in your workspace
  - connectivity.createConnection: Create a new connection to an integration
  - connectivity.getData: Fetch data from a connected integration

🔧 Executing tool: connectivity.listIntegrations
   Arguments: {"limit": 3, "category": "crm"}
   ✅ Success (mock data)

Found 1 CRM integrations
```

## Real Implementation Features

This example connects to actual Alloy MCP servers:

1. **JSON-RPC Protocol** - Uses standard MCP communication protocol
2. **Server-Sent Events** - Handles SSE responses properly
3. **Real Tool Discovery** - Dynamically discovers available tools from server
4. **Live Tool Execution** - Executes actual tools and returns server responses
5. **Error Handling** - Comprehensive error handling for network and server errors

## Error Handling

The client includes comprehensive error handling:

- Connection timeouts
- HTTP error responses
- Tool execution failures
- Resource access errors

## Extending the Example

To add new tools or workflows:

1. Add tool definitions to `_create_mock_tools()`
2. Add mock responses to `execute_tool()`
3. Create new workflow methods in `WorkflowExecutor`

## Environment Variables

Required environment variables:

- `MCP_SERVER_URL` - Full MCP server URL with authentication
- `MCP_ACCESS_TOKEN` - Access token (included in URL for this implementation)

## Troubleshooting

### Connection Issues

1. Verify `MCP_SERVER_URL` is correct and accessible
2. Check that `MCP_ACCESS_TOKEN` is valid
3. Ensure network connectivity to the MCP server

### Import Errors

```bash
pip install aiohttp python-dotenv
```

### Environment Variables Not Found

Ensure the root `.env` file exists at `../../.env` relative to this script.

## Dependencies

- `aiohttp` - Async HTTP client
- `python-dotenv` - Environment variable loading
- `asyncio` - Async programming support (built-in)

## License

MIT License - see root project for details.