import { watch } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
import { styleText } from "node:util";
import { log, outro } from "@clack/prompts";

export class _FileManager {
	__dirname = path.dirname(new URL(import.meta.url).pathname);

	async doesFileExist(folderPath: string, fileName: string) {
		try {
			return await fs.readdir(folderPath).then((files) => files.includes(fileName));
		} catch {
			return false;
		}
	}

	async getSortedList(location: string[], shouldNotFail: boolean) {
		let files: string[];

		try {
			files = await fs.readdir(path.resolve(this.__dirname, ...location));
		} catch {
			if (shouldNotFail) {
				files = [];
			} else {
				outro(styleText("bgRed", "An error occured while trying to get the list!"));
				process.exit(1);
			}
		}

		return files.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
	}

	async watch(
		files: string[],
		options?: {
			onChange?: (path: string) => void;
			onError?: (err: unknown) => void;
			onExit?: () => void;
			clearOnSave?: boolean;
		},
	) {
		return new Promise<void>((resolve, reject) => {
			const errorHandler = (error: Error) => {
				options?.onError?.(error);

				reject(error);
			};

			const exitHandler = () => {
				options?.onExit?.();

				watchers.forEach((watcher) => watcher.close());

				resolve();
			};

			const watchers = files.map((file) => {
				const watcher = watch(file, (eventType) => {
					if (eventType !== "change") return;
					if (options?.clearOnSave) process.stdout.write("\x1Bc");

					log.info("File save detected! Rerunning");
					options?.onChange?.(file);
				});

				watcher.on("error", errorHandler);

				return watcher;
			});

			process.once("SIGINT", exitHandler).once("SIGTERM", exitHandler).once("SIGQUIT", exitHandler);
		});
	}
}

export const FileManager = new _FileManager();

export async function getYears(shouldNotFail = false) {
	return FileManager.getSortedList(["..", "solutions"], shouldNotFail);
}

export async function getDays(year: string, shouldNotFail = false) {
	return FileManager.getSortedList(["..", "solutions", year], shouldNotFail);
}
