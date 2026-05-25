// ==UserScript==
// @name         F-Chat Web → Horizon Log Exporter
// @namespace    https://horizn.moe
// @version      1.0.0
// @description  Export F-Chat web client logs and per-character settings into a Horizon-importable ZIP backup.
// @author       The Horizon Developers
// @homepageURL  https://horizn.moe/docs/guides/f-porter
// @supportURL   https://github.com/Fchat-Horizon/Horizon/issues
// @downloadURL  https://horizn.moe/f-porter.user.js
// @updateURL    https://horizn.moe/f-porter.user.js
// @match        https://www.f-list.net/chat3/*
// @match        https://www.f-list.net/chat/*
// @grant        none
// @require      https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js
// @run-at       document-idle
// ==/UserScript==

(function () {
  'use strict';

  /* * Format reference (matches Horizon's electron/filesystem.ts):
   *   log entry  = u32 time | u8 type | u8 nameLen | name | u16 textLen | text | u16 backptr
   *                backptr equals (entry_size - 2)
   *   .idx file  = u8 nameLen | name | repeating { u16 day | u40 offset }
   *   day        = floor(ms/86_400_000 - tzOffsetMin/1440)  (local-day epoch index)
   */

  const DAY_MS = 86_400_000;
  const CHARACTERS_KEY = 'fchat.characters';
  const utf8 = new TextEncoder();
  const log = (...a) => console.log('[F-Porter]', ...a);
  const warn = (...a) => console.warn('[F-Porter]', ...a);
  const err = (...a) => console.error('[F-Porter]', ...a);

  if (typeof JSZip === 'undefined') {
    err('JSZip failed to load via @require. Aborting.');
    return;
  }
  if (!window.indexedDB) {
    err('IndexedDB unavailable. Aborting.');
    return;
  }

  // & ============================================================
  // & Binary encoders
  // & ============================================================

  function writeU32LE(buf, offset, value) {
    new DataView(buf.buffer, buf.byteOffset).setUint32(
      offset,
      value >>> 0,
      true,
    );
  }
  function writeU16LE(buf, offset, value) {
    new DataView(buf.buffer, buf.byteOffset).setUint16(
      offset,
      value & 0xffff,
      true,
    );
  }
  function writeUIntLE(buf, offset, value, byteLength) {
    let v = value;
    for (let i = 0; i < byteLength; i++) {
      buf[offset + i] = v & 0xff;
      v = Math.floor(v / 256);
    }
  }

  function serializeMessage(message) {
    const isEvent = message.type === 5; // Conversation.Message.Type.Event
    const name = isEvent ? '' : message.sender || '';
    const nameBytes = utf8.encode(name);
    const textBytes = utf8.encode(message.text || '');
    const size = 10 + nameBytes.length + textBytes.length;
    const buf = new Uint8Array(size);
    const time = Math.floor(new Date(message.time).getTime() / 1000);
    writeU32LE(buf, 0, time);
    buf[4] = message.type & 0xff;
    buf[5] = nameBytes.length & 0xff;
    buf.set(nameBytes, 6);
    let offset = 6 + nameBytes.length;
    writeU16LE(buf, offset, textBytes.length);
    offset += 2;
    buf.set(textBytes, offset);
    offset += textBytes.length;
    writeU16LE(buf, offset, offset); // backpointer: value == position == size - 2
    return buf;
  }

  function dayKey(date) {
    const d = new Date(date);
    return Math.floor(d.getTime() / DAY_MS - d.getTimezoneOffset() / 1440);
  }

  function buildIndexBuffer(displayName, dayOffsets) {
    const nameBytes = utf8.encode(displayName);
    if (nameBytes.length > 255)
      throw new Error(`conversation name too long: ${nameBytes.length}`);
    const out = new Uint8Array(1 + nameBytes.length + dayOffsets.length * 7);
    out[0] = nameBytes.length;
    out.set(nameBytes, 1);
    let pos = 1 + nameBytes.length;
    for (const [day, off] of dayOffsets) {
      writeU16LE(out, pos, day);
      writeUIntLE(out, pos + 2, off, 5);
      pos += 7;
    }
    return out;
  }

  function assembleConversation(displayName, messages) {
    messages.sort((a, b) => new Date(a.time) - new Date(b.time));
    const chunks = [];
    const dayOffsets = [];
    let size = 0;
    let lastDay;
    for (const m of messages) {
      const d = dayKey(m.time);
      if (lastDay === undefined || d !== lastDay) {
        dayOffsets.push([d, size]);
        lastDay = d;
      }
      const chunk = serializeMessage(m);
      chunks.push(chunk);
      size += chunk.length;
    }
    const logBuf = new Uint8Array(size);
    let off = 0;
    for (const c of chunks) {
      logBuf.set(c, off);
      off += c.length;
    }
    return { logBuf, idxBuf: buildIndexBuffer(displayName, dayOffsets) };
  }

  // & ============================================================
  // & Character + IndexedDB discovery
  // & ============================================================

  async function listAvailableCharacters() {
    const seen = new Set();
    try {
      const stored = localStorage.getItem(CHARACTERS_KEY);
      if (stored)
        for (const c of JSON.parse(stored))
          if (typeof c === 'string') seen.add(c);
    } catch (e) {
      warn('listAvailableCharacters: bad fchat.characters JSON', e);
    }

    // ^ Catch databases whose owning entry vanished from localStorage.
    if (typeof indexedDB.databases === 'function') {
      try {
        const dbs = await indexedDB.databases();
        for (const { name } of dbs) {
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

  async function readConversations(db) {
    if (!db.objectStoreNames.contains('conversations')) return [];
    return new Promise((resolve, reject) => {
      const tx = db.transaction(['conversations'], 'readonly');
      const out = [];
      const req = tx.objectStore('conversations').openCursor();
      req.onsuccess = function () {
        const c = this.result;
        if (!c) return resolve(out);
        out.push(c.value);
        c.continue();
      };
      req.onerror = () => reject(req.error);
    });
  }

  async function readMessages(db, convId) {
    if (!db.objectStoreNames.contains('logs')) return [];
    return new Promise((resolve, reject) => {
      const tx = db.transaction(['logs'], 'readonly');
      const store = tx.objectStore('logs');
      if (!store.indexNames.contains('conversation')) return resolve([]);
      const out = [];
      const req = store
        .index('conversation')
        .openCursor(IDBKeyRange.only(convId));
      req.onsuccess = function () {
        const c = this.result;
        if (!c) return resolve(out);
        out.push(c.value);
        c.continue();
      };
      req.onerror = () => reject(req.error);
    });
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

  // & ============================================================
  // & UI
  // & ============================================================

  const STYLE_ID = 'fporter-styles';
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
      .fp-progress { margin-top: 6px; }
      .fp-progress-info { display: flex; justify-content: space-between;
        margin-bottom: 6px; font-size: 12px; color: #555; }
      .fp-bar { height: 6px; background: #e0e0e0; border-radius: 3px; overflow: hidden; }
      .fp-fill { height: 100%; width: 0%; background: #2b6cb0; transition: width .2s ease; }
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

  function toast(message, kind = 'info', ms = 5000) {
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

  function addButton() {
    if (!document.body) {
      setTimeout(addButton, 100);
      return;
    }
    if (document.querySelector('.fp-btn')) return;
    const btn = document.createElement('button');
    btn.className = 'fp-btn';
    btn.type = 'button';
    btn.textContent = 'Export Logs';
    btn.addEventListener('click', () => {
      runExport(btn).catch((e) => {
        err(e);
        toast(`Export failed: ${e.message}`, 'err');
      });
    });
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
        const row = document.createElement('div');
        row.className = 'fp-item';
        const cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.id = `fp-c-${i}`;
        cb.checked = true;
        cb.value = name;
        const label = document.createElement('label');
        label.htmlFor = cb.id;
        label.textContent = name;
        row.append(cb, label);
        list.appendChild(row);
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

  function createProgress() {
    const overlay = document.createElement('div');
    overlay.className = 'fp-overlay';
    const modal = document.createElement('div');
    modal.className = 'fp-modal';
    const h2 = document.createElement('h2');
    h2.textContent = 'Exporting…';
    const wrap = document.createElement('div');
    wrap.className = 'fp-progress';
    const info = document.createElement('div');
    info.className = 'fp-progress-info';
    const label = document.createElement('span');
    label.textContent = 'Starting…';
    const pct = document.createElement('span');
    pct.textContent = '0%';
    info.append(label, pct);
    const bar = document.createElement('div');
    bar.className = 'fp-bar';
    const fill = document.createElement('div');
    fill.className = 'fp-fill';
    bar.appendChild(fill);
    wrap.append(info, bar);
    modal.append(h2, wrap);
    overlay.appendChild(modal);
    return {
      el: overlay,
      update(current, total, msg) {
        const p =
          total > 0 ? Math.min(100, Math.round((current / total) * 100)) : 0;
        fill.style.width = p + '%';
        pct.textContent = p + '%';
        if (msg) label.textContent = msg;
      },
      remove() {
        overlay.remove();
      },
    };
  }

  // ~ yield to the browser so very large exports don't lock the tab
  const yieldUi = () => new Promise((r) => setTimeout(r, 0));

  // & ============================================================
  // & Orchestration
  // & ============================================================

  async function runExport(triggerBtn) {
    log('runExport invoked');
    const characters = await listAvailableCharacters();
    if (!characters.length) {
      toast('No characters found. Log into F-Chat at least once first.', 'err');
      return;
    }

    const chosen = await selectCharactersModal(characters);
    if (!chosen.length) return;

    triggerBtn.disabled = true;
    const progress = createProgress();
    document.body.appendChild(progress.el);

    try {
      const zip = new JSZip();
      let conversationCount = 0;
      let messageCount = 0;
      let settingsCount = 0;
      const failures = [];

      for (let i = 0; i < chosen.length; i++) {
        const character = chosen[i];
        progress.update(i, chosen.length + 1, `Reading ${character}…`);

        let db;
        try {
          db = await openLogsDB(character);
        } catch (e) {
          err(`open logs-${character}`, e);
          failures.push(`${character}: could not open IDB (${e.message})`);
          continue;
        }

        try {
          const conversations = await readConversations(db);
          for (const conv of conversations) {
            try {
              const messages = await readMessages(db, conv.id);
              if (!messages.length) continue;
              const filename = conv.key; // ^ Horizon lowercases on lookup; preserve original case on disk.
              const displayName = conv.name || conv.key;
              const { logBuf, idxBuf } = assembleConversation(
                displayName,
                messages,
              );
              const base = `characters/${character}/logs/${filename}`;
              zip.file(base, logBuf);
              zip.file(`${base}.idx`, idxBuf);
              conversationCount++;
              messageCount += messages.length;
            } catch (e) {
              err(`conversation ${conv && conv.key}`, e);
              failures.push(`${character}/${conv && conv.key}: ${e.message}`);
            }
          }
        } finally {
          try {
            db.close();
          } catch {
            /* ignore */
          }
        }

        // * Dump every per-character setting blob; Horizon's importer takes whatever's under settings/.
        for (const fullKey of characterSettingsKeys(character)) {
          const settingName = fullKey.slice(
            character.length + '.settings.'.length,
          );
          const value = localStorage.getItem(fullKey);
          if (value === null) continue;
          zip.file(`characters/${character}/settings/${settingName}`, value);
          settingsCount++;
        }

        await yieldUi();
      }

      progress.update(chosen.length, chosen.length + 1, 'Compressing ZIP…');
      const blob = await zip.generateAsync(
        {
          type: 'blob',
          compression: 'DEFLATE',
          compressionOptions: { level: 6 },
        },
        ({ percent }) => {
          const base = chosen.length;
          progress.update(
            base + percent / 100,
            chosen.length + 1,
            `Compressing ZIP… ${percent.toFixed(0)}%`,
          );
        },
      );

      const stamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
      const filename = `horizon-export-${stamp}.zip`;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 30_000);

      progress.update(1, 1, 'Done');
      const sizeMb = (blob.size / 1024 / 1024).toFixed(2);
      const summary = `Exported ${messageCount} messages across ${conversationCount} conversations and ${settingsCount} settings files (${sizeMb} MB).`;
      log(summary);
      if (failures.length) {
        warn('Failures during export:', failures);
        toast(
          `${summary} ${failures.length} item(s) failed — see console.`,
          'err',
          9000,
        );
      } else {
        toast(summary);
      }
    } finally {
      progress.remove();
      triggerBtn.disabled = false;
    }
  }

  // & ============================================================
  // & Init
  // & ============================================================

  injectStyles();
  addButton();
  // ^ F-Chat 3 swaps views client-side and can blow our button away.
  const obs = new MutationObserver(() => {
    if (!document.querySelector('.fp-btn')) addButton();
  });
  obs.observe(document.documentElement, { childList: true, subtree: true });
})();
