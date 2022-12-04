export class TimeoutError extends Error {
    get [Symbol.toStringTag](): string {
        return this.constructor.name;
    }

    constructor(message: string) {
        super(message);
        
        this.name = this.constructor.name;

        Error.captureStackTrace(this, this.constructor);
    }
}