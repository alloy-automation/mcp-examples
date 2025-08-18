#!/usr/bin/env python3
"""
Alloy MCP Python SDK Example
Demonstrates how to connect and interact with Alloy MCP servers using Python

This example includes:
- Connection testing with mock data support
- Tool discovery and execution
- Complex workflow orchestration
- Resource access and management
- Comprehensive error handling

Note: This example uses mock data for demonstration purposes.
For production use, implement full MCP protocol with SSE/WebSocket support.
"""

import asyncio
import json
import os
import re
from typing import Dict, List, Any, Optional
from dataclasses import dataclass
from datetime import datetime
import aiohttp
from dotenv import load_dotenv

# Load environment variables from project root
load_dotenv(os.path.join(os.path.dirname(__file__), "../..", ".env"))


@dataclass
class Tool:
    """Represents an MCP tool"""
    name: str
    description: str
    input_schema: Dict[str, Any]


@dataclass
class ToolResult:
    """Result from tool execution"""
    content: List[Dict[str, Any]]
    is_error: bool = False


class AlloyMCPClient:
    """Python client for Alloy MCP servers"""
    
    def __init__(self, server_url: str, api_key: str):
        self.server_url = server_url
        self.api_key = api_key
        self.session: Optional[aiohttp.ClientSession] = None
        self.tools: List[Tool] = []
        self.connected = False
        self.request_id = 1
    
    async def connect(self):
        """Establish connection to MCP server"""
        self.session = aiohttp.ClientSession(
            headers={
                'Content-Type': 'application/json',
                'Accept': 'application/json,text/event-stream'
            }
        )
        
        print("🔗 Initializing connection to Alloy MCP Server...")
        
        # Initialize connection using MCP protocol
        await self._make_request("initialize", {
            "protocolVersion": "2024-11-05",
            "capabilities": {},
            "clientInfo": {
                "name": "alloy-mcp-python-example",
                "version": "1.0.0",
            },
        })
        
        self.connected = True
        print("✅ Connected to Alloy MCP Server")
        await self._discover_tools()
    
    async def _make_request(self, method: str, params: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Make a JSON-RPC request to the MCP server"""
        request_data = {
            "jsonrpc": "2.0",
            "method": method,
            "id": self.request_id,
        }
        if params:
            request_data["params"] = params
        
        self.request_id += 1
        
        async with self.session.post(self.server_url, json=request_data) as response:
            if not response.ok:
                raise ConnectionError(f"HTTP {response.status}: {response.reason}")
            
            # Handle Server-Sent Events response
            content_type = response.headers.get("content-type", "")
            if "text/event-stream" in content_type:
                text = await response.text()
                # Parse SSE format: "event: message\ndata: {...}\n\n"
                data_match = re.search(r'data: (.+)', text)
                if data_match:
                    return json.loads(data_match.group(1))
            else:
                # Handle regular JSON response
                return await response.json()
    
    async def _discover_tools(self):
        """Discover available tools from the server"""
        response = await self._make_request("tools/list")
        
        if "error" in response:
            raise ConnectionError(f"Failed to list tools: {response['error']['message']}")
        
        tools_data = response.get("result", {}).get("tools", [])
        self.tools = [
            Tool(
                name=tool["name"],
                description=tool["description"],
                input_schema=tool.get("inputSchema", {})
            )
            for tool in tools_data
        ]
        print(f"📋 Discovered {len(self.tools)} tools")
    
    async def _create_mock_tools(self):
        """Create mock tools for demonstration"""
        self.tools = [
            Tool(
                name='connectivity.listIntegrations',
                description='List available integrations in your workspace',
                input_schema={
                    'type': 'object',
                    'properties': {
                        'limit': {'type': 'number', 'default': 10},
                        'category': {'type': 'string', 'enum': ['crm', 'marketing', 'ecommerce']}
                    }
                }
            ),
            Tool(
                name='connectivity.createConnection',
                description='Create a new connection to an integration',
                input_schema={
                    'type': 'object',
                    'properties': {
                        'integrationId': {'type': 'string'},
                        'name': {'type': 'string'},
                        'config': {'type': 'object'}
                    },
                    'required': ['integrationId', 'name']
                }
            ),
            Tool(
                name='connectivity.getData',
                description='Fetch data from a connected integration',
                input_schema={
                    'type': 'object',
                    'properties': {
                        'connectionId': {'type': 'string'},
                        'object': {'type': 'string'},
                        'fields': {'type': 'array', 'items': {'type': 'string'}},
                        'limit': {'type': 'number', 'default': 100}
                    },
                    'required': ['connectionId', 'object']
                }
            ),
            Tool(
                name='embedded.createWorkflow',
                description='Create a new workflow definition',
                input_schema={
                    'type': 'object',
                    'properties': {
                        'name': {'type': 'string'},
                        'description': {'type': 'string'},
                        'steps': {'type': 'array'}
                    },
                    'required': ['name', 'steps']
                }
            ),
            Tool(
                name='embedded.executeWorkflow',
                description='Execute a workflow',
                input_schema={
                    'type': 'object',
                    'properties': {
                        'workflowId': {'type': 'string'},
                        'context': {'type': 'object'}
                    },
                    'required': ['workflowId']
                }
            )
        ]
        print(f"📋 Loaded {len(self.tools)} demo tools")
    
    async def list_tools(self) -> List[Tool]:
        """List all available tools"""
        return self.tools
    
    async def execute_tool(self, tool_name: str, arguments: Dict[str, Any]) -> ToolResult:
        """Execute a specific tool with arguments"""
        if not self.connected:
            raise RuntimeError("Not connected to MCP server")
        
        print(f"\n🔧 Executing tool: {tool_name}")
        print(f"   Arguments: {json.dumps(arguments, indent=2)}")
        
        try:
            response = await self._make_request("tools/call", {
                "name": tool_name,
                "arguments": arguments
            })
            
            if "error" in response:
                print(f"   ❌ Error: {response['error']['message']}")
                return ToolResult(
                    content=[{'type': 'text', 'text': response['error']['message']}],
                    is_error=True
                )
            
            result = ToolResult(content=response.get("result", {}).get("content", []))
            print(f"   ✅ Success")
            return result
            
        except Exception as error:
            print(f"   ❌ Error: {error}")
            return ToolResult(
                content=[{'type': 'text', 'text': str(error)}],
                is_error=True
            )
    
    async def get_resources(self) -> List[Dict[str, Any]]:
        """Get available resources from the server"""
        # Return mock resources for demonstration
        return [
            {'name': 'Integration Catalog', 'uri': 'alloy://integrations'},
            {'name': 'Workflow Templates', 'uri': 'alloy://workflows/templates'},
            {'name': 'Connection Health', 'uri': 'alloy://connections/health'},
            {'name': 'API Documentation', 'uri': 'alloy://docs/api'},
            {'name': 'Usage Analytics', 'uri': 'alloy://analytics/usage'}
        ]
    
    async def read_resource(self, uri: str) -> Dict[str, Any]:
        """Read a specific resource"""
        # Return mock resource data
        mock_data = {
            'alloy://integrations': {
                'content': 'Available integrations: Salesforce, HubSpot, Shopify, Slack, and 100+ more...',
                'type': 'text'
            },
            'alloy://workflows/templates': {
                'content': 'Workflow templates for data sync, lead routing, customer onboarding...',
                'type': 'text'
            }
        }
        return mock_data.get(uri, {'content': f'Resource content for {uri}', 'type': 'text'})
    
    async def disconnect(self):
        """Close the connection"""
        if self.session:
            await self.session.close()
            self.connected = False
            print("\n👋 Disconnected from Alloy MCP Server")


class WorkflowExecutor:
    """Execute complex workflows using MCP tools"""
    
    def __init__(self, client: AlloyMCPClient):
        self.client = client
    
    async def sync_contacts_workflow(self):
        """Example workflow: Sync contacts between systems"""
        print("\n=== Starting Contact Sync Workflow ===")
        
        # Step 1: List available integrations
        integrations = await self.client.execute_tool(
            'connectivity.listIntegrations',
            {'limit': 10, 'includeMetadata': True}
        )
        
        # Step 2: Create connections if needed
        source_connection = await self.client.execute_tool(
            'connectivity.createConnection',
            {
                'integrationId': 'salesforce',
                'name': 'Salesforce Production',
                'config': {
                    'instanceUrl': 'https://mycompany.salesforce.com',
                    'apiVersion': 'v59.0'
                }
            }
        )
        
        target_connection = await self.client.execute_tool(
            'connectivity.createConnection',
            {
                'integrationId': 'hubspot',
                'name': 'HubSpot Main',
                'config': {
                    'portalId': '123456'
                }
            }
        )
        
        # Step 3: Fetch contacts from source
        contacts = await self.client.execute_tool(
            'connectivity.getData',
            {
                'connectionId': source_connection.content[0]['data']['id'],
                'object': 'Contact',
                'fields': ['FirstName', 'LastName', 'Email', 'Phone'],
                'limit': 100
            }
        )
        
        # Step 4: Transform and send to target (simulated)
        print("   📊 Processing contact data...")
        simulated_contacts = [
            {'Email': 'john@example.com', 'FirstName': 'John', 'LastName': 'Doe', 'Phone': '555-1234'},
            {'Email': 'jane@example.com', 'FirstName': 'Jane', 'LastName': 'Smith', 'Phone': '555-5678'}
        ]
        
        for contact in simulated_contacts:
            transformed = {
                'email': contact['Email'],
                'firstname': contact['FirstName'],
                'lastname': contact['LastName'],
                'phone': contact['Phone']
            }
            print(f"   📤 Syncing contact: {contact['FirstName']} {contact['LastName']}")
            await asyncio.sleep(0.5)  # Simulate processing time
        
        print("✅ Contact sync workflow completed!")
    
    async def data_pipeline_workflow(self):
        """Example workflow: Data pipeline with transformations"""
        print("\n=== Starting Data Pipeline Workflow ===")
        
        # Create a workflow definition
        workflow = await self.client.execute_tool(
            'embedded.createWorkflow',
            {
                'name': 'Daily Data Pipeline',
                'description': 'Process and transform daily data',
                'trigger': {
                    'type': 'schedule',
                    'schedule': '0 9 * * *'  # Daily at 9 AM
                },
                'steps': [
                    {
                        'id': 'extract',
                        'type': 'extract',
                        'config': {
                            'source': 'database',
                            'query': 'SELECT * FROM orders WHERE date >= CURRENT_DATE - 1'
                        }
                    },
                    {
                        'id': 'transform',
                        'type': 'transform',
                        'config': {
                            'operations': [
                                {'type': 'filter', 'condition': 'amount > 100'},
                                {'type': 'aggregate', 'groupBy': 'customer_id', 'sum': 'amount'}
                            ]
                        }
                    },
                    {
                        'id': 'load',
                        'type': 'load',
                        'config': {
                            'destination': 'warehouse',
                            'table': 'daily_summary'
                        }
                    }
                ]
            }
        )
        
        # Execute the workflow
        execution = await self.client.execute_tool(
            'embedded.executeWorkflow',
            {
                'workflowId': workflow.content[0]['data']['id'],
                'context': {'debug': True}
            }
        )
        
        # Monitor execution (simulated)
        execution_id = execution.content[0]['data']['executionId']
        statuses = ['running', 'processing', 'finalizing', 'completed']
        
        for status in statuses:
            print(f"   Status: {status}")
            await asyncio.sleep(1)  # Simulate processing time
        
        print("✅ Data pipeline workflow completed!")


async def demonstrate_connectivity():
    """Demonstrate connectivity server features"""
    print("\n=== Connectivity Server Demo ===")
    
    client = AlloyMCPClient(
        server_url=os.getenv('NEXT_PUBLIC_MCP_SERVER_URL', ''),
        api_key=os.getenv('NEXT_PUBLIC_MCP_ACCESS_TOKEN', '')
    )
    
    try:
        await client.connect()
        
        # List tools
        tools = await client.list_tools()
        print("\nAvailable tools:")
        for tool in tools[:5]:  # Show first 5
            print(f"  - {tool.name}: {tool.description}")
        
        # Execute some tools
        if tools:
            # Try to execute the first available tool
            first_tool = tools[0]
            result = await client.execute_tool(first_tool.name, {})
            
            if not result.is_error:
                print(f"\nTool execution successful: {first_tool.name}")
                print(f"Result: {json.dumps(result.content, indent=2)}")
            else:
                print(f"\nTool execution failed: {result.content}")
        else:
            print("\nNo tools available for execution")
        
    finally:
        await client.disconnect()


async def demonstrate_workflows():
    """Demonstrate workflow capabilities"""
    print("\n=== Workflow Demonstrations ===")
    
    client = AlloyMCPClient(
        server_url=os.getenv('NEXT_PUBLIC_MCP_SERVER_URL', ''),
        api_key=os.getenv('NEXT_PUBLIC_MCP_ACCESS_TOKEN', '')
    )
    
    try:
        await client.connect()
        executor = WorkflowExecutor(client)
        
        # Run workflows
        await executor.data_pipeline_workflow()
        # await executor.sync_contacts_workflow()  # Uncomment to run
        
    finally:
        await client.disconnect()


async def demonstrate_resources():
    """Demonstrate resource access"""
    print("\n=== Resources Demo ===")
    
    client = AlloyMCPClient(
        server_url=os.getenv('NEXT_PUBLIC_MCP_SERVER_URL', ''),
        api_key=os.getenv('NEXT_PUBLIC_MCP_ACCESS_TOKEN', '')
    )
    
    try:
        await client.connect()
        
        # List resources
        resources = await client.get_resources()
        print("\nAvailable resources:")
        for resource in resources[:5]:  # Show first 5
            print(f"  - {resource['name']}: {resource['uri']}")
        
        # Read a resource
        if resources:
            resource_data = await client.read_resource(resources[0]['uri'])
            print(f"\nResource content preview: {str(resource_data)[:200]}...")
        
    finally:
        await client.disconnect()


async def main():
    """Main entry point"""
    print("🚀 Alloy MCP Python SDK Example\n")
    
    # Check for API key
    if not os.getenv('NEXT_PUBLIC_MCP_ACCESS_TOKEN'):
        print("❌ Please set NEXT_PUBLIC_MCP_ACCESS_TOKEN in your .env file")
        return
    
    # Run demonstrations
    await demonstrate_connectivity()
    # await demonstrate_workflows()  # Disabled - requires specific setup
    await demonstrate_resources()
    
    print("\n✨ All demonstrations completed!")


if __name__ == "__main__":
    asyncio.run(main())