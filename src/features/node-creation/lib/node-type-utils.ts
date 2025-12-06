import { NODE_TYPE_CONFIGS, type NodeType, type NodeTypeConfig } from '@/entities/node'

/**
 * Get node type configuration by type
 */
export const getNodeConfig = (type: NodeType): NodeTypeConfig | undefined =>
  NODE_TYPE_CONFIGS.find(c => c.type === type)

/**
 * Get icon component for a node type
 */
export const getNodeIcon = (type: NodeType) => getNodeConfig(type)?.icon
