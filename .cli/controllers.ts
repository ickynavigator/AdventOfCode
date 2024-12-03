import fs from "node:fs/promises";
import path from "node:path";
import { log } from "@clack/prompts";
import { FileManager } from "./utils";

export async function createDay(year: string, day: string) {
	log.info(`Creating ${year}/${day}`);

	const yearFolderPath = path.resolve(FileManager.__dirname, "..", "solutions", year);

	const dayFolderPath = path.resolve(yearFolderPath, day);

	const indexPath = path.resolve(dayFolderPath, "index.ts");
	const inputPath = path.resolve(dayFolderPath, "input.txt");

	const dayExists = await FileManager.doesFileExist(yearFolderPath, day);
	if (dayExists) {
		throw new Error("Day already exists!");
	}

	await fs.mkdir(dayFolderPath, { recursive: true });

	const templatePath = path.resolve(FileManager.__dirname, "template", "day.ts");
	const _template = await fs.readFile(templatePath, { encoding: "utf8" });
	const template = `// https://adventofcode.com/${year}/day/${day}

${_template}`;

	await fs.writeFile(indexPath, template);
	await fs.writeFile(inputPath, "");

	const newPath = `./solutions/${year}/${day}`;

	log.success(`Day created! go to ${newPath}/index.ts to start!`);
	log.info(`AOC link: https://adventofcode.com/${year}/day/${day}`);
	log.info(`Remember to add your input to ${newPath}/input.txt!`);
}

export async function runDay(year: string, day: string) {
	log.info(`Running ${year}/${day}`);

	await import(path.resolve(FileManager.__dirname, "..", "solutions", year, day, "index.ts"));
}

export async function watchDay(year: string, day: string) {
	log.info(`Running ${year}/${day} in watch mode...`);

	const folderPath = path.resolve(FileManager.__dirname, "..", "solutions", year, day);

	const dayPath = path.resolve(folderPath, "index.ts");
	const inputPath = path.resolve(folderPath, "input.txt");

	FileManager.watch([dayPath, inputPath], {
		async onChange() {
			try {
				await import(`${dayPath}?cacheBust=${Date.now()}`);
			} catch {
				log.error("Failed to run day! Save the file to rerun.");
			}
		},
		onExit() {
			log.info("Closing Watcher...");
		},
	});
}
