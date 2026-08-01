/* Replace these two lines with the values from Supabase > Project Settings > API. */
const SUPABASE_URL  = 'https://layavdvfxmcgqxqcvtmq.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxheWF2ZHZmeG1jZ3F4cWN2dG1xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU1NDA1NDMsImV4cCI6MjEwMTExNjU0M30.Jq0EK7zPBFlMQASbPiMyQfxsYWE2oIuCwmP_goDXCL8';

const { createClient } = (window.supabase || { createClient: null });
const db = createClient ? createClient(SUPABASE_URL, SUPABASE_ANON) : null;

async function fetchAll(table, options = {}) {
  if (!db) return [];
  let query = db.from(table).select('*');
  if (options.order)  query = query.order(options.order, { ascending: options.asc ?? false });
  if (options.limit)  query = query.limit(options.limit);
  if (options.filter) query = query.eq(options.filter.col, options.filter.val);
  const { data, error } = await query;
  if (error) { console.error('fetchAll ' + table, error); return []; }
  return data || [];
}

async function insertRow(table, row) {
  if (!db) return false;
  const { error } = await db.from(table).insert(row);
  if (error) { console.error('insertRow ' + table, error); return false; }
  return true;
}

async function deleteRow(table, id) {
  if (!db) return false;
  const { error } = await db.from(table).delete().eq('id', id);
  if (error) { console.error('deleteRow ' + table, error); return false; }
  return true;
}

async function updateRow(table, id, updates) {
  if (!db) return false;
  const { error } = await db.from(table).update(updates).eq('id', id);
  if (error) { console.error('updateRow ' + table, error); return false; }
  return true;
}

function showToast(msg, duration = 2500) {
  let t = document.getElementById('toast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'toast'; t.className = 'toast';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), duration);
}

/* SOOP does not listen to this message. It is kept for direct access and other hosts.
   Embed heights are written per page width in README. */
function initIframeResize() {
  if (window.self === window.top) return;
  var last = 0;
  function send() {
    var h = Math.ceil(Math.max(
      document.body.scrollHeight, document.body.offsetHeight,
      document.documentElement.offsetHeight));
    if (!h || Math.abs(h - last) < 2) return;
    last = h;
    var p = window.parent;
    try { p.postMessage(h, '*'); } catch (e) {}
    try { p.postMessage({ type: 'resize', height: h }, '*'); } catch (e) {}
    try { p.postMessage({ height: h }, '*'); } catch (e) {}
    try { p.postMessage({ context: 'iframe.resize', height: h }, '*'); } catch (e) {}
    try { p.postMessage('setHeight:' + h, '*'); } catch (e) {}
  }
  send();
  window.addEventListener('load', send);
  window.addEventListener('resize', send);
  document.addEventListener('click', function () { setTimeout(send, 120); });
  if (window.ResizeObserver) new ResizeObserver(send).observe(document.body);
  [200, 600, 1200, 2500].forEach(function (t) { setTimeout(send, t); });
}
function enableIframeAutoHeight() { initIframeResize(); }

/* Inside an iframe, position:fixed is measured against the whole iframe box, not the
   visible area. Masks are switched to absolute and placed at the last click position. */
var FX_EMBED = (function () { try { return window.self !== window.top; } catch (e) { return true; } })();
var _lastClickY = 0;

function placeMask(el) {
  if (!FX_EMBED || !el) return;
  var inner = el.querySelector('.askmodal, .modal, .inner, .lightbox-inner');
  var dh = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
  el.style.height = dh + 'px';
  var ih = inner ? inner.offsetHeight : 280;
  var y = Math.round(Math.max(16, Math.min(_lastClickY - ih / 2, dh - ih - 16)));
  if (inner) inner.style.marginTop = y + 'px';
  var x = el.querySelector('.lightbox-close');
  if (x) x.style.top = Math.max(8, y - 34) + 'px';
}

var MASK_SEL = '.askmask, .ov, .lightbox';
var MASK_ON  = ['on', 'show', 'open'];

function closeAllMasks() {
  document.querySelectorAll(MASK_SEL).forEach(function (m) {
    MASK_ON.forEach(function (c) { m.classList.remove(c); });
  });
}

function initEmbedLayout() {
  if (FX_EMBED) document.body.classList.add('embed');
  document.addEventListener('click', function (e) { if (e.pageY) _lastClickY = e.pageY; }, true);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeAllMasks(); });
  if (!window.MutationObserver) return;
  new MutationObserver(function (muts) {
    muts.forEach(function (r) {
      var t = r.target;
      if (!t.matches || !t.matches(MASK_SEL)) return;
      if (MASK_ON.some(function (c) { return t.classList.contains(c); })) placeMask(t);
    });
  }).observe(document.documentElement, { attributes: true, attributeFilter: ['class'], subtree: true });
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initEmbedLayout);
else initEmbedLayout();

