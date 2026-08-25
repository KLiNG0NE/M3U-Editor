/* ========================================================
    SUCHE & SORTIERUNG
    ======================================================== */
// FIX: Debounced Suche
let searchTimeout = null;
document.getElementById('searchInput').addEventListener('input', function(e) {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        state.searchQuery = e.target.value;
        renderChannels(); // Nur Kanäle neu rendern, nicht alles
        renderToolbar();
    }, 200); // 200ms Debounce
});

function applySort() {
    state.sortOrder = document.getElementById('sortSelect').value;
    renderChannels();
}

function setView(mode) {
    state.viewMode = mode;

    const btnTable = document.getElementById('viewTable');
    const btnCards = document.getElementById('viewCards');

    if (mode === 'table') {
        btnTable.className = 'px-3 py-1 text-xs bg-accent text-bg';
        btnCards.className = 'px-3 py-1 text-xs text-gray-500 hover:text-gray-300';
    } else {
        btnTable.className = 'px-3 py-1 text-xs text-gray-500 hover:text-gray-300';
        btnCards.className = 'px-3 py-1 text-xs bg-accent text-bg';
    }

    renderChannels();
}
