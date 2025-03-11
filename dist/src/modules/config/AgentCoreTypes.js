"use strict";
/**
 * Core types for the Agent system
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentPermissionLevel = exports.AgentStatus = void 0;
var AgentStatus;
(function (AgentStatus) {
    AgentStatus["IDLE"] = "idle";
    AgentStatus["RUNNING"] = "running";
    AgentStatus["PAUSED"] = "paused";
    AgentStatus["ERROR"] = "error";
})(AgentStatus || (exports.AgentStatus = AgentStatus = {}));
var AgentPermissionLevel;
(function (AgentPermissionLevel) {
    AgentPermissionLevel["READ"] = "read";
    AgentPermissionLevel["WRITE"] = "write";
    AgentPermissionLevel["EXECUTE"] = "execute";
    AgentPermissionLevel["ADMIN"] = "admin";
})(AgentPermissionLevel || (exports.AgentPermissionLevel = AgentPermissionLevel = {}));
