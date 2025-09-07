export interface Commit {
  id: string;
  parentIds: string[];
  title: string;
  prompt: string;
  imageDataUrl: string;
  thumbnailDataUrl: string;
  childrenIds: string[];
  branchName?: string;
  timestamp: number;
}

export type CommitTree = Record<string, Commit>;