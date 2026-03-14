// Top-level AI controller — re-exports sub-module controllers for convenience.
// The detailed logic lives inside chatbot/, voice/, vision/, assistant/, escalation/.

export * as chatbot from './chatbot/chatbot.controller.js';
export * as voice from './voice/voice.controller.js';
export * as vision from './vision/vision.controller.js';
export * as assistant from './assistant/assistant.controller.js';
export * as escalation from './escalation/escalation.controller.js';
