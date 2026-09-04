// SOA Contracts (Service-Oriented Architecture) for Diabetes Management
import { 
  DiabetesCareProfile, 
  GlycemicMeasurement, 
  InsulinAdministration, 
  FootCareInspection 
} from './types';
import { BPMNExecutionState } from './bpmnWorkflow';

export interface IDiabetesRepositoryService {
  getAllProfiles(): Promise<DiabetesCareProfile[]>;
  getProfileByResidentId(residentId: string): Promise<DiabetesCareProfile | null>;
  saveMeasurement(measurement: GlycemicMeasurement): Promise<GlycemicMeasurement>;
  saveInsulinLog(log: InsulinAdministration): Promise<InsulinAdministration>;
  saveFootInspection(inspection: FootCareInspection): Promise<FootCareInspection>;
}

export interface IBPMNWorkflowService {
  executeHypoglycemiaWorkflow(residentName: string, glucoseValue: number): BPMNExecutionState;
}

export interface IGraphRAGService {
  queryInteractions(residentId: string): { nodes: unknown[]; edges: unknown[]; clinicalSummary: string[] };
  executeTool(toolName: string, args: Record<string, unknown>): { success: boolean; result: unknown };
}
