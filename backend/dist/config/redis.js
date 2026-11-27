"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isRedisAvailable = exports.redisClient = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
const index_js_1 = require("./index.js");
let redisClient = null;
exports.redisClient = redisClient;
let isRedisAvailable = false;
exports.isRedisAvailable = isRedisAvailable;
let redisWarningLogged = false;
try {
    exports.redisClient = redisClient = new ioredis_1.default(index_js_1.config.redisUrl, {
        maxRetriesPerRequest: null,
        enableReadyCheck: false,
        autoResubscribe: false,
        connectTimeout: 2000,
        retryStrategy(times) {
            if (times > 1) {
                // Discontinue retries if Redis is not running locally
                if (!redisWarningLogged) {
                    redisWarningLogged = true;
                    console.log('ℹ️ Redis is offline or not installed locally. BullMQ will gracefully use the in-process cron scheduler.');
                }
                return null;
            }
            return 1000;
        },
    });
    redisClient.on('connect', () => {
        console.log('✅ Connected to Redis successfully (BullMQ Queue active)');
        exports.isRedisAvailable = isRedisAvailable = true;
    });
    redisClient.on('error', (_err) => {
        exports.isRedisAvailable = isRedisAvailable = false;
        if (!redisWarningLogged) {
            redisWarningLogged = true;
            console.log('ℹ️ Redis is offline or not installed locally. BullMQ will gracefully use the in-process cron scheduler.');
        }
    });
}
catch (error) {
    if (!redisWarningLogged) {
        redisWarningLogged = true;
        console.log('ℹ️ Redis unavailable. Using automated in-process Cron fallback for RSS news.');
    }
}
