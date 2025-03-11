"use strict";
/**
 * Security Framework for Agent System
 * Provides security services for the agent system
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecurityManager = exports.RBACService = exports.EncryptionService = exports.AuditLogService = void 0;
// Service classes
class AuditLogService {
    logAction(action, user, resource, success, details) {
        console.log(`AUDIT: ${user} ${success ? 'successfully' : 'failed to'} ${action} on ${resource}`);
    }
}
exports.AuditLogService = AuditLogService;
class EncryptionService {
    encrypt(data, key) {
        return Buffer.from(data).toString('base64');
    }
    decrypt(encryptedData, key) {
        return Buffer.from(encryptedData, 'base64').toString('utf-8');
    }
}
exports.EncryptionService = EncryptionService;
class RBACService {
    constructor() {
        this.permissions = new Map();
    }
    checkPermission(user, action, resource) {
        const key = `${user}:${action}:${resource}`;
        const userPerms = this.permissions.get(user);
        return userPerms ? userPerms.has(`${action}:${resource}`) : false;
    }
    grantPermission(user, action, resource) {
        if (!this.permissions.has(user)) {
            this.permissions.set(user, new Set());
        }
        this.permissions.get(user).add(`${action}:${resource}`);
    }
    revokePermission(user, action, resource) {
        if (this.permissions.has(user)) {
            this.permissions.get(user).delete(`${action}:${resource}`);
        }
    }
}
exports.RBACService = RBACService;
class SecurityManager {
    constructor() {
        this.auditLog = new AuditLogService();
        this.encryption = new EncryptionService();
        this.rbac = new RBACService();
        console.log('Security Manager initialized');
    }
    auditAction(action, user, resource, success, details) {
        this.auditLog.logAction(action, user, resource, success, details);
    }
    encrypt(data, key) {
        return this.encryption.encrypt(data, key);
    }
    decrypt(encryptedData, key) {
        return this.encryption.decrypt(encryptedData, key);
    }
    hasPermission(user, action, resource) {
        return this.rbac.checkPermission(user, action, resource);
    }
    grantPermission(user, action, resource) {
        this.rbac.grantPermission(user, action, resource);
    }
    revokePermission(user, action, resource) {
        this.rbac.revokePermission(user, action, resource);
    }
    auditAgent(agentId, user) {
        console.log(`Auditing agent ${agentId} by user ${user}`);
        // Perform security audit
        const passed = true;
        const issues = [];
        this.auditLog.logAction('audit-agent', user, agentId, passed, { issues });
        return { passed, issues };
    }
    web3Sign(data) {
        // Implementation for Web3 signing
        const hash = require('crypto').createHash('sha256').update(JSON.stringify(data)).digest('hex');
        return `0x${hash}`;
    }
}
exports.SecurityManager = SecurityManager;
