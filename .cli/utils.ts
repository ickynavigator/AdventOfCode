import fs from "node:fs/promises";
import path from "node:path";
import { styleText } from "node:util";
import { log, outro } from "@clack/prompts";
import chokidar from "chokidar";

export const modes = {
	RUN_TEST: "run_tests",
	WATCH_TEST: "watch_tests",
	CREATE_DAY: "create_day",
} as const;

const __dirname = path.dirname(new URL(import.meta.url).pathname);

export async function doesFileExist(folderPath: string, fileName: string) {
	try {
		return await fs.readdir(folderPath).then((files) => files.includes(fileName));
	} catch {
		return false;
	}
}

export async function getTemplate(..._templatePath: string[]) {
	return await fs.readFile(path.resolve(__dirname, "template", ..._templatePath), {
		encoding: "utf8",
	});
}

export async function getYears(shouldNotFail = false) {
	try {
		const yearPath = path.resolve(__dirname, "..", "solutions");
		const availableYears = await fs.readdir(yearPath);

		return availableYears.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
	} catch (_err) {
		if (shouldNotFail) return [];
		outro(styleText("bgRed", "An error occured while trying to get the year list!"));

		process.exit(1);
	}
}

export async function getDays(year: string, shouldNotFail = false) {
	try {
		const dayPath = path.resolve(__dirname, "..", "solutions", year);
		const availableYears = await fs.readdir(dayPath);

		return availableYears.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
	} catch (_err) {
		if (shouldNotFail) return [];
		outro(styleText("bgRed", "An error occured while trying to get the day list!"));

		process.exit(1);
	}
}

export async function createDay(year: string, day: string) {
	const yearFolderPath = path.resolve(__dirname, "..", "solutions", year);
	const dayFolderPath = path.resolve(yearFolderPath, day);
	const indexPath = path.resolve(dayFolderPath, "index.ts");
	const inputPath = path.resolve(dayFolderPath, "input.txt");

	const dayExists = await doesFileExist(yearFolderPath, day);
	if (dayExists) {
		throw new Error("Day already exists!");
	}

	await fs.mkdir(dayFolderPath, { recursive: true });

	const template = await getTemplate("day.ts");
	await fs.writeFile(indexPath, template);
	await fs.writeFile(inputPath, "");
}

export async function runDay(year: string, day: string) {
	const dayPath = path.resolve(__dirname, "..", "solutions", year, day);

	await import(dayPath);
}

export async function watchDay(year: string, day: string) {
	return new Promise<void>((resolve, reject) => {
		const dayPath = path.resolve(__dirname, "..", "solutions", year, day, "index.ts");
		const inputPath = path.resolve(__dirname, "..", "solutions", year, day, "input.txt");

		const watcher = chokidar.watch([dayPath, inputPath]);

		const dayRunHandler = async () => {
			try {
				await import(dayPath);
			} catch (err) {
				console.error(err);
				log.error("Failed to run day! Saving the file to rerun.");
			}
		};

		const exitHandler = () => {
			log.info("Closing Watcher...");
			watcher.close();
			resolve();
		};

		watcher.on("change", dayRunHandler);

		watcher.on("error", reject);

		process.on("SIGINT", exitHandler);
		process.on("SIGTERM", exitHandler);
		process.on("SIGQUIT", exitHandler);
	});
}
