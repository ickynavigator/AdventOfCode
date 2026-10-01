import { styleText } from "node:util";
import { intro, log, outro } from "@clack/prompts";
import { Command, Option } from "commander";
import packageJson from "../package.json" with { type: "json" };
import { modes } from "./constants.ts";
import { createDay, runAllDays, runDay, watchDay } from "./controllers.ts";
import {
	getDayBySelectPrompt,
	getDayByTextPrompt,
	getModeByPrompt,
	getYearBySelectPrompt,
	getYearByTextPrompt,
} from "./prompts.ts";

const { name, version } = packageJson;

export interface CLIFlags {
	mode: (typeof modes)[keyof typeof modes];
	year: string;
	day: string;
	watch: boolean;
	runall: boolean;
	changed: boolean;
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
		.addOption(
			new Option(
				"-a, --runall [boolean]",
				"Run all days (within the given year, or across all years if no year is given)",
			)
				.argParser((arg) => !!arg && arg !== "false")
				.conflicts(["year", "day", "watch"]),
		)
		.addOption(
			new Option("-c, --changed", "Run only solutions with uncommitted changes").conflicts([
				"year",
				"day",
				"watch",
				"runall",
			]),
		)
		.action((options) => {
			main({
				mode: options.watch ? modes.WATCH_TEST : modes.RUN_TEST,
				year: options.year,
				day: options.day,
				runall: options.runall,
				changed: options.changed,
			});
		});

	program.parse();
}

async function main(args: Partial<CLIFlags>) {
	intro(styleText(["bgRed"], " Advent of Code! "));

	const mode = args.mode || (await getModeByPrompt());

	switch (mode) {
		case modes.RUN_TEST: {
			if (args.runall || args.changed) {
				try {
					await runAllDays({ changedOnly: args.changed });
				} catch {
					log.error(args.changed ? "Failed to run changed days!" : "Failed to run all days!");
				}
				break;
			}

			const year = args.year || (await getYearBySelectPrompt());
			const day = args.day || (await getDayBySelectPrompt(year));

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
