"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pino_1 = __importDefault(require("pino"));
const transport = pino_1.default.transport({
    targets: [
        {
            target: 'pino/file',
            level: "info",
            options: { destination: "logs/app.log" }
        },
        {
            target: 'pino-pretty',
            level: 'debug',
            options: {
                colorize: true,
                translateTime: 'SYS:standard',
                singleLine: false, // optional: format logs cleaner
                ignore: 'pid,hostname'
            }
        }
    ]
});
const logger = (0, pino_1.default)(transport);
exports.default = logger;
