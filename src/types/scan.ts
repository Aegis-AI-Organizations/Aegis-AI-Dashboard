export interface CreateScanRequest {
  target_image: string;
}

export interface CreateScanResponse {
  scan_id: string;
  temporal_workflow_id: string;
  status: string;
}

export interface ScanStatusResponse {
  id: string;
  temporal_workflow_id: string;
  target_image: string;
  status: string;
  started_at?: string;
  completed_at?: string;
  company_name: string;
}
