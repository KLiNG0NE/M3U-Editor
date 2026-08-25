/* ========================================================
    BATCH-AKTIONEN
    ======================================================== */
function batchSetGroup() {
    const group = document.getElementById('batchGroup').value;
    if (!group) {
        showToast('Bitte eine Gruppe auswählen', 'error');
        return;
    }

    let count = 0;
    for (const id of state.selectedIds) {
        const ch = state.channels.find(c => c.id === id);
        if (ch) {
            ch.group = group;
            count++;
        }
    }

    state.selectedIds.clear();
    render();
    showToast(`${count} Sender der Gruppe "${group}" zugewiesen`, 'success');
}

function batchToggleRadio() {
    let count = 0;
    for (const id of state.selectedIds) {
        const ch = state.channels.find(c => c.id === id);
        if (ch) {
            ch.radio = !isRadio(ch);
            count++;
        }
    }

    render();
    showToast(`Radio-Flag für ${count} Sender umgeschaltet`, 'success');
}

function batchDelete() {
    const count = state.selectedIds.size;
    if (count === 0) return;

    showConfirm(
        'Sender löschen',
        `Möchtest du ${count} ausgewählte Sender wirklich löschen?`,
        null,
        () => {
            state.channels = state.channels.filter(c => !state.selectedIds.has(c.id));
            state.selectedIds.clear();
            render();
            showToast(`${count} Sender gelöscht`, 'success');
        }
    );
}
