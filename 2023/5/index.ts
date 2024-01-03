const input = await Deno.readTextFile('./input.txt');

const PartOne = (input: string) => {
  const [seeds, ...data] = input.split('\n\n');
  const r = data.map(x => x.split('\n'));

  console.log(r, seeds);
};
PartOne(input);

const PartTwo = (input: string) => {};
PartTwo(input);
