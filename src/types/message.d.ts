
import { SourceReference } from "@/components/ChatMessage";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  useAdvancedReasoning?: boolean;
  useLuvviXThink?: boolean;
  useWebSearch?: boolean;
  sourceReferences?: SourceReference[];
  sentimentAnalysis?: string;
  contextMemory?: string;
  hasGraph?: boolean;
  graphType?: "line" | "bar" | "area" | "scatter" | "function";
  graphParams?: {
    functions: Array<{
      fn: string;
      color: string;
      label: string;
    }>;
    xRange: [number, number];
    yRange?: [number, number];
    xLabel?: string;
    yLabel?: string;
    title?: string;
  };
}
