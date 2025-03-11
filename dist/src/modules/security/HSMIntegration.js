"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HSMService = void 0;
const node_pkcs11_1 = require("node-pkcs11");
const SecurityFramework_1 = require("./SecurityFramework");
class HSMService {
    constructor(hsmConfig) {
        const hsm = new node_pkcs11_1.PKCS11();
        hsm.load(hsmConfig.lib);
        this.hsmSession = hsm.openSession(0, node_pkcs11_1.PKCS11.CKF_RW_SESSION);
        this.hsmSession.login(hsmConfig.pin);
        this.securityManager = new SecurityFramework_1.SecurityManager();
    }
    async secureKeyOperation(operation) {
        const hsmKey = await this.getHSMKey();
        return this.securityManager.wrapOperation(() => {
            return this.hsmSession.createSecureContext(hsmKey, operation);
        });
    }
    async getHSMKey() {
        // Retrieve HSM-stored key handle
    }
}
exports.HSMService = HSMService;
