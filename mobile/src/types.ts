export interface SchoolRecord {
  schoolName: string;
  area: string;
  deviation: number | null;
  category: string;
  examName: string;
  applyStart: string;
  applyEnd: string;
  examDate: string;
  resultDate: string;
  annual: string;
  refund: string;
  id?: string; // 고유 식별자 (schoolName+examDate+examName 기반 해시)
}
export interface DateGroupedRecords { [examDate: string]: SchoolRecord[]; }
export interface SelectedByDate { [examDate: string]: SchoolRecord; }
export interface CompletionStatusItem { applyStartDone: boolean; applyEndDone: boolean; examDateDone: boolean; resultDateDone: boolean; }
export interface CompletionStatusMap { [key: string]: CompletionStatusItem; }
