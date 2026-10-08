"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = void 0;
const promise_1 = __importDefault(require("mysql2/promise"));
const index_1 = require("./index");
exports.pool = promise_1.default.createPool({
    host: index_1.config.db.host,
    port: index_1.config.db.port,
    user: index_1.config.db.user,
    password: index_1.config.db.password,
    database: index_1.config.db.database,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});
