export type RiskLevel = 'Low' | 'Medium' | 'High';
export type ComplianceStatus = 'Pass' | 'Fail' | 'Warning';

export interface AIModel {
  id: string;
  name: string;
  version: string;
  status: 'Approved' | 'Pending' | 'Rejected';
  riskLevel: RiskLevel;
  lastAnalyzed: string;
  type: string;
  features: string[];
}

export interface ComplianceCheck {
  id: string;
  category: string;
  requirement: string;
  status: ComplianceStatus;
  recommendation?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  citations?: string[];
}

export interface ModelAnalysis {
  modelId: string;
  riskLevel: RiskLevel;
  summary: string;
  explanation: string;
  featureImportance: { feature: string; importance: number }[];
  checklist: ComplianceCheck[];
}
