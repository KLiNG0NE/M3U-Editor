/* ========================================================
    EPG-MODAL
    ======================================================== */
function openEpgModal() {
    renderEpgList();
    document.getElementById('epgModal').classList.remove('hidden');
    document.getElementById('epgModal').classList.add('flex');
}

function closeEpgModal() {
    document.getElementById('epgModal').classList.add('hidden');
    document.getElementById('epgModal').classList.remove('flex');
}

function renderEpgList() {
    const container = document.getElementById('epgUrlList');
    container.innerHTML = '';

    if (state.epgUrls.length === 0) {
        container.innerHTML = '<p class="text-sm text-gray-500 text-center py-4">Keine EPG-URLs vorhanden</p>';
        return;
    }

    for (let i = 0; i < state.epgUrls.length; i++) {
        const url = state.epgUrls[i];
        const row = document.createElement('div');
        row.className = 'epg-url-row';

        // FIX: Sicherer HTML-Inhalt
        row.innerHTML = `
            <i class="fa-solid fa-link text-xs text-gray-500"></i>
            <span class="flex-1 text-xs font-mono truncate">${escHtml(url)}</span>
            <button class="btn btn-icon btn-danger" style="width:24px;height:24px;padding:0;" title="Löschen" data-index="${i}">
                <i class="fa-solid fa-trash text-[10px]"></i>
            </button>
        `;

        // FIX: Event-Listener statt Inline-Handler
        const deleteBtn = row.querySelector('button');
        deleteBtn.addEventListener('click', () => {
            state.epgUrls.splice(i, 1);
            renderEpgList();
            updateEpgIndicator();
            saveToLocalStorage();
            showToast('EPG-URL gelöscht', 'success');
        });

        container.appendChild(row);
    }
}

function addEpgUrl() {
    const input = document.getElementById('newEpgUrl');
    const url = input.value.trim();

    if (!url) {
        showToast('Bitte eine URL eingeben', 'error');
        return;
    }

    // FIX: URL-Validierung
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        showToast('URL muss mit http:// oder https:// beginnen', 'error');
        return;
    }

    if (state.epgUrls.includes(url)) {
        showToast('URL existiert bereits', 'error');
        return;
    }

    state.epgUrls.push(url);
    input.value = '';
    renderEpgList();
    updateEpgIndicator();
    saveToLocalStorage();
    showToast('EPG-URL hinzugefügt', 'success');
}
