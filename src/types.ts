export interface SchoolRecord {
  schoolName: string;
  area: string;
  deviation: number | null;
  category: string; // 募集区分 등
  examName: string; // 시험명칭
  applyStart: string; // 지원시작
  applyEnd: string; // 지원마감
  examDate: string; // 시험일
  resultDate: string; // 발표일
  annual: string; // 연납
  refund: string; // 반납
}

export interface DateGroupedRecords {
  [examDate: string]: SchoolRecord[];
}

export interface SelectedByDate {
  [examDate: string]: SchoolRecord;
}

export interface CompletionStatusItem {
  applyStartDone: boolean;
  applyEndDone: boolean;
  examDateDone: boolean;
  resultDateDone: boolean;
}

export interface CompletionStatusMap {
  [schoolKey: string]: CompletionStatusItem;
}

