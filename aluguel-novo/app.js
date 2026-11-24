(function () {
var partes = ["corpo-1.html", "corpo-2.html", "corpo-3.html", "corpo-4.html"];
var alvo = document.getElementById('app');
Promise.all(partes.map(function (p) {
  return fetch(p, { cache: 'no-cache' }).then(function (r) { if (!r.ok) { throw new Error(p); } return r.text(); });
})).then(function (t) {
  alvo.innerHTML = t.join('');
  iniciar();
  if (location.hash) { var el = document.getElementById(location.hash.slice(1)); if (el) { el.scrollIntoView(); } }
}).catch(function () {
  alvo.innerHTML = '<p class="nota" style="padding:24px">Não foi possível carregar o guia. Recarregue a página.</p>';
});
function iniciar() {
var grid = document.getElementById('cards-grid');
var cards = Array.prototype.slice.call(grid.querySelectorAll('article.card'));
var chipBtns = Array.prototype.slice.call(document.querySelectorAll('.fchip[data-filter]'));
var regionSel = document.getElementById('region-filter');
var sortSel = document.getElementById('sort-select');
var searchInput = document.getElementById('search-input');
var resetBtn = document.getElementById('reset-filters');
var emptyResetBtn = document.getElementById('empty-reset');
var visibleCount = document.getElementById('visible-count');
var emptyState = document.getElementById('empty-state');
var state = {
chip: 'all',
region: 'all',
sort: 'rank',
query: ''
};
function applyFiltersAndSort() {
var q = state.query.trim().toLowerCase();
var shown = 0;
cards.forEach(function (card) {
var cap = card.getAttribute('data-cap');
var cost = Number(card.getAttribute('data-cost'));
var suites3 = card.getAttribute('data-suites3') === '1';
var region = card.getAttribute('data-region');
var blob = (card.textContent || '').toLowerCase();
var okChip = true;
if (state.chip === 'in-cap') okChip = (cost <= 7000);
else if (state.chip === 'discount') okChip = (cap === 'discount');
else if (state.chip === 'over-cap') okChip = (cap === 'over-cap');
else if (state.chip === '3-suites') okChip = suites3;
var okRegion = (state.region === 'all') || (region === state.region);
var okQuery = (!q) || (blob.indexOf(q) !== -1);
var match = okChip && okRegion && okQuery;
card.classList.toggle('hidden', !match);
if (match) shown += 1;
});
var sorted = cards.slice().sort(function (a, b) {
if (state.sort === 'cost-asc') {
return Number(a.getAttribute('data-cost')) - Number(b.getAttribute('data-cost'));
}
if (state.sort === 'm2-asc') {
return Number(a.getAttribute('data-m2price')) - Number(b.getAttribute('data-m2price'));
}
if (state.sort === 'area-desc') {
return Number(b.getAttribute('data-area')) - Number(a.getAttribute('data-area'));
}
return Number(a.getAttribute('data-rank')) - Number(b.getAttribute('data-rank'));
});
sorted.forEach(function (c) { grid.appendChild(c); });
visibleCount.textContent = 'Exibindo ' + shown + ' de ' + cards.length + ' casas';
emptyState.hidden = shown > 0;
}
function resetAll() {
state.chip = 'all';
state.region = 'all';
state.sort = 'rank';
state.query = '';
chipBtns.forEach(function (b) {
b.classList.toggle('active', b.getAttribute('data-filter') === 'all');
});
regionSel.value = 'all';
sortSel.value = 'rank';
searchInput.value = '';
applyFiltersAndSort();
}
chipBtns.forEach(function (btn) {
btn.addEventListener('click', function () {
state.chip = btn.getAttribute('data-filter');
chipBtns.forEach(function (b) { b.classList.toggle('active', b === btn); });
applyFiltersAndSort();
});
});
regionSel.addEventListener('change', function () {
state.region = regionSel.value;
applyFiltersAndSort();
});
sortSel.addEventListener('change', function () {
state.sort = sortSel.value;
applyFiltersAndSort();
});
searchInput.addEventListener('input', function () {
state.query = searchInput.value;
applyFiltersAndSort();
});
resetBtn.addEventListener('click', resetAll);
emptyResetBtn.addEventListener('click', resetAll);
document.addEventListener('click', function (e) {
var a = e.target.closest('a[href^="#casa-"]');
if (!a) return;
var target = document.querySelector(a.getAttribute('href'));
if (target && target.classList.contains('hidden')) {
resetAll();
}
});
var favKey = 'guia_casas_favs_2026_11_23';
var favs = {};
try {
favs = JSON.parse(localStorage.getItem(favKey) || '{}');
} catch (err) {}
document.querySelectorAll('.fav-btn').forEach(function (btn) {
var id = btn.getAttribute('data-fav');
function renderFav() {
var on = !!favs[id];
btn.setAttribute('aria-pressed', on ? 'true' : 'false');
btn.textContent = on ? '★' : '☆';
}
renderFav();
btn.addEventListener('click', function () {
favs[id] = !favs[id];
renderFav();
try { localStorage.setItem(favKey, JSON.stringify(favs)); } catch (err) {}
});
});
// Lightbox Modal (reads directly from DOM imgs to avoid duplicate base64 data)
var lb = document.getElementById('lightbox');
var lbTitle = document.getElementById('lb-title');
var lbCounter = document.getElementById('lb-counter');
var lbStage = document.querySelector('.lb-stage');
var lbImg = document.createElement('img');
lbImg.id = 'lb-img';
lbImg.className = 'lb-img';
var lbPrev = document.getElementById('lb-prev');
var lbNext = document.getElementById('lb-next');
var lbClose = document.getElementById('lb-close');
var activeGal = null;
var activeIdx = 0;
var lastFocused = null;
var touchStartX = null;
function renderLb() {
if (!activeGal) return;
var total = activeGal.photos.length;
lbTitle.textContent = activeGal.title;
lbCounter.textContent = 'Foto ' + (activeIdx + 1) + ' de ' + total;
lbImg.src = activeGal.photos[activeIdx];
lbImg.alt = activeGal.title + ' - Foto ' + (activeIdx + 1) + ' de ' + total;
lbPrev.disabled = (total <= 1);
lbNext.disabled = (total <= 1);
}
function openLb(houseId, idx, triggerEl) {
var galEl = triggerEl.closest('.gal');
var imgs = Array.prototype.slice.call(
document.querySelectorAll('button.thumb[data-house="' + houseId + '"] img')
);
if (!imgs.length) return;
lastFocused = triggerEl || document.activeElement;
activeGal = {
title: (galEl && galEl.getAttribute('data-lb-title')) || houseId,
photos: imgs.map(function (im) { return im.src; })
};
activeIdx = Math.max(0, Math.min(idx, activeGal.photos.length - 1));
if (!lbImg.parentNode) lbStage.insertBefore(lbImg, lbNext);
renderLb();
lb.hidden = false;
lbClose.focus();
}
function closeLb() {
lb.hidden = true;
if (lbImg.parentNode) lbImg.parentNode.removeChild(lbImg);
activeGal = null;
if (lastFocused && typeof lastFocused.focus === 'function') {
lastFocused.focus();
}
}
function stepLb(delta) {
if (!activeGal) return;
var total = activeGal.photos.length;
activeIdx = (activeIdx + delta + total) % total;
renderLb();
}
document.addEventListener('click', function (e) {
var btn = e.target.closest('button.thumb[data-house]');
if (!btn) return;
openLb(btn.getAttribute('data-house'), Number(btn.getAttribute('data-idx') || 0), btn);
});
lbPrev.addEventListener('click', function () { stepLb(-1); });
lbNext.addEventListener('click', function () { stepLb(1); });
lbClose.addEventListener('click', closeLb);
lb.addEventListener('click', function (e) {
if (e.target === lb) closeLb();
});
lb.addEventListener('touchstart', function (e) {
if (e.changedTouches && e.changedTouches.length) {
touchStartX = e.changedTouches[0].clientX;
}
}, { passive: true });
lb.addEventListener('touchend', function (e) {
if (touchStartX === null || !e.changedTouches || !e.changedTouches.length) return;
var dx = e.changedTouches[0].clientX - touchStartX;
touchStartX = null;
if (Math.abs(dx) > 40) stepLb(dx < 0 ? 1 : -1);
}, { passive: true });
document.addEventListener('keydown', function (e) {
if (lb.hidden) return;
if (e.key === 'Escape') closeLb();
else if (e.key === 'ArrowLeft') stepLb(-1);
else if (e.key === 'ArrowRight') stepLb(1);
});
}
})();
