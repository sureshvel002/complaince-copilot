import { AIModel } from './types';

export const MOCK_MODELS: AIModel[] = [
  {
    id: '1',
    name: 'fraud_detection_v3',
    version: '3.2.0',
    status: 'Pending',
    riskLevel: 'High',
    lastAnalyzed: '2024-03-15',
    type: 'Gradient Boosting',
    features: ['transaction_amount', 'location', 'device_id', 'user_age', 'merchant_category']
  },
  {
    id: '2',
    name: 'customer_churn_predictor',
    version: '1.0.5',
    status: 'Approved',
    riskLevel: 'Medium',
    lastAnalyzed: '2024-03-10',
    type: 'Random Forest',
    features: ['tenure', 'monthly_charges', 'contract_type', 'support_calls']
  },
  {
    id: '3',
    name: 'credit_score_analyzer',
    version: '2.1.0',
    status: 'Rejected',
    riskLevel: 'High',
    lastAnalyzed: '2024-03-12',
    type: 'Neural Network',
    features: ['income', 'debt_ratio', 'payment_history', 'employment_length']
  },
  {
    id: '4',
    name: 'inventory_optimizer',
    version: '4.0.1',
    status: 'Approved',
    riskLevel: 'Low',
    lastAnalyzed: '2024-03-14',
    type: 'XGBoost',
    features: ['stock_level', 'demand_forecast', 'lead_time']
  }
];

export const REGULATORY_SNIPPETS = [
  {
    regulation: "GDPR",
    requirement: "Data minimization and lawful processing required. Individuals have the right to an explanation for automated decisions."
  },
  {
    regulation: "EU AI Act",
    requirement: "High-risk AI systems must undergo conformity assessments and maintain detailed technical documentation."
  },
  {
    regulation: "Internal Policy v2",
    requirement: "All financial models must have a minimum explainability score of 0.75 and feature importance must be documented."
  }
];
