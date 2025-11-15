// Allow importing CSV as raw string if needed later
declare module '*.csv' {
  const content: string;
  export default content;
}
