import EventEmitter from 'events';
import logger from '../utils/logger.js';

/**
 * Central application event bus.
 * Import this singleton everywhere events are emitted or consumed.
 */
const eventBus = new EventEmitter();
eventBus.setMaxListeners(30);

eventBus.on('error', (err) => logger.error(`EventBus error: ${err.message}`));

export default eventBus;
