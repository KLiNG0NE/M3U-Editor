/* ========================================================
    DRAG & DROP FÜR DATEI-IMPORT
    ======================================================== */
let dragCounter = 0;

document.addEventListener('dragenter', function(e) {
    // Nur für Dateien (nicht für interne Drag & Drop)
    if (e.dataTransfer.types.includes('Files')) {
        dragCounter++;
        document.getElementById('dropOverlay').classList.add('active');
    }
});

document.addEventListener('dragleave', function(e) {
    if (e.dataTransfer.types.includes('Files')) {
        dragCounter--;
        if (dragCounter === 0) {
            document.getElementById('dropOverlay').classList.remove('active');
        }
    }
});

document.addEventListener('dragover', function(e) {
    // Prevent default für Datei-Drop
    if (e.dataTransfer.types.includes('Files')) {
        e.preventDefault();
    }
});

document.addEventListener('drop', function(e) {
    if (e.dataTransfer.types.includes('Files')) {
        e.preventDefault();
        dragCounter = 0;
        document.getElementById('dropOverlay').classList.remove('active');

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            const file = files[0];

            // FIX: Dateityp prüfen
            if (!file.name.toLowerCase().match(/\.(m3u|m3u8|txt)$/)) {
                showToast('Nur .m3u, .m3u8 oder .txt Dateien werden unterstützt', 'error');
                return;
            }

            // Datei verarbeiten
            const reader = new FileReader();
            reader.onload = function(ev) {
                try {
                    const text = ev.target.result;
                    const result = parseM3U(text);

                    if (result.channels.length === 0) {
                        showToast('Keine Sender in der Datei gefunden', 'error');
                        return;
                    }

                    // Merge-Import
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
                    showToast(`${added} Sender importiert (${result.channels.length - added} Duplikate übersprungen)`, 'success');

                } catch (err) {
                    console.error('Import-Fehler:', err);
                    showToast('Fehler beim Importieren der Datei', 'error');
                }
            };

            reader.readAsText(file);
        }
    }
});
