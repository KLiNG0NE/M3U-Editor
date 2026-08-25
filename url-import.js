/* ========================================================
    URL-IMPORT
    ======================================================== */
function openUrlModal() {
    document.getElementById('urlModal').classList.remove('hidden');
    document.getElementById('urlModal').classList.add('flex');
    setTimeout(() => document.getElementById('urlImportInput').focus(), 100);
}

function closeUrlModal() {
    document.getElementById('urlModal').classList.add('hidden');
    document.getElementById('urlModal').classList.remove('flex');
    document.getElementById('urlImportStatus').classList.add('hidden');
}

let useUrlProxy = false;
function toggleUrlProxy() {
    useUrlProxy = !useUrlProxy;
    const toggle = document.getElementById('urlProxyToggle');
    if (useUrlProxy) toggle.classList.add('on');
    else toggle.classList.remove('on');
}

function importFromUrl() {
    const url = document.getElementById('urlImportInput').value.trim();
    if (!url) {
        showToast('Bitte eine URL eingeben', 'error');
        return;
    }

    // FIX: URL-Validierung
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        showToast('URL muss mit http:// oder https:// beginnen', 'error');
        return;
    }

    const btn = document.getElementById('urlImportBtn');
    const status = document.getElementById('urlImportStatus');

    // Loading-State
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Lädt...';
    status.classList.remove('hidden');
    status.innerHTML = '<div class="flex items-center gap-2 text-sm text-gray-400"><i class="fa-solid fa-spinner fa-spin"></i> Playlist wird geladen...</div>';

    // CORS-Proxy wenn aktiviert
    let fetchUrl = url;
    if (useUrlProxy) {
        fetchUrl = 'https://api.allorigins.win/raw?url=' + encodeURIComponent(url);
    }

    fetch(fetchUrl)
        .then(response => {
            if (!response.ok) throw new Error('HTTP ' + response.status);
            return response.text();
        })
        .then(text => {
            const result = parseM3U(text);

            if (result.channels.length === 0) {
                throw new Error('Keine Sender gefunden');
            }

            const mode = document.querySelector('input[name="urlImportMode"]:checked')?.value || 'merge';

            if (mode === 'replace' && state.channels.length > 0) {
                showConfirm(
                    'Sender ersetzen',
                    `${result.channels.length} Sender gefunden. Alle bestehenden ${state.channels.length} Sender ersetzen?`,
                    null,
                    () => {
                        state.channels = result.channels;
                        state.epgUrls = result.epgUrls;
                        render();
                        closeUrlModal();
                        showToast(`${result.channels.length} Sender importiert`, 'success');
                    }
                );
            } else {
                // Merge
                const existingUrls = new Set(state.channels.map(c => c.url));
                let added = 0;
                for (const ch of result.channels) {
                    if (!existingUrls.has(ch.url)) {
                        state.channels.push(ch);
                        existingUrls.add(ch.url);
                        added++;
                    }
                }

                for (const epgUrl of result.epgUrls) {
                    if (!state.epgUrls.includes(epgUrl)) {
                        state.epgUrls.push(epgUrl);
                    }
                }

                render();
                closeUrlModal();
                showToast(`${added} neue Sender hinzugefügt (${result.channels.length - added} Duplikate übersprungen)`, 'success');
            }
        })
        .catch(err => {
            console.error('URL-Import-Fehler:', err);
            status.innerHTML = `<div class="flex items-center gap-2 text-sm text-danger">
                <i class="fa-solid fa-circle-exclamation"></i>
                Fehler: ${escHtml(err.message)}
                ${!useUrlProxy ? '<br><span class="text-xs text-gray-500">Tipp: CORS-Proxy aktivieren, falls der Anbieter Browser-Zugriffe blockiert.</span>' : ''}
            </div>`;
        })
        .finally(() => {
            btn.disabled = false;
            btn.innerHTML = '<i class="fa-solid fa-cloud-arrow-down"></i> Importieren';
        });
}
