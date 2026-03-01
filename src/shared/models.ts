export type CandidateType =
  | "monaco"
  | "codemirror"
  | "ace"
  | "textarea"
  | "contenteditable"
  | "codeblock"
  | "manual"
  | "unknown";

export interface SerializableRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export interface CandidateMetadata {
  languageHint?: string;
  fileExtensionHint?: string;
  sourceUrl?: string;
  hostname?: string;
  title?: string;
}

export interface Candidate {
  id: string;
  type: CandidateType;
  selector: string;
  bounds: SerializableRect;
  confidence: number;
  metadata: CandidateMetadata;
}

export interface CapturedFile {
  path: string;
  content: string;
}

export interface CapturePayload {
  candidateId: string;
  sourceUrl: string;
  languageHint?: string;
  suggestedPath?: string;
  files: CapturedFile[];
  createdAtIso: string;
}

export interface PushRequest {
  owner: string;
  repo: string;
  branch: string;
  commitMessage: string;
  files: CapturedFile[];
}

export interface PushResult {
  commitSha: string;
  commitUrl: string;
  repoUrl: string;
  branch: string;
  pushedAtIso: string;
}

export interface HostOverride {
  host: string;
  defaultRepo?: string;
  baseFolder?: string;
  defaultExtension?: string;
}

export interface AppSettings {
  version: number;
  githubToken?: string;
  defaultOwner?: string;
  defaultRepo?: string;
  defaultBranch: string;
  hostOverrides: HostOverride[];
}
