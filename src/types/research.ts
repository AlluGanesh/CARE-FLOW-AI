// Research Agent Type Definitions - Phase 1 Foundation & Phase 2 Evidence-Based System

export type MedicalEntityType = 
  | 'condition' 
  | 'test' 
  | 'test_value' 
  | 'medicine' 
  | 'dosage' 
  | 'medical_term' 
  | 'follow_up';

export interface MedicalEntity {
  id: string;
  type: MedicalEntityType;
  name: string;
  value?: string;
  dosage?: string;
  context?: string;
  confidence?: number;
  normalRange?: string;
  statusIndicator?: 'NORMAL' | 'ELEVATED' | 'LOW' | 'ATTENTION' | 'INFO';
}

export interface ResearchDocument {
  id: string;
  patientId: string;
  fileName?: string;
  inputType: 'pdf' | 'image' | 'text';
  originalText?: string;
  status: 'uploaded' | 'processing' | 'completed' | 'failed';
  createdAt: string;
  fileSize?: string;
}

export interface MedicalExplanation {
  entityId: string;
  entityName: string;
  entityType: MedicalEntityType;
  title: string;
  simpleExplanation: string;
  importantNote?: string;
  generalUse?: string;
  safetyDisclaimer?: string;
  // Phase 2 enhancements
  evidenceLevel?: EvidenceLevel;
  sourceIds?: string[];
  citationIndices?: number[];
  claims?: ResearchClaim[];
  isEvidenceBacked?: boolean;
}

export interface ProcessingStep {
  id: string;
  label: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  detail?: string;
}

// -------------------------------------------------------------
// PHASE 2 EVIDENCE-BASED MEDICAL RESEARCH TYPES
// -------------------------------------------------------------

export type ResearchTaskType = 
  | 'condition' 
  | 'medical_term' 
  | 'test' 
  | 'test_value' 
  | 'medicine' 
  | 'medicine_use' 
  | 'safety';

export interface ResearchTask {
  id: string;
  entityId: string;
  entityName: string;
  type: ResearchTaskType;
  query: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'running' | 'completed' | 'failed';
  errorMessage?: string;
}

export type SourceTier = 1 | 2 | 3;

export interface ResearchSource {
  id: string;
  title: string;
  url: string;
  domain: string;
  publisher?: string;
  sourceTier: SourceTier;
  retrievedAt: string;
  snippet?: string;
  content?: string;
  reliability: 'high' | 'medium' | 'low';
  isOfficialDrugLabel?: boolean;
}

export type EvidenceLevel = 
  | 'strong' 
  | 'moderate' 
  | 'limited' 
  | 'insufficient' 
  | 'conflicting';

export interface Evidence {
  id: string;
  claim?: string;
  sourceId: string;
  sourceTitle: string;
  sourceUrl: string;
  supportingText: string;
  evidenceLevel: EvidenceLevel;
  supportsClaim: boolean;
  contradictingText?: string;
}

export interface ResearchClaim {
  id: string;
  entityId: string;
  text: string;
  evidenceIds: string[];
  verificationStatus: 'verified' | 'unsupported' | 'conflicting';
  safetyStatus: 'safe' | 'flagged';
  citationIndices?: number[];
  flagReason?: string;
}

export interface ResearchCitation {
  id: string;
  citationIndex: number;
  sourceId: string;
  sourceTitle: string;
  sourceUrl: string;
  publisher?: string;
  sourceTier: SourceTier;
  accessedDate: string;
}

export type EvidenceStatus = 'verified' | 'partial' | 'insufficient' | 'conflicting';

export type ResearchMode = 'live' | 'cached' | 'fallback';

export interface ClinicianResearchSummary {
  totalEntities: number;
  totalSources: number;
  verifiedClaims: number;
  unsupportedClaims: number;
  conflictingClaims: number;
  evidenceStatus: EvidenceStatus;
  safetyStatus: 'passed' | 'review_required';
  disclaimerCount: number;
}

export interface ResearchResult {
  documentId: string;
  patientId: string;
  conditions: MedicalEntity[];
  tests: MedicalEntity[];
  medicines: MedicalEntity[];
  medicalTerms: MedicalEntity[];
  followUps: MedicalEntity[];
  explanations: MedicalExplanation[];
  summary: string;
  analyzedAt: string;
  safetyChecked: boolean;
  // Phase 2 extension fields (optional on base, populated in Phase 2)
  researchTasks?: ResearchTask[];
  sources?: ResearchSource[];
  evidence?: Evidence[];
  claims?: ResearchClaim[];
  citations?: ResearchCitation[];
  evidenceStatus?: EvidenceStatus;
  researchMode?: ResearchMode;
  completedAt?: string;
  clinicianSummary?: ClinicianResearchSummary;
  partialFailures?: string[];
}

export interface EvidenceBackedResearchResult extends ResearchResult {
  researchTasks: ResearchTask[];
  sources: ResearchSource[];
  evidence: Evidence[];
  claims: ResearchClaim[];
  citations: ResearchCitation[];
  evidenceStatus: EvidenceStatus;
  researchMode: ResearchMode;
  completedAt: string;
  clinicianSummary: ClinicianResearchSummary;
}

// -------------------------------------------------------------
// PROVIDER ABSTRACTIONS (LLM & MEDICAL SEARCH)
// -------------------------------------------------------------

export interface LLMRequest {
  systemPrompt: string;
  userPrompt: string;
  responseFormat?: 'json' | 'text';
  temperature?: number;
  maxTokens?: number;
}

export interface LLMResponse {
  text: string;
  parsedJson?: unknown;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface LLMProvider {
  name: string;
  generate(request: LLMRequest): Promise<LLMResponse>;
  isAvailable(): Promise<boolean>;
}

export interface MedicalResearchProvider {
  name: string;
  search(task: ResearchTask): Promise<ResearchSource[]>;
  searchBatch(tasks: ResearchTask[]): Promise<Map<string, ResearchSource[]>>;
}

// Service Interface Abstractions
export interface MedicalInformationExtractor {
  extract(text: string): Promise<{
    conditions: MedicalEntity[];
    tests: MedicalEntity[];
    medicines: MedicalEntity[];
    medicalTerms: MedicalEntity[];
    followUps: MedicalEntity[];
    summary: string;
  }>;
}

export interface ExplanationGenerator {
  explain(entity: MedicalEntity): Promise<MedicalExplanation>;
  explainBatch(entities: MedicalEntity[]): Promise<MedicalExplanation[]>;
}

export interface SafetyValidator {
  validate(result: ResearchResult): {
    isSafe: boolean;
    flags: string[];
    disclaimers: string[];
  };
}
