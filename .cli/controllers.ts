import fs from "node:fs/promises";
import path from "node:path";
import { log } from "@clack/prompts";
import { simpleGit } from "simple-git";
import { FileManager, getDays, getYears } from "./utils.ts";

export async function createDay(year: string, day: string) {
	log.info(`Creating ${year}/${day}`);

	const yearFolderPath = path.resolve(FileManager.__dirname, "..", "solutions", year);

	const dayFolderPath = path.resolve(yearFolderPath, day);

	const indexPath = path.resolve(dayFolderPath, "index.ts");
	const inputPath = path.resolve(dayFolderPath, "input.txt");

	const dayIndexExists = await FileManager.doesFileExist(dayFolderPath, "index.ts");
	if (!dayIndexExists) {
		await fs.mkdir(dayFolderPath, { recursive: true });

		const templatePath = path.resolve(FileManager.__dirname, "template", "day.ts");
		const _template = await fs.readFile(templatePath, { encoding: "utf8" });
		const template = `// https://adventofcode.com/${year}/day/${day}

${_template}`;

		await fs.writeFile(indexPath, template);

		log.success(`Day created! go to ./solutions/${year}/${day}/index.ts to start!`);
	} else {
		log.info(`Day already created! go to ./solutions/${year}/${day}/index.ts to start!`);
	}

	const dayInputExists = await FileManager.doesFileExist(dayFolderPath, "input.txt");
	if (!dayInputExists) {
		await fs.writeFile(inputPath, "");

		log.success(`Remember to add your input to ./solutions/${year}/${day}/input.txt!`);
	} else {
		log.info(`You can update your input at ./solutions/${year}/${day}/input.txt!`);
	}

	log.info(`AOC link: https://adventofcode.com/${year}/day/${day}`);
}

export async function runDay(year: string, day: string) {
	log.info(`Running ${year}/${day}`);

	await import(path.resolve(FileManager.__dirname, "..", "solutions", year, day, "index.ts"));
}

export async function runAllDays(options?: { changedOnly?: boolean }) {
	const changedDays = options?.changedOnly ? await getChangedDays() : undefined;
	let hasChangedDays = false;

	const years = await getYears(true);

	for (const currentYear of years) {
		const days = await getDays(currentYear, true);

		for (const currentDay of days) {
			if (changedDays && !changedDays.has(`${currentYear}/${currentDay}`)) {
				continue;
			}

			hasChangedDays = true;

			try {
				await runDay(currentYear, currentDay);
			} catch {
				log.error(`Failed to run day ${currentYear}/${currentDay}!. Does it exist?`);
			}
		}
	}

	if (options?.changedOnly && !hasChangedDays) {
		log.info("No changed solutions to run.");
	}
}

export async function watchDay(year: string, day: string) {
	log.info(`Running ${year}/${day} in watch mode...`);

	const folderPath = path.resolve(FileManager.__dirname, "..", "solutions", year, day);

	const dayPath = path.resolve(folderPath, "index.ts");
	const inputPath = path.resolve(folderPath, "input.txt");

	return FileManager.watch([dayPath, inputPath], {
		clearOnSave: true,
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

async function getChangedDays() {
	const repositoryRoot = path.resolve(FileManager.__dirname, "..");
	const { files } = await simpleGit(repositoryRoot).status([
		"--untracked-files=all",
		"--",
		"solutions",
	]);
	const changedDays = new Set<string>();

	for (const file of files) {
		addSolutionDay(file.path, changedDays);
		if (file.from) {
			addSolutionDay(file.from, changedDays);
		}
	}

	return changedDays;
}

function addSolutionDay(filePath: string, changedDays: Set<string>) {
	const pathParts = filePath.split(path.sep);

	if (pathParts.length >= 3 && pathParts[0] === "solutions") {
		changedDays.add(`${pathParts[1]}/${pathParts[2]}`);
	}
}
