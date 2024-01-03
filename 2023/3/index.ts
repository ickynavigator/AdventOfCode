const input = await Deno.readTextFile('./input.txt');

/**
--- Day 3: Gear Ratios ---

You and the Elf eventually reach a gondola lift station; he says the gondola lift will take you up to the water source, but this is as far as he can bring you. You go inside.

It doesn't take long to find the gondolas, but there seems to be a problem: they're not moving.

"Aaah!"

You turn around to see a slightly-greasy Elf with a wrench and a look of surprise. "Sorry, I wasn't expecting anyone! The gondola lift isn't working right now; it'll still be a while before I can fix it." You offer to help.

The engineer explains that an engine part seems to be missing from the engine, but nobody can figure out which one. If you can add up all the part numbers in the engine schematic, it should be easy to work out which part is missing.

The engine schematic (your puzzle input) consists of a visual representation of the engine. There are lots of numbers and symbols you don't really understand, but apparently any number adjacent to a symbol, even diagonally, is a "part number" and should be included in your sum. (Periods (.) do not count as a symbol.)

Here is an example engine schematic:

467..114..
...*......
..35..633.
......#...
617*......
.....+.58.
..592.....
......755.
...$.*....
.664.598..

In this schematic, two numbers are not part numbers because they are not adjacent to a symbol: 114 (top right) and 58 (middle right). Every other number is adjacent to a symbol and so is a part number; their sum is 4361.

Of course, the actual engine schematic is much larger. What is the sum of all of the part numbers in the engine schematic?
 */
const PartOne = (input: string) => {
  const inputArr = input.split('\n');

  const coords: [number, number][] = [];
  let score = 0;

  inputArr.forEach((t, i) => {
    const f = /[^\d.]/g.exec(t);
    if (f) coords.push([f.index, i]);
  });

  const get = (x: number, y: number) => {
    return inputArr?.[y]?.[x];
  };

  const locations = (x: number, y: number) => {
    return [
      [x - 1, y],
      [x + 1, y],
      [x, y - 1],
      [x, y + 1],
      [x - 1, y - 1],
      [x - 1, y + 1],
      [x + 1, y - 1],
      [x + 1, y + 1],
    ] as const;
  };

  const getNeighbours = (loc: [number, number]) => {
    const [x, y] = loc;
    const dirs = [1, -1];
    const str = [get(...loc)];

    dirs.forEach(dir => {
      let c = get(x, y);

      console.log(c, dir);

      while (c !== '.') {
        if (dir == 1) str.push(c);
        else str.unshift(c);

        c = get(x, y + dir);
        console.log(c);
      }
    });
  };

  const valids: number[] = [];
  coords.forEach(coord => {
    locations(...coord).forEach(loc => {
      if (get(...loc) !== '.') {
        // const f = getNeighbours([...loc]);
        console.log(loc, get(...loc));
      }
    });
  });
  // console.log(valids);
  // console.log(score);
};
PartOne(input);

const PartTwo = (_input: string) => {};
PartTwo(input);
