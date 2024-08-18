import { styleText } from "node:util";
import { intro, log, outro } from "@clack/prompts";
import { Command } from "commander";
import { name, version } from "../package.json";
import {
	getDayBySelectPrompt,
	getDayByTextPrompt,
	getModeByPrompt,
	getYearBySelectPrompt,
	getYearByTextPrompt,
} from "./prompts";
import { createDay, modes, runDay, watchDay } from "./utils";

export interface CLIFlags {
	mode: (typeof modes)[keyof typeof modes];
	year: string;
	day: string;
	watch: boolean;
}

async function cli() {
	process.stdout.write("\x1Bc");

	const program = new Command()
		.name(name)
		.description("CLI for automating the AOC solutions creation/test process")
		.version(version, "-v, --version", "Display the version number")
		.action(() => {
			main({});
		});

	program
		.command("create")
		.description("Create a new day solution")
		.option("-y, --year [number]", "The year of the challenge")
		.option("-d, --day [number]", "The day of the challenge")
		.action((options) => {
			main({
				mode: modes.CREATE_DAY,
				year: options.year,
				day: options.day,
			});
		});

	program
		.command("run")
		.description("Run the tests for a day solution")
		.option("-y, --year [number]", "The year of the challenge")
		.option("-d, --day [number]", "The day of the challenge")
		.option("-w, --watch [boolean]", "Watch test", (arg) => !!arg && arg !== "false")
		.action((options) => {
			main({
				mode: options.watch ? modes.WATCH_TEST : modes.RUN_TEST,
				year: options.year,
				day: options.day,
			});
		});

	program.parse();
}

async function main(args: Partial<CLIFlags>) {
	intro(styleText(["bgRed"], " Advent of Code! "));

	const mode = args.mode || (await getModeByPrompt());

	switch (mode) {
		case modes.RUN_TEST: {
			const year = args.year || (await getYearBySelectPrompt());
			const day = args.day || (await getDayBySelectPrompt(year));

			log.info(`Running ${year}/${day}`);

			try {
				await runDay(year, day);
			} catch {
				log.error(`Failed to run day ${year}/${day}!. Does it exist?`);
			}
			break;
		}
		case modes.WATCH_TEST: {
			const year = args.year || (await getYearBySelectPrompt());
			const day = args.day || (await getDayBySelectPrompt(year));

			log.info(`Running ${year}/${day} in watch mode...`);

			try {
				await watchDay(year, day);
			} catch {
				log.error(`Failed to run day ${year}/${day}!. Does it exist?`);
			}
			break;
		}
		case modes.CREATE_DAY: {
			const year = args.year || (await getYearByTextPrompt());
			const day = args.day || (await getDayByTextPrompt(year));

			try {
				await createDay(year, day);

				const newPath = `./solutions/${year}/${day}`;
				log.success(`Day created! go to ${newPath}/index.ts to start!`);
				log.info(`AOC link: https://adventofcode.com/${year}/day/${day}`);
				log.info(`Remember to add your input to ${newPath}/input.txt!`);
			} catch {
				log.error("Failed to create day! Does it already exist?");
			}
			break;
		}
		default: {
			outro("That mode is not valid or has not been implemented!");
			process.exit(1);
		}
	}

	outro("Goodbye!");
}

cli().catch(console.error);
