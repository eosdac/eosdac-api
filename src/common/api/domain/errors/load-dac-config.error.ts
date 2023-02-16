export class LoadDacConfigError extends Error {
	constructor() {
		super(`Unable to load dac config`);
	}
}
