export interface Status {
    success: boolean;
    attempts: number;
    lastProvider: string | null;
    errorMessage?: string;
  }
  