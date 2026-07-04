export interface EditableField {
  key: string;
  label: string;
  type: "text" | "textarea" | "tags" | "list";
  value: string | string[];
  constraint?: string;
  aiCapable?: boolean;
}

export interface SelectedElement {
  sectionId: string;
  recordId: string;
  fieldPath: string; // e.g. "projects/aquadot.title"
  label: string;
  fields: EditableField[];
  diffState?: "added" | "modified" | "deleted" | "clean";
}

export interface DirtyRecord {
  sectionId: string;
  recordId: string;
  state: "added" | "modified" | "deleted";
}