/* Reads the palette and type-scale keys saved in admin and pushes them into CSS variables. */
async function applyTheme() {
  try {
    if (!db) return;
    const { data } = await db.from('profile').select('data').eq('id', 1).single();
    const p = (data && data.data) || {};
    const map = {
      'theme-main':      '--main',
      'theme-main-dark': '--main-dark',
      'theme-main-deep': '--main-deep',
      'theme-main-light':'--main-light',
      'theme-bg':        '--bg',
      'theme-logo':      '--logo',
      'type-display':    '--fs-display',
      'type-title':      '--fs-title',
      'type-body':       '--fs-body',
      'type-label':      '--fs-label'
    };
    Object.keys(map).forEach(function (k) {
      if (p[k]) document.documentElement.style.setProperty(map[k], p[k]);
    });
  } catch (e) {}
}
applyTheme();

/* Fixed on-screen wording is editable in admin. Keys are 'txt-{data-t value}'. */
var TXT = null, _txtObs = null;
function applyTexts(root) {
  if (!TXT || !root) return;
  var list = [];
  if (root.nodeType === 1 && root.hasAttribute && root.hasAttribute('data-t')) list.push(root);
  if (root.querySelectorAll) {
    var q = root.querySelectorAll('[data-t]');
    for (var i = 0; i < q.length; i++) list.push(q[i]);
  }
  for (var j = 0; j < list.length; j++) {
    var v = String(TXT['txt-' + list[j].getAttribute('data-t')] || '').trim();
    if (v && list[j].textContent !== v) list[j].textContent = v;
  }
}
function initTexts(profileData) {
  TXT = profileData || {};
  applyTexts(document);
  if (window.MutationObserver && !_txtObs) {
    _txtObs = new MutationObserver(function (muts) {
      for (var m = 0; m < muts.length; m++)
        for (var n = 0; n < muts[m].addedNodes.length; n++)
          if (muts[m].addedNodes[n].nodeType === 1) applyTexts(muts[m].addedNodes[n]);
    });
    _txtObs.observe(document.body, { childList: true, subtree: true });
  }
}

/* Values coming out of profile.data can be arrays or objects. Always normalise first. */
function txt(v) {
  if (v === null || v === undefined) return '';
  if (Array.isArray(v)) return v.map(txt).filter(Boolean).join(', ');
  if (typeof v === 'object') return Object.keys(v).map(function (k) { return txt(v[k]); }).filter(Boolean).join(', ');
  return String(v);
}

function esc(s) {
  return txt(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function soopAvatarUrl(id) {
  id = txt(id).trim().toLowerCase();
  if (id.length < 2) return '';
  return 'https://profile.img.sooplive.co.kr/LOGO/' + id.slice(0, 2) + '/' + id + '/' + id + '.jpg';
}

async function loadProfileData() {
  try {
    const { data } = await db.from('profile').select('data').eq('id', 1).single();
    return (data && data.data) || {};
  } catch (e) { return {}; }
}

function markReady() { document.body.classList.add('ready'); }
window.addEventListener('load', markReady);
setTimeout(markReady, 1400);
