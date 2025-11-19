export interface TechSystemData {
  usage: number;
  fees: string;
  featuresUsed: string;
  customName?: string;
  dataGathering: string;
  dataUsage: string;
  effective: string; // 'Yes' | 'No'
  effectiveDetails: string;
}

export interface FormData {
  // Header
  name: string;
  email: string;
  sendEmailCopy: boolean;
  
  // Section 1: Business Overview
  employeeCount: string;
  roles: string;
  serviceProviders: string;
  painPoints: string[];
  painPointsDetails: string;
  dayInLife: string;
  tasksToReduce: string;
  revenueStreams: string;

  // Section 2: Tech Stack (Map of system name to data)
  techStack: Record<string, TechSystemData>;

  // Section 3: Staff & Scheduling
  schedulingMethod: string[];
  schedulingDetails: string;
  staffUsingAI: number;
  aiPlatforms: string[];
  aiDetails: string;
  vendorCommMethods: string[];
  vendorCommDetails: string;
  clientCommMethods: string[];
  clientCommDetails: string;
  vendorProcess: string;
  clientProcess: string;

  // Section 4: Data & Insights
  dataGatheringMethod: string[];
  dataGatheringDetails: string;
  dataUsageMethod: string[];
  dataUsageDetails: string;
  dailyInsights: string;
  weeklyInsights: string;

  // Section 5: Desired Outcomes
  desiredOutcomes: string[];
  desiredOutcomesDetails: string;
  confidenceFactor: string;

  // Section 6: Wrap Up
  additionalComments: string;
}

export interface ScoringResult {
  painPointScore: number;
  underusedSystemsCount: number;
  manualProcessScore: number;
  outcomeWeight: number;
  totalPriorityScore: number;
}
