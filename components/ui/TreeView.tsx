import React, { useState } from 'react';
import { Icon } from './Icon';

export interface TreeNode {
  id: string;
  name: string;
  children?: TreeNode[];
}

interface TreeViewProps {
  nodes: TreeNode[];
  checkedIds: Set<string>;
  onCheckedChange: (checkedIds: Set<string>) => void;
  className?: string;
}

const TreeViewNode: React.FC<{
  node: TreeNode;
  checkedIds: Set<string>;
  onNodeToggle: (nodeId: string, checked: boolean) => void;
  level?: number;
}> = ({ node, checkedIds, onNodeToggle, level = 0 }) => {
  const [isOpen, setIsOpen] = useState(true);
  const isChecked = checkedIds.has(node.id);

  const handleToggle = () => {
    if (node.children && node.children.length > 0) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div>
      <div
        className="flex items-center p-1 rounded-md hover:bg-gray-100 dark:hover:bg-slate-700/50"
        style={{ paddingLeft: `${level * 1.5}rem` }}
      >
        {node.children && node.children.length > 0 ? (
          <button onClick={handleToggle} className="p-1 mr-1">
            <Icon
              name={isOpen ? 'fas fa-chevron-down' : 'fas fa-chevron-right'}
              className="w-3 h-3 text-xs text-gray-500 dark:text-gray-400"
            />
          </button>
        ) : (
          <div className="w-5 mr-1" /> // Placeholder for alignment
        )}
        <label htmlFor={`tree-node-${node.id}`} className="flex items-center cursor-pointer flex-grow">
          <input
            type="checkbox"
            id={`tree-node-${node.id}`}
            checked={isChecked}
            onChange={(e) => onNodeToggle(node.id, e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-[#679a41] focus:ring-[#679a41] dark:border-gray-600"
          />
          <span className="ml-2 text-sm text-[#293c51] dark:text-gray-200">{node.name}</span>
        </label>
      </div>
      {isOpen && node.children && node.children.length > 0 && (
        <div className="border-l border-gray-200 dark:border-slate-600">
          {node.children.map(childNode => (
            <TreeViewNode
              key={childNode.id}
              node={childNode}
              checkedIds={checkedIds}
              onNodeToggle={onNodeToggle}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};


export const TreeView: React.FC<TreeViewProps> = ({ nodes, checkedIds, onCheckedChange, className }) => {
    const handleNodeToggle = (nodeId: string, checked: boolean) => {
        const newCheckedIds = new Set(checkedIds);
        const nodeMap: { [key: string]: TreeNode } = {};
        const getAllChildIds = (node: TreeNode): string[] => {
            let ids = [node.id];
            if (node.children) {
                node.children.forEach(child => {
                    ids = [...ids, ...getAllChildIds(child)];
                });
            }
            return ids;
        };

        const buildMapAndFindNode = (nodesToSearch: TreeNode[]): TreeNode | null => {
            for (const node of nodesToSearch) {
                nodeMap[node.id] = node;
                if (node.id === nodeId) return node;
                if (node.children) {
                    const found = buildMapAndFindNode(node.children);
                    if (found) return found;
                }
            }
            return null;
        };

        const targetNode = buildMapAndFindNode(nodes);
        if (!targetNode) return;

        const allIdsToToggle = getAllChildIds(targetNode);

        if (checked) {
            allIdsToToggle.forEach(id => newCheckedIds.add(id));
        } else {
            allIdsToToggle.forEach(id => newCheckedIds.delete(id));
        }
        
        onCheckedChange(newCheckedIds);
    };

    return (
        <div className={`p-2 border rounded-lg bg-gray-50/50 dark:bg-slate-900/30 dark:border-slate-700 ${className}`}>
            {nodes.map(node => (
                <TreeViewNode
                    key={node.id}
                    node={node}
                    checkedIds={checkedIds}
                    onNodeToggle={handleNodeToggle}
                />
            ))}
        </div>
    );
};
