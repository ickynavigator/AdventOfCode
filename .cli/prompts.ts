import { cancel, isCancel, select, text } from "@clack/prompts";
import { getDays, getYears, modes } from "./utils";

export async function getModeByPrompt() {
	const mode = await select<Array<{ value: string; label: string }>, string>({
		message: "Select a mode.",
		options: [
			{
				value: modes.RUN_TEST,
				label: "Run tests",
			},
			{
				value: modes.WATCH_TEST,
				label: "Watch tests",
			},
			{
				value: modes.CREATE_DAY,
				label: "Create a new day",
			},
		],
	});
	if (isCancel(mode)) {
		cancel("Operation cancelled");

		process.exit(0);
	}

	return mode;
}

export async function getYearBySelectPrompt() {
	const availableYears = await getYears();
	const availableYearOptions = availableYears.map((y) => ({ value: y }));

	const year = await select<Array<{ value: string }>, string>({
		message: "Pick a year.",
		options: availableYearOptions,
		initialValue: availableYearOptions[availableYearOptions.length - 1].value,
	});
	if (isCancel(year)) {
		cancel("Operation cancelled");
		process.exit(0);
	}

	return year;
}

export async function getDayBySelectPrompt(year: string) {
	const availableDays = await getDays(year);
	const availableDayOptions = availableDays.map((y) => ({ value: y }));

	const day = await select<Array<{ value: string }>, string>({
		message: "Pick a day.",
		options: availableDayOptions,
		initialValue: availableDayOptions[availableDayOptions.length - 1].value,
	});
	if (isCancel(day)) {
		cancel("Operation cancelled");
		process.exit(0);
	}

	return day;
}

export async function getYearByTextPrompt() {
	const currentYear = new Date().getFullYear();

	const START_YEAR = 2015;
	const END_YEAR = new Date().getMonth() === 11 ? currentYear : currentYear - 1;

	const _year = await text({
		message: "What year?",
		initialValue: currentYear.toString(),
		validate: (value) => {
			if (!/^\d{4}$/.test(value.trim())) {
				return "Please enter a valid year.";
			}

			const year = Number.parseInt(value.trim(), 10);
			if (year < START_YEAR || year > END_YEAR) {
				return `Please enter a year between ${START_YEAR} and ${END_YEAR}.`;
			}
		},
	});
	if (isCancel(_year)) {
		cancel("Operation cancelled");
		return process.exit(0);
	}
	const year = _year.trim();

	return year;
}

export async function getDayByTextPrompt(year: string) {
	const availableDays = await getDays(year, true);
	const highestDay = Math.max(0, ...availableDays.map(Number));

	const _day = await text({
		message: "Pick a day.",
		initialValue: (highestDay + 1).toString(),
		validate: (value) => {
			if (availableDays.includes(value.trim())) {
				return "That day has already been created.";
			}

			const day = Number.parseInt(value.trim(), 10);
			if (day < 1 || day > 25) {
				return "Please enter a day between 1 and 25.";
			}
		},
	});
	if (isCancel(_day)) {
		cancel("Operation cancelled");
		return process.exit(0);
	}
	const day = _day.trim();

	return day;
}
