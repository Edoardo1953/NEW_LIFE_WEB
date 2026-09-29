/**
 * NEW LIFE Sàrl - Document Storage Utility (IndexedDB + Server Sync + DataURL fallback)
 * Persists and retrieves binary PDF/Office documents locally and synchronizes with docs/ folder.
 */

const DocStorage = (function() {
    const DB_NAME = 'NewLifeDocsDB';
    const DB_VERSION = 1;
    const STORE_NAME = 'documents_blob_store';

    let dbPromise = null;

    function openDB() {
        if (!dbPromise) {
            dbPromise = new Promise((resolve) => {
                if (!window.indexedDB) {
                    console.warn('IndexedDB non disponibile.');
                    resolve(null);
                    return;
                }
                try {
                    const request = indexedDB.open(DB_NAME, DB_VERSION);
                    request.onupgradeneeded = function(e) {
                        const db = e.target.result;
                        if (!db.objectStoreNames.contains(STORE_NAME)) {
                            db.createObjectStore(STORE_NAME, { keyPath: 'id' });
                        }
                    };
                    request.onsuccess = function(e) {
                        resolve(e.target.result);
                    };
                    request.onerror = function(e) {
                        console.warn('IndexedDB open error:', e);
                        resolve(null);
                    };
                } catch (err) {
                    console.warn('IndexedDB exception:', err);
                    resolve(null);
                }
            });
        }
        return dbPromise;
    }

    async function fileToBase64(file) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => resolve(null);
            reader.readAsDataURL(file);
        });
    }

    async function saveFile(id, fileOrBlob, filename, mimeType) {
        const fname = filename || fileOrBlob.name || 'document.pdf';
        const type = mimeType || fileOrBlob.type || 'application/pdf';
        let serverSaved = false;

        // 1. Try uploading to local python server if active
        try {
            const formData = new FormData();
            formData.append('file', fileOrBlob, fname);
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });
            if (res.ok) {
                const data = await res.json();
                if (data.success) {
                    serverSaved = true;
                    console.log('File successfully saved to docs/ via server:', fname);
                }
            }
        } catch (e) {
            // Offline / file:// protocol / no server
        }

        // 2. Read as base64 for fallback storage
        let dataUrl = null;
        try {
            dataUrl = await fileToBase64(fileOrBlob);
        } catch (e) {
            console.warn('Could not convert file to base64:', e);
        }

        // 3. Save into IndexedDB
        try {
            const db = await openDB();
            if (db) {
                await new Promise((resolve) => {
                    const tx = db.transaction(STORE_NAME, 'readwrite');
                    const store = tx.objectStore(STORE_NAME);
                    const record = {
                        id: id,
                        blob: fileOrBlob,
                        dataUrl: dataUrl,
                        filename: fname,
                        type: type,
                        size: fileOrBlob.size || 0,
                        serverSaved: serverSaved,
                        updatedAt: new Date().toISOString()
                    };
                    const req = store.put(record);
                    req.onsuccess = () => resolve(true);
                    req.onerror = () => resolve(false);
                });
            }
        } catch (err) {
            console.warn('Failed to save to IndexedDB:', err);
        }

        return {
            success: true,
            filename: fname,
            filepath: `docs/${fname}`,
            serverSaved: serverSaved
        };
    }

    async function getFile(id) {
        try {
            const db = await openDB();
            if (!db) return null;
            return new Promise((resolve) => {
                const tx = db.transaction(STORE_NAME, 'readonly');
                const store = tx.objectStore(STORE_NAME);
                const req = store.get(id);
                req.onsuccess = () => resolve(req.result ? req.result : null);
                req.onerror = () => resolve(null);
            });
        } catch (err) {
            return null;
        }
    }

    async function getFileUrl(id, fallbackPath) {
        const item = await getFile(id);
        if (item) {
            if (item.blob) {
                try {
                    return URL.createObjectURL(item.blob);
                } catch (e) {}
            }
            if (item.dataUrl) {
                return item.dataUrl;
            }
        }
        return fallbackPath || null;
    }

    async function hasFile(id) {
        const item = await getFile(id);
        return !!(item && (item.blob || item.dataUrl));
    }

    async function deleteFile(id) {
        try {
            const db = await openDB();
            if (!db) return false;
            return new Promise((resolve) => {
                const tx = db.transaction(STORE_NAME, 'readwrite');
                const store = tx.objectStore(STORE_NAME);
                const req = store.delete(id);
                req.onsuccess = () => resolve(true);
                req.onerror = () => resolve(false);
            });
        } catch (err) {
            return false;
        }
    }

    return {
        saveFile,
        getFile,
        getFileUrl,
        hasFile,
        deleteFile
    };
})();

window.DocStorage = DocStorage;
