// Extension Management for AI War Room
class ExtensionManager {
    constructor() {
        this.extensions = [];
        console.log('ExtensionManager initialized');
    }
    
    getExtensions() {
        console.log(`Getting extensions, found ${this.extensions.length} extensions`);
        return this.extensions;
    }
    
    installExtension(id, name, description) {
        this.extensions.push({ id, name, description, enabled: true });
        console.log(`Extension installed: ${name} (${id})`);
        return true;
    }
    
    enableExtension(id) {
        const ext = this.extensions.find(e => e.id === id);
        if (ext) {
            ext.enabled = true;
            console.log(`Extension enabled: ${id}`);
            return true;
        }
        console.log(`Extension not found for enabling: ${id}`);
        return false;
    }
    
    disableExtension(id) {
        const ext = this.extensions.find(e => e.id === id);
        if (ext) {
            ext.enabled = false;
            console.log(`Extension disabled: ${id}`);
            return true;
        }
        console.log(`Extension not found for disabling: ${id}`);
        return false;
    }
}

// Create global instance
window.ExtensionManager = ExtensionManager;
console.log('ExtensionManager class registered globally'); 