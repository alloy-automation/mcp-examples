import React, { useState } from 'react';
import { Tool } from '@/types';
import { Search, ChevronDown, ChevronRight, Check } from 'lucide-react';

interface ToolPanelProps {
  tools: Tool[];
  selectedTools: string[];
  onToggleTool: (toolName: string) => void;
}

export default function ToolPanel({ tools, selectedTools, onToggleTool }: ToolPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['all']));

  // Group tools by category
  const groupedTools = tools.reduce((acc, tool) => {
    const category = tool.category || 'General';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(tool);
    return acc;
  }, {} as Record<string, Tool[]>);

  // Filter tools based on search
  const filteredTools = searchQuery
    ? tools.filter(tool =>
        tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : tools;

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Search */}
      <div className="p-4 border-b border-gray-700">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search tools..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 text-white placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Tools List */}
      <div className="flex-1 overflow-y-auto p-4">
        {searchQuery ? (
          // Show filtered results
          <div className="space-y-2">
            {filteredTools.map((tool) => (
              <ToolItem
                key={tool.name}
                tool={tool}
                isSelected={selectedTools.includes(tool.name)}
                onToggle={() => onToggleTool(tool.name)}
              />
            ))}
            {filteredTools.length === 0 && (
              <p className="text-gray-400 text-center py-4">No tools found</p>
            )}
          </div>
        ) : (
          // Show categorized tools
          <div className="space-y-2">
            {Object.entries(groupedTools).map(([category, categoryTools]) => (
              <div key={category} className="border border-gray-600 rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleCategory(category)}
                  className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white flex items-center justify-between transition-colors"
                >
                  <span className="font-medium">{category}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-300">
                      {categoryTools.filter(t => selectedTools.includes(t.name)).length}/{categoryTools.length}
                    </span>
                    {expandedCategories.has(category) ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </div>
                </button>
                {expandedCategories.has(category) && (
                  <div className="p-2 space-y-1">
                    {categoryTools.map((tool) => (
                      <ToolItem
                        key={tool.name}
                        tool={tool}
                        isSelected={selectedTools.includes(tool.name)}
                        onToggle={() => onToggleTool(tool.name)}
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Selected Tools Summary */}
      <div className="p-4 border-t border-gray-700 bg-gray-750">
        <div className="text-sm text-gray-300">
          {selectedTools.length} tool{selectedTools.length !== 1 ? 's' : ''} selected
        </div>
      </div>
    </div>
  );
}

interface ToolItemProps {
  tool: Tool;
  isSelected: boolean;
  onToggle: () => void;
}

function ToolItem({ tool, isSelected, onToggle }: ToolItemProps) {
  return (
    <button
      onClick={onToggle}
      className={`w-full text-left p-3 rounded-lg border transition-all ${
        isSelected
          ? 'border-blue-500 bg-blue-900/30'
          : 'border-gray-600 hover:border-gray-500 hover:bg-gray-700'
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5 ${
            isSelected
              ? 'border-blue-500 bg-blue-500'
              : 'border-gray-300'
          }`}
        >
          {isSelected && <Check className="w-3 h-3 text-white" />}
        </div>
        <div className="flex-1">
          <div className="font-medium text-sm text-white">{tool.name}</div>
          <div className="text-xs text-gray-300 mt-1">{tool.description}</div>
        </div>
      </div>
    </button>
  );
}