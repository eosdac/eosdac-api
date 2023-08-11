import { PingOutput } from '../ping.output'
import { Result } from '@alien-worlds/aw-core';

describe('PingOutput', () => {
    describe('create', () => {
        it('should create a PingOutput instance with a successful result', () => {
            const successfulResult = Result.withContent('Pong');

            const pingOutput = PingOutput.create(successfulResult);

            expect(pingOutput).toBeInstanceOf(PingOutput);
            expect(pingOutput.result).toEqual(successfulResult);
        });

        it('should create a PingOutput instance with a failure result', () => {
            const failureResult = Result.withFailure('Some error message');

            const pingOutput = PingOutput.create(failureResult);

            expect(pingOutput).toBeInstanceOf(PingOutput);
            expect(pingOutput.result).toEqual(failureResult);
        });
    });

    describe('toJSON', () => {
        it('should return a JSON representation for a successful result', () => {
            const content = 'Pong';
            const successfulResult = Result.withContent(content);
            const pingOutput = PingOutput.create(successfulResult);

            const jsonOutput = pingOutput.toJSON();

            expect(jsonOutput).toEqual({
                ping: content,
            });
        });

        it('should return an empty object for a failure result', () => {
            const failureResult = Result.withFailure('Some error message');
            const pingOutput = PingOutput.create(failureResult);

            const jsonOutput = pingOutput.toJSON();

            expect(jsonOutput).toEqual({});
        });
    });
});
