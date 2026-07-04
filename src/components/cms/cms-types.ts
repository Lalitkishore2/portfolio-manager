export interface ArchitectureNode {
  id: string;
  label: string;
  color: string;
  items: string[];
}

export interface TechGroup {
  id: string;
  groupName: string;
  items: string[];
}

export interface Stat {
  id: string;
  label: string;
  value: string;
  unit: string;
}

export type ProjectStatus = "building" | "prototype" | "live" | "complete";
export type ProjectCategory = "IOT" | "WEB" | "AI" | "HEALTHCARE";

export interface Project {
  id: string;
  title: string;
  tagline: string;
  slug: string;
  index: string;
  year: string;
  accentColor: string;
  overview: string;
  problem: string;
  description: string;
  tags: string[];
  metric: string;
  rotation: number;
  architecture: ArchitectureNode[];
  techStack: TechGroup[];
  role: string[];
  challenges: string[];
  status: ProjectStatus;
  category: ProjectCategory;
  nextSlug: string;
  prevSlug: string;
  stats: Stat[];
  updatedAt?: string;
}
export function uid() {
  return Math.random().toString(36).slice(2, 9);
}
