// straight up lifted this code from Theo(T3/ping) and i do not plan to attempt it anytime soon
const input = await Deno.readTextFile('./input.txt');

// --- Day 12: Hill Climbing Algorithm ---
// You try contacting the Elves using your handheld device, but the river you're following must be too low to get a decent signal.

// You ask the device for a heightmap of the surrounding area (your puzzle input). The heightmap shows the local area from above broken into a grid; the elevation of each square of the grid is given by a single lowercase letter, where a is the lowest elevation, b is the next-lowest, and so on up to the highest elevation, z.

// Also included on the heightmap are marks for your current position (S) and the location that should get the best signal (E). Your current position (S) has elevation a, and the location that should get the best signal (E) has elevation z.

// You'd like to reach E, but to save energy, you should do it in as few steps as possible. During each step, you can move exactly one square up, down, left, or right. To avoid needing to get out your climbing gear, the elevation of the destination square can be at most one higher than the elevation of your current square; that is, if your current elevation is m, you could step to elevation n, but not to elevation o. (This also means that the elevation of the destination square can be much lower than the elevation of your current square.)

// For example:

// Sabqponm
// abcryxxl
// accszExk
// acctuvwj
// abdefghi
// Here, you start in the top-left corner; your goal is near the middle. You could start by moving down or right, but eventually you'll need to head toward the e at the bottom. From there, you can spiral around to the goal:

// v..v<<<<
// >v.vv<<^
// .>vv>E^^
// ..v>>>^^
// ..>>>>>^
// In the above diagram, the symbols indicate whether the path exits each square moving up (^), down (v), left (<), or right (>). The location that should get the best signal is still E, and . marks unvisited squares.

// This path reaches the goal in 31 steps, the fewest possible.

// What is the fewest steps required to move from your current position to the location that should get the best signal?

const letterToNumber = {
  a: 1,
  b: 2,
  c: 3,
  d: 4,
  e: 5,
  f: 6,
  g: 7,
  h: 8,
  i: 9,
  j: 10,
  k: 11,
  l: 12,
  m: 13,
  n: 14,
  o: 15,
  p: 16,
  q: 17,
  r: 18,
  s: 19,
  t: 20,
  u: 21,
  v: 22,
  w: 23,
  x: 24,
  y: 25,
  z: 26,

  S: 1,
  E: 26,
};
type Point = { x: number; y: number };
const PartOne = (input: string) => {
  const grid = input.split('\n').map(r => r.split(''));

  let start = { x: 0, y: 0 };
  let end = { x: 0, y: 0 };

  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      const tile = grid[y][x];
      if (tile === 'S') start = { x, y };
      if (tile === 'E') end = { x, y };
    }
  }

  const numberGrid = grid.map(row =>
    row.map(tile => letterToNumber[tile as keyof typeof letterToNumber]),
  );

  const allValidMoves = (point: Point) => {
    const { x, y } = point;

    const elevation = numberGrid[y][x];

    const allMoves = [
      { x: x - 1, y },
      { x: x + 1, y },
      { x, y: y - 1 },
      { x, y: y + 1 },
    ];

    return allMoves.filter(move => {
      const { x: x2, y: y2 } = move;

      if (x2 < 0 || y2 < 0) return false;
      if (x2 >= numberGrid[0].length || y2 >= numberGrid.length) return false;

      const elevation2 = numberGrid[y2][x2];

      return elevation2 <= elevation + 1;
    });
  };

  const allVisitedPoints: Set<string> = new Set([`${start.x},${start.y}`]);

  const pointToString = (point: Point) => `${point.x},${point.y}`;

  let incompletePaths: Point[][] = [[start]];

  while (incompletePaths.length > 0) {
    const newIncompletePaths: Point[][] = [];

    for (const incompletePath of incompletePaths) {
      const lastPoint = incompletePath[incompletePath.length - 1];
      const validMoves = allValidMoves(lastPoint);

      for (const move of validMoves) {
        if (allVisitedPoints.has(pointToString(move))) continue;

        allVisitedPoints.add(pointToString(move));

        const newIncompletePath = [...incompletePath];
        newIncompletePath.push(move);

        if (move.x === end.x && move.y === end.y) {
          console.log('ANSWER FOUND', newIncompletePath.length - 1);
          return;
        } else {
          newIncompletePaths.push(newIncompletePath);
        }
      }
    }

    incompletePaths = newIncompletePaths;
  }
};
PartOne(input);

// --- Part Two ---
// As you walk up the hill, you suspect that the Elves will want to turn this into a hiking trail. The beginning isn't very scenic, though; perhaps you can find a better starting point.

// To maximize exercise while hiking, the trail should start as low as possible: elevation a. The goal is still the square marked E. However, the trail should still be direct, taking the fewest steps to reach its goal. So, you'll need to find the shortest path from any square at elevation a to the square marked E.

// Again consider the example from above:

// Sabqponm
// abcryxxl
// accszExk
// acctuvwj
// abdefghi
// Now, there are six choices for starting position (five marked a, plus the square marked S that counts as being at elevation a). If you start at the bottom-left square, you can reach the goal most quickly:

// ...v<<<<
// ...vv<<^
// ...v>E^^
// .>v>>>^^
// >^>>>>>^
// This path reaches the goal in only 29 steps, the fewest possible.

// What is the fewest steps required to move starting from any square with elevation a to the location that should get the best signal?

const PartTwo = (input: string) => {
  const grid = input.split('\n').map(r => r.split(''));

  let start = { x: 0, y: 0 };
  let end = { x: 0, y: 0 };

  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      const tile = grid[y][x];
      if (tile === 'S') start = { x, y };
      if (tile === 'E') end = { x, y };
    }
  }

  const numberGrid = grid.map(row =>
    row.map(tile => letterToNumber[tile as keyof typeof letterToNumber]),
  );

  const allValidMoves = (point: Point) => {
    const { x, y } = point;

    const elevation = numberGrid[y][x];

    const allMoves = [
      { x: x - 1, y },
      { x: x + 1, y },
      { x, y: y - 1 },
      { x, y: y + 1 },
    ];

    return allMoves.filter(move => {
      const { x: x2, y: y2 } = move;

      if (x2 < 0 || y2 < 0) return false;
      if (x2 >= numberGrid[0].length || y2 >= numberGrid.length) return false;

      const elevation2 = numberGrid[y2][x2];

      return elevation2 >= elevation - 1;
    });
  };

  const allVisitedPoints: Set<string> = new Set([`${start.x},${start.y}`]);

  const pointToString = (point: Point) => `${point.x},${point.y}`;

  let incompletePaths: Point[][] = [[end]];

  while (incompletePaths.length > 0) {
    const newIncompletePaths: Point[][] = [];

    for (const incompletePath of incompletePaths) {
      const lastPoint = incompletePath[incompletePath.length - 1];
      const validMoves = allValidMoves(lastPoint);

      for (const move of validMoves) {
        if (allVisitedPoints.has(pointToString(move))) continue;

        allVisitedPoints.add(pointToString(move));

        const newIncompletePath = [...incompletePath];
        newIncompletePath.push(move);

        const valAtPoint = numberGrid[move.y][move.x];

        if (valAtPoint === 1) {
          console.log('ANSWER FOUND', newIncompletePath.length - 1);
          return;
        } else {
          newIncompletePaths.push(newIncompletePath);
        }
      }
    }

    incompletePaths = newIncompletePaths;
  }
};
PartTwo(input);
