import React, { useState } from "react";
import { X, Save, TestTube, AlertCircle, CheckCircle } from "lucide-react";

interface ServerConfigProps {
  onClose: () => void;
  onSave: () => void;
}

export default function ServerConfig({ onClose, onSave }: ServerConfigProps) {
  const [config, setConfig] = useState({
    serverUrl: process.env.NEXT_PUBLIC_MCP_SERVER_URL || "",
    apiKey: process.env.NEXT_PUBLIC_ALLOY_API_KEY || "",
  });
  const [testStatus, setTestStatus] = useState<
    "idle" | "testing" | "success" | "error"
  >("idle");
  const [testMessage, setTestMessage] = useState("");

  const handleTest = async () => {
    setTestStatus("testing");
    setTestMessage("Testing connection...");

    try {
      // Test the connection
      const response = await fetch("/api/mcp/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });

      if (response.ok) {
        setTestStatus("success");
        setTestMessage("Connection successful!");
      } else {
        setTestStatus("error");
        setTestMessage("Connection failed. Please check your credentials.");
      }
    } catch (error) {
      setTestStatus("error");
      setTestMessage("Failed to test connection.");
    }
  };

  const handleSave = () => {
    // Save to localStorage or send to backend
    localStorage.setItem("alloy-mcp-config", JSON.stringify(config));
    onSave();
    onClose();
  };

  return (
    <div className="flex-1 p-4 overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">
          Server Configuration
        </h3>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-700 rounded-lg transition-colors text-gray-300 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Server URL
          </label>
          <input
            type="text"
            value={config.serverUrl}
            onChange={(e) =>
              setConfig({ ...config, serverUrl: e.target.value })
            }
            placeholder=""
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-400 mt-1">
            The URL of your Alloy MCP server
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            API Key
          </label>
          <input
            type="password"
            value={config.apiKey}
            onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
            placeholder="your-api-key"
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-400 mt-1">
            Your Alloy API key for authentication
          </p>
        </div>

        {/* Test Status */}
        {testStatus !== "idle" && (
          <div
            className={`p-3 rounded-lg flex items-center gap-2 ${
              testStatus === "testing"
                ? "bg-blue-50 text-blue-700"
                : testStatus === "success"
                ? "bg-green-50 text-green-700"
                : "bg-red-50 text-red-700"
            }`}
          >
            {testStatus === "testing" && (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
            )}
            {testStatus === "success" && <CheckCircle className="w-4 h-4" />}
            {testStatus === "error" && <AlertCircle className="w-4 h-4" />}
            <span className="text-sm">{testMessage}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <button
            onClick={handleTest}
            disabled={
              !config.serverUrl || !config.apiKey || testStatus === "testing"
            }
            className="flex-1 px-4 py-2 border border-gray-600 text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            <TestTube className="w-4 h-4" />
            Test Connection
          </button>
          <button
            onClick={handleSave}
            disabled={!config.serverUrl || !config.apiKey}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save Configuration
          </button>
        </div>
      </div>

      {/* Additional Settings */}
      <div className="mt-8 pt-8 border-t border-gray-700">
        <h4 className="font-medium mb-4 text-white">Advanced Settings</h4>

        <div className="space-y-3">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              className="rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
              defaultChecked
            />
            <span className="text-sm text-gray-300">
              Enable automatic tool discovery
            </span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              className="rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
              defaultChecked
            />
            <span className="text-sm text-gray-300">Cache tool responses</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              className="rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-300">
              Debug mode (verbose logging)
            </span>
          </label>
        </div>
      </div>
    </div>
  );
}
