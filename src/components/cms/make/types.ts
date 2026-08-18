export interface FigmaElement {
  id: string;
  tagName: string;
  className: string;
  path: string;
  rect: { top: number; left: number; width: number; height: number };
  styles: Record<string, string>;
  text: string;
  nodeId?: string;
}

export interface LayerTreeNode {
  id: string;
  label: string;
  tagName: string;
  type: 'frame' | 'component' | 'text' | 'group' | 'vector' | 'grid';
  children?: LayerTreeNode[];
  expanded?: boolean;
}
