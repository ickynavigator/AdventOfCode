import fs from "node:fs/promises";
import path from "node:path";
import { styleText } from "node:util";
import { log, outro } from "@clack/prompts";
import chokidar from "chokidar";

export class _FileManager {
	__dirname = path.dirname(new URL(import.meta.url).pathname);

	async doesFileExist(folderPath: string, fileName: string) {
		try {
			return await fs.readdir(folderPath).then((files) => files.includes(fileName));
		} catch {
			return false;
		}
	}

	async #_getDirList(...location: string[]) {
		return await fs.readdir(path.resolve(this.__dirname, ...location));
	}

	private async getDirList(...location: string[]) {
		try {
			return await this.#_getDirList(...location);
		} catch {
			outro(styleText("bgRed", "An error occured while trying to get the list!"));
			process.exit(1);
		}
	}

	private async getDirList_safe(...location: string[]) {
		try {
			return await this.#_getDirList(...location);
		} catch {
			return [];
		}
	}

	async getSortedList(path: string[], shouldNotFail: boolean) {
		let method;

		if (shouldNotFail) {
			method = this.getDirList;
		} else {
			method = this.getDirList_safe;
		}

		const _files = await method(...path);
		return _files.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
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
			const watcher = chokidar.watch(files);

			const changeHandler = (path: string) => {
				if (options?.clearOnSave) {
					process.stdout.write("\x1Bc");
				}
				log.info("File save detected! Rerunning");
				options?.onChange?.(path);
			};

			const errorHandler = (error: unknown) => {
				options?.onError?.(error);

				reject();
			};

			const exitHandler = () => {
				options?.onExit?.();

				watcher.close?.();
				resolve();
			};

			watcher.on("change", changeHandler).on("error", errorHandler);
			process.on("SIGINT", exitHandler).on("SIGTERM", exitHandler).on("SIGQUIT", exitHandler);
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
