import type { CandidateMetadata, CandidateType, SerializableRect } from "../../shared/models";

export interface CandidateSeed {
  type: CandidateType;
  element: Element;
  selector: string;
  confidence: number;
  metadata?: CandidateMetadata;
}

export interface CandidateAdapter {
  name: string;
  collect(documentRef: Document): CandidateSeed[];
}

export interface CandidateDiscoveryResult {
  candidates: CandidateSeed[];
  bestCandidate: CandidateSeed | null;
}

export interface CandidateRectSnapshot {
  selector: string;
  bounds: SerializableRect;
}
