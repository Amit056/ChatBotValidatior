export interface ValidationResult {
  valid: boolean;
  score: number;
  details: Record<string, number>;
}

export interface ValidationConfig {
  semantic: number;
  keyword: number;
  factual: number;
  completeness: number;
  safety: number;
  overall: number;
}

export interface ValidationMetrics {
  overallScore: any;
  userInput: string;
  botResponse: string;
  timestamp: Date;
  scores: Record<string, number>;
  valid: boolean;
}