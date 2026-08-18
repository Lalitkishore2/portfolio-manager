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
  visible?: boolean;
  locked?: boolean;
}

export interface DesignTokens {
  primary: string;
  background: string;
  surface: string;
  textMain: string;
  textMuted: string;
  fontPrimary: string;
  fontMono: string;
  accent?: string;
  borderSubtle?: string;
}
