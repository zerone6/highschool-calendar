export function toDisplayJP(md: string): string { return md.replace('/', '月') + '日'; }
// D-day: 12月=当年, 1~3月=翌年
export function calcDday(md: string): string {
  if (!md) return '';
  const [mStr,dStr] = md.split('/');
  const m = parseInt(mStr,10); const d = parseInt(dStr,10);
  if (isNaN(m)||isNaN(d)) return '';
  const today = new Date();
  const baseYear = today.getFullYear();
  let year = baseYear;
  if (m>=1 && m<=3) year = baseYear+1; else if (m===12) year = baseYear; else year=baseYear;
  const target = new Date(year,m-1,d); target.setHours(0,0,0,0); today.setHours(0,0,0,0);
  const diffDays = Math.round((target.getTime()-today.getTime())/86400000);
  if (diffDays===0) return 'D-day';
  return diffDays>0? `D-${diffDays}`:`D+${Math.abs(diffDays)}`;
}

