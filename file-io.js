/* ========================================================
    DATEI-IMPORT/EXPORT
    ======================================================== */
function importFile() {
    document.getElementById('fileInput').click();
}

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;

    // FIX: Dateigrößen-Prüfung (max. 10MB)
    if (file.size > 10 * 1024 * 1024) {
        showToast('Datei zu groß (max. 10MB)', 'error');
        event.target.value = '';
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const text = e.target.result;
            const result = parseM3U(text);

            if (result.channels.length === 0) {
                showToast('Keine Sender in der Datei gefunden', 'error');
                return;
            }

            // Bestehende Sender ersetzen oder zusammenführen
            if (state.channels.length > 0) {
                showConfirm(
                    'Import-Modus',
                    `${result.channels.length} Sender gefunden. Wie soll importiert werden?`,
                    `<div class="text-sm">
                        <label class="flex items-center gap-2 mt-2 cursor-pointer">
                            <input type="radio" name="importMode" value="merge" checked class="accent-accent">
                            <span>Zusammenführen (Duplikate überspringen)</span>
                        </label>
                        <label class="flex items-center gap-2 mt-2 cursor-pointer">
                            <input type="radio" name="importMode" value="replace" class="accent-accent">
                            <span>Ersetzen (alle bestehenden löschen)</span>
                        </label>
                    </div>`,
                    () => {
                        const mode = document.querySelector('input[name="importMode"]:checked')?.value || 'merge';

                        if (mode === 'replace') {
                            state.channels = result.channels;
                        } else {
                            // Merge: Duplikate anhand URL überspringen
                            const existingUrls = new Set(state.channels.map(c => c.url));
                            for (const ch of result.channels) {
                                if (!existingUrls.has(ch.url)) {
                                    state.channels.push(ch);
                                    existingUrls.add(ch.url);
                                }
                            }
                        }

                        // EPG-URLs zusammenführen
                        for (const epgUrl of result.epgUrls) {
                            if (!state.epgUrls.includes(epgUrl)) {
                                state.epgUrls.push(epgUrl);
                            }
                        }

                        render();
                        showToast(`${result.channels.length} Sender importiert`, 'success');
                    }
                );
            } else {
                // Erster Import - direkt laden
                state.channels = result.channels;
                state.epgUrls = result.epgUrls;
                render();
                showToast(`${result.channels.length} Sender importiert`, 'success');
            }

        } catch (err) {
            console.error('Import-Fehler:', err);
            showToast('Fehler beim Importieren der Datei', 'error');
        }
    };

    reader.readAsText(file);
    event.target.value = ''; // Reset für erneute Auswahl derselben Datei
}

function exportFile() {
    if (state.channels.length === 0) {
        showToast('Keine Sender zum Exportieren vorhanden', 'error');
        return;
    }

    const m3uContent = generateM3U();
    const blob = new Blob([m3uContent], { type: 'audio/x-mpegurl' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'playlist.m3u';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast('M3U-Datei exportiert', 'success');
}
