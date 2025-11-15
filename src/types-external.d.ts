declare module 'papaparse' {
  interface ParseResult<T> { data: T[]; errors: any[]; meta: any; }
  interface ParseConfig { skipEmptyLines?: boolean; }
  export function parse<T=any>(input: string, config?: ParseConfig): ParseResult<T>;
  const Papa: { parse: typeof parse };
  export default Papa;
}

