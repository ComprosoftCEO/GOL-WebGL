import lodash from 'lodash';

/**
 * Represents a rule for the game of life
 */
export class LifeRule {
  private begin: Set<number>;
  private survive: Set<number>;

  constructor(begin: Set<number>, survive: Set<number>) {
    this.begin = begin;
    this.survive = survive;
  }

  setBegin(begin: number, value: boolean): void {
    const newSet = new Set(this.begin);
    if (value) {
      newSet.add(begin);
    } else {
      newSet.delete(begin);
    }

    this.begin = newSet;
  }

  toggleBegin(begin: number): void {
    const newSet = new Set(this.begin);
    if (newSet.has(begin)) {
      newSet.delete(begin);
    } else {
      newSet.add(begin);
    }

    this.begin = newSet;
  }

  setSurvive(survive: number, value: boolean): void {
    const newSet = new Set(this.survive);
    if (value) {
      newSet.add(survive);
    } else {
      newSet.delete(survive);
    }

    this.survive = newSet;
  }

  toggleSurvive(survive: number): void {
    const newSet = new Set(this.survive);
    if (newSet.has(survive)) {
      newSet.delete(survive);
    } else {
      newSet.add(survive);
    }

    this.survive = newSet;
  }

  testBegin(neighbors: number): boolean {
    return this.begin.has(neighbors);
  }

  testSurvive(neighbors: number): boolean {
    return this.survive.has(neighbors);
  }
}

/**
 * Data structure to store the game of life
 */
export class Life {
  public rule: LifeRule;

  private currentCells: boolean[];
  private neighbors: number[][];

  constructor(rule: LifeRule, triangles: Uint16Array) {
    this.rule = rule;

    this.neighbors = computeNeighbors(triangles);
    this.currentCells = Array(this.neighbors.length).fill(false);
  }

  randomize(probability = 0.5): boolean[] {
    this.currentCells = this.currentCells.map(() => Math.random() <= probability);
    return this.currentCells;
  }

  get(): boolean[] {
    return this.currentCells;
  }

  // Returns the next generation
  nextGeneration(): boolean[] {
    const nextCells = Array(this.currentCells.length).fill(false);
    for (let i = 0; i < this.currentCells.length; i += 1) {
      if (this.currentCells[i]) {
        nextCells[i] = this.rule.testSurvive(this.getNumNeighbors(i));
      } else {
        nextCells[i] = this.rule.testBegin(this.getNumNeighbors(i));
      }
    }

    this.currentCells = nextCells;
    return this.currentCells;
  }

  private getNumNeighbors(cell: number): number {
    let total = 0;
    for (const neighbor of this.neighbors[cell]) {
      if (this.currentCells[neighbor]) {
        total += 1;
      }
    }

    return total;
  }
}

function computeNeighbors(triangles: Uint16Array): number[][] {
  const edgeMap = new EdgeMap();
  const neighbors: number[][] = Array(triangles.length / 3).fill([]);

  // Compute all of the edges
  for (let index = 0; index < triangles.length; index += 3) {
    const triangle = triangles.slice(index, index + 3);
    const triangleIndex = index / 3;

    edgeMap.addVertex(triangle[0], triangleIndex);
    edgeMap.addVertex(triangle[1], triangleIndex);
    edgeMap.addVertex(triangle[2], triangleIndex);
  }

  // Now find all of the neighbors
  for (let index = 0; index < triangles.length; index += 3) {
    const triangle = triangles.slice(index, index + 3);
    const triangleIndex = index / 3;

    const allNeighbors = [
      ...new Set(
        [
          edgeMap.getNeighbors(triangle[0]),
          edgeMap.getNeighbors(triangle[1]),
          edgeMap.getNeighbors(triangle[2]),
        ].flat(),
      ),
    ].filter((neighbor) => neighbor !== triangleIndex);

    neighbors[triangleIndex] = allNeighbors;
  }

  return neighbors;
}

class EdgeMap {
  private entry: Map<number, Set<number>>;

  constructor() {
    this.entry = new Map();
  }

  addVertex(vertex: number, index: number) {
    if (this.entry.has(vertex)) {
      this.entry.get(vertex).add(index);
    } else {
      this.entry.set(vertex, new Set([index]));
    }
  }

  getNeighbors(vertex: number): number[] {
    if (this.entry.has(vertex)) {
      return [...this.entry.get(vertex)];
    }

    return [];
  }
}
