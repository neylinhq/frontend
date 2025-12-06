/**
 * TypeScript adapter 4;O WASM GraphEngine
 * @54>AB02;O5B type-safe 8=B5@D59A 4;O @01>BK A Rust WASM <>4C;5<
 */

import type { Edge, Node } from '@/entities/map'

// WASM module types (1C4CB A35=5@8@>20=K wasm-pack)
interface WasmGraphEngine {
  initRenderer(canvas: HTMLCanvasElement): void
  loadGraph(jsonData: string): void
  exportGraph(): string
  runLayout(iterations?: number): void
  render(): void
  setView(panX: number, panY: number, zoom: number): void
  setResolution(width: number, height: number): void
  selectNodes(nodeIdsJson: string): void
  focusNode(nodeId: string | null): void
  getNodeCount(): number
  getEdgeCount(): number
  getStats(): string
}

interface WasmModule {
  default(): Promise<any>
  GraphEngine: new () => WasmGraphEngine
}

export interface GraphData {
  nodes: GraphNode[]
  edges: GraphEdge[]
}

export interface GraphNode {
  id: string
  label: string
  description?: string
  node_type: string
  position: { x: number; y: number }
  size?: { width: number; height: number }
}

export interface GraphEdge {
  id: string
  source: string
  target: string
  relation_type: string
  label?: string
  strength: number
  bidirectional: boolean
}

export interface GraphStats {
  nodes: number
  edges: number
  nodesRendered: number
  edgesRendered: number
}

/**
 * TypeScript wrapper 4;O WASM GraphEngine
 */
export class GraphEngine {
  private wasmEngine: WasmGraphEngine | null = null
  private wasmModule: WasmModule | null = null
  private canvas: HTMLCanvasElement | null = null

  async init(canvas: HTMLCanvasElement): Promise<void> {
    this.canvas = canvas

    try {
      // 8=0<8G5A:89 8<?>@B WASM <>4C;O
      // @ts-expect-error - WASM module path resolved via Vite alias
      const wasm = await import('@/lib/wasm/graph_engine.js')

      // =8F80;870F8O WASM
      await wasm.default()
      this.wasmModule = wasm

      // !>740=85 M:75<?;O@0 4286:0
      this.wasmEngine = new wasm.GraphEngine()
      this.wasmEngine.initRenderer(canvas)

      console.log('[GraphEngine] WASM engine initialized')
    } catch (error) {
      console.error('[GraphEngine] Failed to initialize WASM:', error)
      throw new Error(`Failed to initialize WASM engine: ${error}`)
    }
  }

  /**
   * 03@C78BL 3@0D 87 40==KE ?@8;>65=8O
   */
  loadGraph(nodes: Node[], edges: Edge[]): void {
    if (!this.wasmEngine) {
      throw new Error('Engine not initialized')
    }

    const graphData: GraphData = {
      nodes: nodes.map(node => this.transformNode(node)),
      edges: edges.map(edge => this.transformEdge(edge))
    }

    this.wasmEngine.loadGraph(JSON.stringify(graphData))
  }

  /**
   * 0?CAB8BL layout 0;3>@8B<
   */
  runLayout(iterations: number = 150): void {
    if (!this.wasmEngine) {
      throw new Error('Engine not initialized')
    }

    this.wasmEngine.runLayout(iterations)
  }

  /**
   * B@5=45@8BL B5:CI89 D@59<
   */
  render(): void {
    if (!this.wasmEngine) {
      throw new Error('Engine not initialized')
    }

    this.wasmEngine.render()
  }

  /**
   * #AB0=>28BL :0<5@C (pan + zoom)
   */
  setView(panX: number, panY: number, zoom: number): void {
    if (!this.wasmEngine) {
      throw new Error('Engine not initialized')
    }

    this.wasmEngine.setView(panX, panY, zoom)
  }

  /**
   * 1=>28BL @07@5H5=85 canvas
   */
  setResolution(width: number, height: number): void {
    if (!this.wasmEngine) {
      throw new Error('Engine not initialized')
    }

    this.wasmEngine.setResolution(width, height)
  }

  /**
   * K1@0BL C7;K
   */
  selectNodes(nodeIds: string[]): void {
    if (!this.wasmEngine) {
      throw new Error('Engine not initialized')
    }

    this.wasmEngine.selectNodes(JSON.stringify(nodeIds))
  }

  /**
   * !D>:CA8@>20BLAO =0 C7;5
   */
  focusNode(nodeId: string | null): void {
    if (!this.wasmEngine) {
      throw new Error('Engine not initialized')
    }

    this.wasmEngine.focusNode(nodeId)
  }

  /**
   * >;CG8BL AB0B8AB8:C @5=45@8=30
   */
  getStats(): GraphStats {
    if (!this.wasmEngine) {
      throw new Error('Engine not initialized')
    }

    const statsJson = this.wasmEngine.getStats()
    return JSON.parse(statsJson)
  }

  /**
   * -:A?>@B8@>20BL 3@0D (A ?>78F8O<8 ?>A;5 layout)
   */
  exportGraph(): GraphData {
    if (!this.wasmEngine) {
      throw new Error('Engine not initialized')
    }

    const graphJson = this.wasmEngine.exportGraph()
    return JSON.parse(graphJson)
  }

  /**
   * G8AB:0 @5AC@A>2
   */
  dispose(): void {
    this.wasmEngine = null
    this.wasmModule = null
    this.canvas = null
  }

  // === Private helpers ===

  private transformNode(node: Node): GraphNode {
    return {
      id: node.id,
      label: node.label,
      description: node.description,
      node_type: node.type, // Already in kebab-case format
      position: node.position,
      size: { width: 180, height: 100 }
    }
  }

  private transformEdge(edge: Edge): GraphEdge {
    return {
      id: edge.id,
      source: edge.sourceNodeId,
      target: edge.targetNodeId,
      relation_type: edge.relationType,
      label: edge.label,
      strength: edge.strength || 0.5,
      bidirectional: edge.bidirectional || false
    }
  }

  private mapNodeType(type: string): string {
    // 0??8=3 TypeScript B8?>2 2 Rust enum (kebab-case)
    const typeMap: Record<string, string> = {
      Concept: 'concept',
      Fact: 'fact',
      Theory: 'theory',
      Example: 'example',
      Question: 'question',
      Hypothesis: 'hypothesis',
      Person: 'person',
      School: 'school'
    }
    return typeMap[type] || 'concept'
  }

  private mapRelationType(type: string): string {
    // 0??8=3 TypeScript B8?>2 2 Rust enum (kebab-case)
    const typeMap: Record<string, string> = {
      IsA: 'is-a',
      HasA: 'has-a',
      Causes: 'causes',
      Explains: 'explains',
      RelatedTo: 'related-to',
      Influences: 'influences',
      PartOf: 'part-of',
      Prerequisite: 'prerequisite',
      Contradicts: 'contradicts',
      SimilarTo: 'similar-to'
    }
    return typeMap[type] || 'related-to'
  }
}
