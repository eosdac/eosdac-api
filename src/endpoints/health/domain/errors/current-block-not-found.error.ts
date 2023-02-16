export class CurrentBlockNotFoundError extends Error {
    constructor() {
        super('Current block not found');
    }
}
