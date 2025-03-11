// Virtual Filesystem for AI War Room
class VirtualFileSystem {
    constructor() {
        this.files = {};
        console.log('VirtualFileSystem initialized');
    }
    
    createFile(path, content) {
        this.files[path] = content;
        console.log(`File created: ${path}`);
        return true;
    }
    
    readFile(path) {
        console.log(`Reading file: ${path}`);
        return this.files[path] || null;
    }
    
    deleteFile(path) {
        if (this.files[path]) {
            delete this.files[path];
            console.log(`File deleted: ${path}`);
            return true;
        }
        console.log(`File not found for deletion: ${path}`);
        return false;
    }
    
    listFiles() {
        const files = Object.keys(this.files);
        console.log(`Listing files, found ${files.length} files`);
        return files;
    }
}

// Create global instance
window.VirtualFileSystem = VirtualFileSystem;
console.log('VirtualFileSystem class registered globally'); 