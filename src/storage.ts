import type { Draft } from './types';

const DB_NAME = 'rename-plan-reviewer';
const STORE = 'drafts';

function openDatabase(namespace = ''): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(`${namespace}${DB_NAME}`, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveDraft(draft: Draft, namespace = ''): Promise<void> {
  const database = await openDatabase(namespace);
  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(STORE, 'readwrite');
    transaction.objectStore(STORE).put(draft, 'current');
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
  database.close();
}

export async function loadDraft(namespace = ''): Promise<Draft | undefined> {
  const database = await openDatabase(namespace);
  const result = await new Promise<Draft | undefined>((resolve, reject) => {
    const request = database.transaction(STORE).objectStore(STORE).get('current');
    request.onsuccess = () => resolve(request.result as Draft | undefined);
    request.onerror = () => reject(request.error);
  });
  database.close();
  return result;
}

export async function clearDraft(namespace = ''): Promise<void> {
  const database = await openDatabase(namespace);
  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(STORE, 'readwrite');
    transaction.objectStore(STORE).delete('current');
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
  database.close();
}
