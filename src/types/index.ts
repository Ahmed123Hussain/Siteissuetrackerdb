export interface IssueImage {
  data: string; // base64 encoded
  filename: string;
  thumbnail: string; // base64 thumbnail
}

export interface Issue {
  id: string;
  issueNumber: number;
  location: string;
  description: string;
  shopDrawing: IssueImage;
  siteImage?: IssueImage;
  status: 'Open' | 'Work Ongoing' | 'Closed';
  solution?: string;
  createdAt: string;
  closedAt?: string;
  updatedAt: string;
}

export interface ClosureModalState {
  isOpen: boolean;
  issueId?: string;
}
