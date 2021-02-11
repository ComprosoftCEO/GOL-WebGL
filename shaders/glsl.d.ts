// Make sure TypeScript recognizes glsl files as a string
declare module '*.glsl' {
  const content: string;
  export default content;
}
