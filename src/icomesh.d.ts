// TypeScript declarations for the 'icomesh' library
declare module 'icomesh' {
  interface IcomeshResult {
    vertices: Float32Array;
    triangles: Uint16Array;
  }

  interface IcomeshUVResult {
    vertices: Float32Array;
    triangles: Uint16Array;
    uv: Float32Array;
  }

  function icomesh(order: number): IcomeshResult;
  function icomesh(order: number, uvMap: false): IcomeshResult;
  function icomesh(order: number, uvMap: true): IcomeshUVResult;

  export default icomesh;
}
