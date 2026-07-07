// ==UserScript==
// @name         F-Porter
// @namespace    https://horizn.moe
// @version      2.0.0
// @description  Export F-Chat web client logs and per-character settings into a Horizon-importable ZIP backup. Streams to disk, so exports of any size work.
// @author       The Horizon Developers
// @homepageURL  https://horizn.moe/docs/guides/f-porter
// @supportURL   https://github.com/Fchat-Horizon/Horizon/issues
// @downloadURL  https://horizn.moe/f-porter.user.js
// @updateURL    https://horizn.moe/f-porter.user.js
// @match        https://www.f-list.net/chat3/*
// @match        https://www.f-list.net/chat/*
// @grant        none
// @noframes
// @run-at       document-idle
// ==/UserScript==

(() => {
  // src/util.js
  var utf8 = new TextEncoder();
  var log = (...a) => console.log('[F-Porter]', ...a);
  var warn = (...a) => console.warn('[F-Porter]', ...a);
  var err = (...a) => console.error('[F-Porter]', ...a);
  var ExportCancelled = class extends Error {
    constructor() {
      super('Export cancelled');
    }
  };
  function checkCancel(ctl) {
    if (ctl.cancelled) throw new ExportCancelled();
  }
  function concatChunks(chunks, size) {
    const out = new Uint8Array(size);
    let off = 0;
    for (const c of chunks) {
      out.set(c, off);
      off += c.length;
    }
    return out;
  }
  function truncateUtf8(bytes, max) {
    if (bytes.length <= max) return bytes;
    let end = max;
    while (end > 0 && (bytes[end] & 192) === 128) end--;
    return bytes.subarray(0, end);
  }

  // src/ui.js
  var STYLE_ID = 'fporter-styles';
  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const s = document.createElement('style');
    s.id = STYLE_ID;
    s.textContent = `
    .fp-btn {
      position: fixed; right: 12px; bottom: 12px;
      padding: 10px 14px; background: #2b6cb0; color: #fff;
      border: 0; border-radius: 8px; font: 600 13px/1 system-ui, sans-serif;
      cursor: pointer; z-index: 2147483646;
      box-shadow: 0 4px 12px rgba(0,0,0,.35);
    }
    .fp-btn:hover:not(:disabled) { background: #1e4d7b; }
    .fp-btn:disabled { opacity: .6; cursor: not-allowed; }
    .fp-overlay {
      position: fixed; inset: 0; background: rgba(0,0,0,.55);
      display: flex; align-items: center; justify-content: center;
      z-index: 2147483647; font: 14px/1.4 system-ui, sans-serif;
    }
    .fp-modal {
      background: #fff; color: #111; border-radius: 10px;
      padding: 20px; min-width: 380px; max-width: 520px;
      box-shadow: 0 10px 40px rgba(0,0,0,.4);
    }
    .fp-modal h2 { margin: 0 0 6px; font-size: 17px; }
    .fp-modal p  { margin: 0 0 14px; color: #555; font-size: 13px; }
    .fp-list {
      max-height: 320px; overflow-y: auto;
      border: 1px solid #ddd; border-radius: 6px; margin-bottom: 14px;
    }
    .fp-item { display: flex; align-items: center; gap: 8px;
      padding: 9px 12px; border-bottom: 1px solid #eee; }
    .fp-item:last-child { border-bottom: 0; }
    .fp-item label { flex: 1; cursor: pointer; }
    .fp-item input { width: 16px; height: 16px; cursor: pointer; }
    .fp-row { display: flex; gap: 8px; justify-content: flex-end; }
    .fp-mbtn { padding: 8px 14px; border: 0; border-radius: 6px;
      font: 600 13px/1 system-ui, sans-serif; cursor: pointer; }
    .fp-primary { background: #2b6cb0; color: #fff; }
    .fp-primary:hover { background: #1e4d7b; }
    .fp-secondary { background: #eee; color: #222; }
    .fp-secondary:hover { background: #ddd; }
    .fp-progress { margin: 6px 0 14px; }
    .fp-progress-info { display: flex; justify-content: space-between;
      gap: 12px; margin-bottom: 6px; font-size: 12px; color: #555; }
    .fp-progress-info span:first-child {
      overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .fp-bar { height: 6px; background: #e0e0e0; border-radius: 3px; overflow: hidden; }
    .fp-fill { height: 100%; width: 0%; background: #2b6cb0; transition: width .2s ease; }
    .fp-stats { font-size: 12px; color: #777; margin-bottom: 14px; }
    .fp-toast {
      position: fixed; bottom: 70px; right: 12px;
      background: #1f2937; color: #fff; padding: 12px 16px;
      border-radius: 8px; font: 13px/1.4 system-ui, sans-serif;
      max-width: 360px; z-index: 2147483647;
      box-shadow: 0 6px 18px rgba(0,0,0,.4);
      opacity: 0; transform: translateY(10px); transition: all .2s ease;
    }
    .fp-toast.show { opacity: 1; transform: translateY(0); }
    .fp-toast.err  { background: #991b1b; }
  `;
    document.head.appendChild(s);
  }
  function toast(message, kind = 'info', ms = 5e3) {
    const t = document.createElement('div');
    t.className = 'fp-toast' + (kind === 'err' ? ' err' : '');
    t.textContent = message;
    document.body.appendChild(t);
    requestAnimationFrame(() => t.classList.add('show'));
    setTimeout(() => {
      t.classList.remove('show');
      setTimeout(() => t.remove(), 250);
    }, ms);
  }
  function addButton(onClick) {
    if (!document.body) {
      setTimeout(() => addButton(onClick), 100);
      return;
    }
    if (document.querySelector('.fp-btn')) return;
    const btn = document.createElement('button');
    btn.className = 'fp-btn';
    btn.type = 'button';
    btn.textContent = 'Export Logs';
    btn.addEventListener('click', () => onClick(btn));
    document.body.appendChild(btn);
  }
  function selectCharactersModal(characters) {
    return new Promise((resolve) => {
      const overlay = document.createElement('div');
      overlay.className = 'fp-overlay';
      const modal = document.createElement('div');
      modal.className = 'fp-modal';
      const h2 = document.createElement('h2');
      h2.textContent = 'Export Logs';
      const p = document.createElement('p');
      p.textContent =
        'Pick which characters to export. Logs come from IndexedDB; settings come from localStorage.';
      const list = document.createElement('div');
      list.className = 'fp-list';
      const inputs = characters.map((name, i) => {
        const row2 = document.createElement('div');
        row2.className = 'fp-item';
        const cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.id = `fp-c-${i}`;
        cb.checked = true;
        cb.value = name;
        const label = document.createElement('label');
        label.htmlFor = cb.id;
        label.textContent = name;
        row2.append(cb, label);
        list.appendChild(row2);
        return cb;
      });
      const row = document.createElement('div');
      row.className = 'fp-row';
      const cancel = document.createElement('button');
      cancel.type = 'button';
      cancel.className = 'fp-mbtn fp-secondary';
      cancel.textContent = 'Cancel';
      const toggle = document.createElement('button');
      toggle.type = 'button';
      toggle.className = 'fp-mbtn fp-secondary';
      toggle.textContent = 'Deselect All';
      const confirm = document.createElement('button');
      confirm.type = 'button';
      confirm.className = 'fp-mbtn fp-primary';
      confirm.textContent = 'Export';
      row.append(cancel, toggle, confirm);
      const close = (result) => {
        overlay.remove();
        resolve(result);
      };
      cancel.addEventListener('click', () => close([]));
      confirm.addEventListener('click', () =>
        close(inputs.filter((i) => i.checked).map((i) => i.value)),
      );
      toggle.addEventListener('click', () => {
        const allChecked = inputs.every((i) => i.checked);
        inputs.forEach((i) => {
          i.checked = !allChecked;
        });
        toggle.textContent = allChecked ? 'Select All' : 'Deselect All';
      });
      modal.append(h2, p, list, row);
      overlay.appendChild(modal);
      document.body.appendChild(overlay);
    });
  }
  function createProgress(onCancel) {
    const overlay = document.createElement('div');
    overlay.className = 'fp-overlay';
    const modal = document.createElement('div');
    modal.className = 'fp-modal';
    const h2 = document.createElement('h2');
    h2.textContent = 'Exporting\u2026';
    const wrap = document.createElement('div');
    wrap.className = 'fp-progress';
    const info = document.createElement('div');
    info.className = 'fp-progress-info';
    const label = document.createElement('span');
    label.textContent = 'Starting\u2026';
    const pct = document.createElement('span');
    pct.textContent = '0%';
    info.append(label, pct);
    const bar = document.createElement('div');
    bar.className = 'fp-bar';
    const fill = document.createElement('div');
    fill.className = 'fp-fill';
    bar.appendChild(fill);
    wrap.append(info, bar);
    const stats = document.createElement('div');
    stats.className = 'fp-stats';
    const row = document.createElement('div');
    row.className = 'fp-row';
    const cancelBtn = document.createElement('button');
    cancelBtn.type = 'button';
    cancelBtn.className = 'fp-mbtn fp-secondary';
    cancelBtn.textContent = 'Cancel';
    cancelBtn.addEventListener('click', () => {
      cancelBtn.disabled = true;
      cancelBtn.textContent = 'Cancelling\u2026';
      onCancel();
    });
    row.appendChild(cancelBtn);
    modal.append(h2, wrap, stats, row);
    overlay.appendChild(modal);
    return {
      el: overlay,
      update(current, total, msg, statsMsg) {
        const p =
          total > 0 ? Math.min(100, Math.round((current / total) * 100)) : 0;
        fill.style.width = p + '%';
        pct.textContent = p + '%';
        if (msg) label.textContent = msg;
        if (statsMsg !== void 0) stats.textContent = statsMsg;
      },
      remove() {
        overlay.remove();
      },
    };
  }

  // src/format.js
  var DAY_MS = 864e5;
  var MSG_TYPE_EVENT = 5;
  function serializeMessage(m, counters) {
    const isEvent = m.type === MSG_TYPE_EVENT;
    const nameBytes = truncateUtf8(
      utf8.encode(isEvent ? '' : m.sender || ''),
      255,
    );
    let textBytes = utf8.encode(m.text || '');
    const textLimit = 65535 - 10 - nameBytes.length;
    if (textBytes.length > textLimit) {
      textBytes = truncateUtf8(textBytes, textLimit);
      counters.truncated++;
    }
    const size = 10 + nameBytes.length + textBytes.length;
    const buf = new Uint8Array(size);
    const dv = new DataView(buf.buffer);
    const ms =
      m.time instanceof Date ? m.time.getTime() : new Date(m.time).getTime();
    dv.setUint32(0, Number.isFinite(ms) ? Math.max(0, ms / 1e3) : 0, true);
    buf[4] = (m.type || 0) & 255;
    buf[5] = nameBytes.length;
    buf.set(nameBytes, 6);
    const textOff = 6 + nameBytes.length;
    dv.setUint16(textOff, textBytes.length, true);
    buf.set(textBytes, textOff + 2);
    dv.setUint16(size - 2, size - 2, true);
    return buf;
  }
  function dayKeyFromTime(time) {
    const d = time instanceof Date ? time : new Date(time);
    return Math.floor(d.getTime() / DAY_MS - d.getTimezoneOffset() / 1440);
  }
  function buildIndexBuffer(displayName, dayOffsets) {
    const nameBytes = truncateUtf8(utf8.encode(displayName), 255);
    const out = new Uint8Array(1 + nameBytes.length + dayOffsets.length * 7);
    const dv = new DataView(out.buffer);
    out[0] = nameBytes.length;
    out.set(nameBytes, 1);
    let pos = 1 + nameBytes.length;
    for (const [day, off] of dayOffsets) {
      dv.setUint16(pos, day, true);
      let v = off;
      for (let i = 0; i < 5; i++) {
        out[pos + 2 + i] = v & 255;
        v = Math.floor(v / 256);
      }
      pos += 7;
    }
    return out;
  }

  // src/zip.js
  var HAS_DEFLATE = typeof CompressionStream === 'function';
  if (!HAS_DEFLATE)
    warn('CompressionStream unavailable; ZIP will be uncompressed (STORE).');
  var CRC_TABLE = (() => {
    const t = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 3988292384 ^ (c >>> 1) : c >>> 1;
      t[n] = c >>> 0;
    }
    return t;
  })();
  function crc32(state, chunk) {
    let c = state;
    for (let i = 0; i < chunk.length; i++)
      c = CRC_TABLE[(c ^ chunk[i]) & 255] ^ (c >>> 8);
    return c;
  }
  function setU64(dv, off, value) {
    dv.setUint32(off, value % 4294967296, true);
    dv.setUint32(off + 4, Math.floor(value / 4294967296), true);
  }
  var ZipWriter = class {
    constructor(sink) {
      this.sink = sink;
      this.offset = 0;
      this.entries = [];
      const now = /* @__PURE__ */ new Date();
      this.dosTime =
        (now.getHours() << 11) |
        (now.getMinutes() << 5) |
        (now.getSeconds() >> 1);
      this.dosDate =
        ((now.getFullYear() - 1980) << 9) |
        ((now.getMonth() + 1) << 5) |
        now.getDate();
    }
    async writeRaw(bytes) {
      await this.sink.write(bytes);
      this.offset += bytes.length;
    }
    // $ addFile(path, chunks): chunks is any (async) iterable of Uint8Array.
    async addFile(path, chunks) {
      const nameBytes = utf8.encode(path);
      const method = HAS_DEFLATE ? 8 : 0;
      const headerOffset = this.offset;
      const local = new Uint8Array(30 + nameBytes.length);
      const dv = new DataView(local.buffer);
      dv.setUint32(0, 67324752, true);
      dv.setUint16(4, 20, true);
      dv.setUint16(6, 2056, true);
      dv.setUint16(8, method, true);
      dv.setUint16(10, this.dosTime, true);
      dv.setUint16(12, this.dosDate, true);
      dv.setUint16(26, nameBytes.length, true);
      local.set(nameBytes, 30);
      await this.writeRaw(local);
      let crc = 4294967295;
      let usize = 0;
      let csize = 0;
      if (method === 8) {
        const cs = new CompressionStream('deflate-raw');
        const writer = cs.writable.getWriter();
        const reader = cs.readable.getReader();
        const feed = (async () => {
          try {
            for await (const chunk of chunks) {
              crc = crc32(crc, chunk);
              usize += chunk.length;
              await writer.write(chunk);
            }
            await writer.close();
          } catch (e) {
            writer.abort(e).catch(() => {});
            throw e;
          }
        })();
        const feedResult = feed.catch((e) => e);
        try {
          for (;;) {
            const { done, value } = await reader.read();
            if (done) break;
            csize += value.length;
            await this.writeRaw(value);
          }
        } catch (readError) {
          const fed2 = await feedResult;
          throw fed2 instanceof Error ? fed2 : readError;
        }
        const fed = await feedResult;
        if (fed instanceof Error) throw fed;
      } else {
        for await (const chunk of chunks) {
          crc = crc32(crc, chunk);
          usize += chunk.length;
          await this.writeRaw(chunk);
        }
        csize = usize;
      }
      crc = (crc ^ 4294967295) >>> 0;
      if (usize >= 4294967295 || csize >= 4294967295)
        throw new Error(`single ZIP entry exceeds 4 GiB: ${path}`);
      const desc = new Uint8Array(16);
      const ddv = new DataView(desc.buffer);
      ddv.setUint32(0, 134695760, true);
      ddv.setUint32(4, crc, true);
      ddv.setUint32(8, csize, true);
      ddv.setUint32(12, usize, true);
      await this.writeRaw(desc);
      this.entries.push({ nameBytes, method, crc, csize, usize, headerOffset });
    }
    async finalize() {
      const cdStart = this.offset;
      for (const e of this.entries) {
        const zip64 = e.headerOffset >= 4294967295;
        const extraLen = zip64 ? 12 : 0;
        const rec = new Uint8Array(46 + e.nameBytes.length + extraLen);
        const dv2 = new DataView(rec.buffer);
        dv2.setUint32(0, 33639248, true);
        dv2.setUint16(4, zip64 ? 45 : 20, true);
        dv2.setUint16(6, zip64 ? 45 : 20, true);
        dv2.setUint16(8, 2056, true);
        dv2.setUint16(10, e.method, true);
        dv2.setUint16(12, this.dosTime, true);
        dv2.setUint16(14, this.dosDate, true);
        dv2.setUint32(16, e.crc, true);
        dv2.setUint32(20, e.csize, true);
        dv2.setUint32(24, e.usize, true);
        dv2.setUint16(28, e.nameBytes.length, true);
        dv2.setUint16(30, extraLen, true);
        dv2.setUint32(42, zip64 ? 4294967295 : e.headerOffset, true);
        rec.set(e.nameBytes, 46);
        if (zip64) {
          const p = 46 + e.nameBytes.length;
          dv2.setUint16(p, 1, true);
          dv2.setUint16(p + 2, 8, true);
          setU64(dv2, p + 4, e.headerOffset);
        }
        await this.writeRaw(rec);
      }
      const cdSize = this.offset - cdStart;
      const count = this.entries.length;
      const needZip64 =
        count >= 65535 || cdStart >= 4294967295 || cdSize >= 4294967295;
      if (needZip64) {
        const zOff = this.offset;
        const z = new Uint8Array(76);
        const dv2 = new DataView(z.buffer);
        dv2.setUint32(0, 101075792, true);
        setU64(dv2, 4, 44);
        dv2.setUint16(12, 45, true);
        dv2.setUint16(14, 45, true);
        setU64(dv2, 24, count);
        setU64(dv2, 32, count);
        setU64(dv2, 40, cdSize);
        setU64(dv2, 48, cdStart);
        dv2.setUint32(56, 117853008, true);
        setU64(dv2, 64, zOff);
        dv2.setUint32(72, 1, true);
        await this.writeRaw(z);
      }
      const eocd = new Uint8Array(22);
      const dv = new DataView(eocd.buffer);
      dv.setUint32(0, 101010256, true);
      dv.setUint16(8, needZip64 ? 65535 : count, true);
      dv.setUint16(10, needZip64 ? 65535 : count, true);
      dv.setUint32(12, needZip64 ? 4294967295 : cdSize, true);
      dv.setUint32(16, needZip64 ? 4294967295 : cdStart, true);
      await this.writeRaw(eocd);
      await this.sink.close();
    }
  };

  // src/sinks.js
  function triggerDownload(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 3e4);
  }
  function blobSink(filename) {
    let parts = [];
    let pending = [];
    let pendingSize = 0;
    const spill = () => {
      parts.push(new Blob(pending));
      pending = [];
      pendingSize = 0;
    };
    return {
      streamsToDisk: false,
      write(chunk) {
        pending.push(chunk);
        pendingSize += chunk.length;
        if (pendingSize >= 32 << 20) spill();
      },
      close() {
        if (pendingSize) spill();
        triggerDownload(new Blob(parts, { type: 'application/zip' }), filename);
        parts = [];
      },
      abort() {
        parts = [];
        pending = [];
      },
    };
  }
  async function createSink(filename) {
    if (typeof window.showSaveFilePicker !== 'function')
      return blobSink(filename);
    let handle;
    try {
      handle = await window.showSaveFilePicker({
        suggestedName: filename,
        types: [
          {
            description: 'ZIP archive',
            accept: { 'application/zip': ['.zip'] },
          },
        ],
      });
    } catch (e) {
      if (e && e.name === 'AbortError') throw e;
      warn('showSaveFilePicker failed, using in-memory fallback:', e);
      return blobSink(filename);
    }
    const stream = await handle.createWritable();
    return {
      streamsToDisk: true,
      write: (chunk) => stream.write(chunk),
      close: () => stream.close(),
      abort: () => stream.abort(),
    };
  }

  // src/idb.js
  var CHARACTERS_KEY = 'fchat.characters';
  function promisify(req) {
    return new Promise((resolve, reject) => {
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }
  async function listAvailableCharacters() {
    const seen = /* @__PURE__ */ new Set();
    try {
      const stored = localStorage.getItem(CHARACTERS_KEY);
      if (stored) {
        for (const c of JSON.parse(stored))
          if (typeof c === 'string') seen.add(c);
      }
    } catch (e) {
      warn('listAvailableCharacters: bad fchat.characters JSON', e);
    }
    if (typeof indexedDB.databases === 'function') {
      try {
        for (const { name } of await indexedDB.databases()) {
          if (typeof name === 'string' && name.startsWith('logs-'))
            seen.add(name.slice(5));
        }
      } catch (e) {
        warn('indexedDB.databases() unavailable:', e);
      }
    }
    return [...seen].sort((a, b) => a.localeCompare(b));
  }
  function openLogsDB(character) {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(`logs-${character}`);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
      req.onblocked = () => reject(new Error('IDB open blocked'));
    });
  }
  function withLogs(db, fn) {
    return new Promise((resolve, reject) => {
      let req;
      try {
        req = fn(db.transaction(['logs']).objectStore('logs'));
      } catch (e) {
        return reject(e);
      }
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }
  async function getAllConversations(db) {
    if (!db.objectStoreNames.contains('conversations')) return [];
    return promisify(
      db.transaction(['conversations']).objectStore('conversations').getAll(),
    );
  }
  var encodeNum = (num) =>
    String.fromCharCode((num >> 16) % 65536) + String.fromCharCode(num % 65536);
  var decodeDayStr = (s) => (s.charCodeAt(2) << 16) + s.charCodeAt(3);
  function detectMode(db) {
    if (!db.objectStoreNames.contains('logs'))
      return { dayIndex: false, composite: false, convIndex: false };
    const store = db.transaction(['logs']).objectStore('logs');
    const mode = {
      dayIndex: false,
      composite: false,
      convIndex: store.indexNames.contains('conversation'),
    };
    if (store.indexNames.contains('conversation-day')) {
      mode.dayIndex = true;
      mode.composite = Array.isArray(store.index('conversation-day').keyPath);
    }
    return mode;
  }
  function dayRange(convId, mode) {
    return mode.composite
      ? IDBKeyRange.bound([convId, 0], [convId, 1e6])
      : IDBKeyRange.bound(
          encodeNum(convId) + encodeNum(0),
          encodeNum(convId) + encodeNum(1e6),
        );
  }
  var dayFromKey = (key, mode) => (mode.composite ? key[1] : decodeDayStr(key));
  function dayOf(m) {
    if (typeof m.day === 'number') return m.day;
    if (typeof m.day === 'string' && m.day.length >= 4)
      return decodeDayStr(m.day);
    return dayKeyFromTime(m.time);
  }
  function listDayKeys(db, convId, mode) {
    return new Promise((resolve, reject) => {
      const days = [];
      let req;
      try {
        req = db
          .transaction(['logs'])
          .objectStore('logs')
          .index('conversation-day')
          .openKeyCursor(dayRange(convId, mode), 'nextunique');
      } catch (e) {
        return reject(e);
      }
      req.onsuccess = function () {
        const c = this.result;
        if (!c) return resolve(days);
        days.push(c.key);
        c.continue();
      };
      req.onerror = () => reject(req.error);
    });
  }
  async function* cursorPages(db, convId, pageSize = 2e3) {
    let lastId;
    for (;;) {
      const page = await new Promise((resolve, reject) => {
        const out = [];
        let store;
        try {
          store = db.transaction(['logs']).objectStore('logs');
        } catch (e) {
          return reject(e);
        }
        if (!store.indexNames.contains('conversation')) return resolve(out);
        const req = store
          .index('conversation')
          .openCursor(IDBKeyRange.only(convId));
        let positioned = lastId === void 0;
        req.onsuccess = function () {
          const c = this.result;
          if (!c) return resolve(out);
          if (!positioned) {
            positioned = true;
            return c.continuePrimaryKey(convId, lastId + 1);
          }
          out.push(c.value);
          if (out.length >= pageSize) return resolve(out);
          c.continue();
        };
        req.onerror = () => reject(req.error);
      });
      if (!page.length) return;
      lastId = page[page.length - 1].id;
      yield page;
      if (page.length < pageSize) return;
    }
  }
  async function* readBatches(db, convId, mode) {
    if (mode.dayIndex) {
      let dayKeys = [];
      try {
        dayKeys = await listDayKeys(db, convId, mode);
      } catch (e) {
        warn('day index unusable, falling back to cursor:', e);
      }
      if (dayKeys.length) {
        for (const key of dayKeys) {
          const messages = await withLogs(db, (store) =>
            store.index('conversation-day').getAll(IDBKeyRange.only(key)),
          );
          if (messages.length) yield { day: dayFromKey(key, mode), messages };
        }
        return;
      }
    }
    for await (const page of cursorPages(db, convId)) {
      let start = 0;
      for (let i = 1; i <= page.length; i++) {
        if (i === page.length || dayOf(page[i]) !== dayOf(page[start])) {
          yield { day: dayOf(page[start]), messages: page.slice(start, i) };
          start = i;
        }
      }
    }
  }
  function characterSettingsKeys(character) {
    const prefix = `${character}.settings.`;
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(prefix)) keys.push(k);
    }
    return keys;
  }

  // src/export.js
  var CHUNK_TARGET = 1 << 20;
  async function exportConversation(
    zip,
    db,
    conv,
    character,
    mode,
    ctl,
    counters,
  ) {
    const batches = readBatches(db, conv.id, mode);
    const first = await batches.next();
    if (first.done) return;
    const dayOffsets = [];
    const seenDays = /* @__PURE__ */ new Set();
    let bytes = 0;
    async function* chunks() {
      let pending = [];
      let pendingSize = 0;
      const flush = () => {
        const buf = concatChunks(pending, pendingSize);
        pending = [];
        pendingSize = 0;
        return buf;
      };
      let item = first;
      while (!item.done) {
        checkCancel(ctl);
        const { day, messages } = item.value;
        if (!seenDays.has(day)) {
          seenDays.add(day);
          dayOffsets.push([day, bytes]);
        }
        for (const m of messages) {
          const c = serializeMessage(m, counters);
          pending.push(c);
          pendingSize += c.length;
          bytes += c.length;
        }
        counters.messages += messages.length;
        if (pendingSize >= CHUNK_TARGET) yield flush();
        item = await batches.next();
      }
      if (pendingSize) yield flush();
    }
    const base = `characters/${character}/logs/${conv.key}`;
    await zip.addFile(base, chunks());
    await zip.addFile(`${base}.idx`, [
      buildIndexBuffer(conv.name || conv.key, dayOffsets),
    ]);
    counters.conversations++;
  }
  async function runExport(triggerBtn) {
    log('runExport invoked');
    const characters = await listAvailableCharacters();
    if (!characters.length) {
      toast('No characters found. Log into F-Chat at least once first.', 'err');
      return;
    }
    const chosen = await selectCharactersModal(characters);
    if (!chosen.length) return;
    const stamp = /* @__PURE__ */ new Date()
      .toISOString()
      .replace(/:/g, '-')
      .split('.')[0];
    const filename = `horizon-export-${stamp}.zip`;
    let sink;
    try {
      sink = await createSink(filename);
    } catch (e) {
      if (e && e.name === 'AbortError') return;
      throw e;
    }
    triggerBtn.disabled = true;
    const ctl = { cancelled: false };
    const progress = createProgress(() => {
      ctl.cancelled = true;
    });
    document.body.appendChild(progress.el);
    const counters = {
      messages: 0,
      conversations: 0,
      settings: 0,
      truncated: 0,
      failures: [],
    };
    const zip = new ZipWriter(sink);
    const openDbs = [];
    try {
      const plan = [];
      for (const character of chosen) {
        checkCancel(ctl);
        progress.update(0, 1, `Scanning ${character}\u2026`);
        try {
          const db = await openLogsDB(character);
          openDbs.push(db);
          plan.push({
            character,
            db,
            conversations: await getAllConversations(db),
          });
        } catch (e) {
          err(`open logs-${character}`, e);
          counters.failures.push(
            `${character}: could not open IDB (${e.message})`,
          );
        }
      }
      const total = plan.reduce((n, p) => n + p.conversations.length, 0) + 1;
      let done = 0;
      const statsLine = () =>
        `${counters.messages.toLocaleString()} messages \xB7 ${(zip.offset / 1024 / 1024).toFixed(1)} MB written` +
        (sink.streamsToDisk ? '' : ' (in memory)');
      for (const { character, db, conversations } of plan) {
        const mode = detectMode(db);
        for (const conv of conversations) {
          checkCancel(ctl);
          progress.update(
            done,
            total,
            `${character} \u2014 ${conv.name || conv.key}`,
            statsLine(),
          );
          try {
            await exportConversation(
              zip,
              db,
              conv,
              character,
              mode,
              ctl,
              counters,
            );
          } catch (e) {
            if (e instanceof ExportCancelled) throw e;
            err(`conversation ${conv && conv.key}`, e);
            counters.failures.push(
              `${character}/${conv && conv.key}: ${e.message}`,
            );
          }
          done++;
        }
        for (const fullKey of characterSettingsKeys(character)) {
          const settingName = fullKey.slice(
            character.length + '.settings.'.length,
          );
          const value = localStorage.getItem(fullKey);
          if (value === null) continue;
          await zip.addFile(`characters/${character}/settings/${settingName}`, [
            utf8.encode(value),
          ]);
          counters.settings++;
        }
      }
      progress.update(total - 1, total, 'Finalizing ZIP\u2026', statsLine());
      await zip.finalize();
      const sizeMb = (zip.offset / 1024 / 1024).toFixed(2);
      let summary = `Exported ${counters.messages.toLocaleString()} messages across ${counters.conversations} conversations and ${counters.settings} settings files (${sizeMb} MB).`;
      if (counters.truncated)
        summary += ` ${counters.truncated} oversized message(s) were truncated.`;
      log(summary);
      if (counters.failures.length) {
        warn('Failures during export:', counters.failures);
        toast(
          `${summary} ${counters.failures.length} item(s) failed \u2014 see console.`,
          'err',
          9e3,
        );
      } else {
        toast(summary);
      }
    } catch (e) {
      try {
        await sink.abort();
      } catch {}
      if (e instanceof ExportCancelled) {
        log('export cancelled by user');
        toast('Export cancelled.');
        return;
      }
      throw e;
    } finally {
      for (const db of openDbs) {
        try {
          db.close();
        } catch {}
      }
      progress.remove();
      triggerBtn.disabled = false;
    }
  }

  // src/main.js
  if (!window.indexedDB) {
    err('IndexedDB unavailable. Aborting.');
  } else {
    const onClick = (btn) => {
      runExport(btn).catch((e) => {
        err(e);
        toast(`Export failed: ${e.message}`, 'err', 9e3);
      });
    };
    injectStyles();
    addButton(onClick);
    const obs = new MutationObserver(() => {
      if (!document.querySelector('.fp-btn')) addButton(onClick);
    });
    obs.observe(document.documentElement, { childList: true, subtree: true });
  }
})();
