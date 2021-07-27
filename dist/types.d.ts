/**
 * Configuration options for the Fly.io nodejs client.
 */
export interface Options {
    /** HTTP methods that should be replayed automatically */
    replayHttpMethods?: Array<String>;
    replayThresholdInSeconds: number;
}
