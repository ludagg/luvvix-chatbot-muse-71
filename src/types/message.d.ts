
export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  useAdvancedReasoning?: boolean;
  useLuvviXThink?: boolean;
  useWebSearch?: boolean;
  sourceReferences?: SourceReference[];
  hasGraph?: boolean;
  graphType?: "function" | "bar" | "pie" | "line" | "scatter";
  graphParams?: any;
}

export interface SourceReference {
  id: number;
  title: string;
  url: string;
  snippet: string;
}
