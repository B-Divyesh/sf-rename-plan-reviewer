import { createHash } from 'node:crypto';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join, relative } from 'node:path';

const root = new URL('../dist/', import.meta.url);
const files = [];
async function walk(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) await walk(path);
    else if (entry.name !== 'sw.js' && !entry.name.endsWith('.map')) files.push(`/${relative(root.pathname, path)}`);
  }
}
await walk(root.pathname);
const fingerprint = createHash('sha256').update(files.sort().join('\n')).digest('hex').slice(0, 10);
const source = `const VERSION='rpr-${fingerprint}';
const SHELL=${JSON.stringify(files)};
self.addEventListener('install',event=>{event.waitUntil(caches.open(VERSION).then(cache=>cache.addAll(SHELL)));});
self.addEventListener('activate',event=>{event.waitUntil(Promise.all([caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==VERSION).map(key=>caches.delete(key)))),self.clients.claim()]));});
self.addEventListener('message',event=>{if(event.data?.type==='SKIP_WAITING')self.skipWaiting();});
self.addEventListener('fetch',event=>{
  const request=event.request;
  if(request.method!=='GET')return;
  const url=new URL(request.url);
  if(url.hostname.endsWith('sociobot.in')){event.respondWith(fetch(request));return;}
  if(request.mode==='navigate'){
    event.respondWith(fetch(request).then(response=>{const copy=response.clone();caches.open(VERSION).then(cache=>cache.put(request,copy));return response;}).catch(async()=>await caches.match(request)||await caches.match('/index.html')||await caches.match('/offline.html')));
    return;
  }
  if(url.origin===self.location.origin){event.respondWith(caches.match(request).then(cached=>cached||fetch(request).then(response=>{if(response.ok){const copy=response.clone();caches.open(VERSION).then(cache=>cache.put(request,copy));}return response;})));}
});
`;
await writeFile(new URL('sw.js', root), source);
console.log(`service worker rpr-${fingerprint}: ${files.length} files precached`);
