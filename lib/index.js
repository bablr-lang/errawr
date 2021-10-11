"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isError = exports.hasName = exports.invariant = exports.rawr = exports.Error = exports.Errawr = void 0;
const errawr_1 = __importDefault(require("./errawr"));
exports.Errawr = errawr_1.default;
exports.Error = errawr_1.default;
const rawr_1 = __importDefault(require("./rawr"));
exports.rawr = rawr_1.default;
const helpers_1 = require("./helpers");
Object.defineProperty(exports, "hasName", { enumerable: true, get: function () { return helpers_1.hasName; } });
Object.defineProperty(exports, "isError", { enumerable: true, get: function () { return helpers_1.isError; } });
exports.default = errawr_1.default;
