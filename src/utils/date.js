// 날짜 문자열 예: "02�� 01��" 같은 형식(Shift-JIS 깨짐). 숫자만 추출.
export function parseMonthDay(raw) {
    if (!raw)
        return null;
    const m = raw.match(/(\d{1,2}).*?(\d{1,2})/);
    if (!m)
        return null;
    return { month: parseInt(m[1], 10), day: parseInt(m[2], 10) };
}
export function toDisplayKorean(raw) {
    const md = parseMonthDay(raw);
    if (!md)
        return raw;
    return `${md.month}월 ${md.day}일`;
}
export function toDisplayJP(raw) {
  const md = parseMonthDay(raw);
  if (!md) return raw;
  return `${md.month}月${md.day}日`;
}
export function sortExamDates(dates) {
    return [...dates].sort((a, b) => {
        const pa = parseMonthDay(a);
        const pb = parseMonthDay(b);
        if (!pa || !pb)
            return a.localeCompare(b);
        if (pa.month !== pb.month)
            return pa.month - pb.month;
        return pa.day - pb.day;
    });
}
