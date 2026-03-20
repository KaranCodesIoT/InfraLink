import logger from './logger.js';

export default class MockBull {
    constructor(queueName) {
        this.queueName = queueName;
        logger.info(`Initialized mock queue: ${queueName}`);
    }

    on(event, callback) {
        // Do nothing
        return this;
    }

    async add(name, data, options) {
        // Mock add behavior
        logger.info(`Mock queue [${this.queueName}] job added`);
        return { id: Math.random().toString(36).substring(7) };
    }

    process(concurrency, processor) {
        // If processor is the only argument
        if (typeof concurrency === 'function') {
            processor = concurrency;
        }
        logger.info(`Mock queue [${this.queueName}] processor registered`);
    }
}
