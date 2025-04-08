// Interface for Fact data
export interface Fact {
  id: string;
  title: string;
  body: string;
  tag: string;
  sourceUrl?: string;
  createdAt: string;
  updatedAt: string;
}
