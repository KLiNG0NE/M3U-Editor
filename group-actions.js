/* ========================================================
    GRUPPEN-AKTIONEN
    ======================================================== */
function selectGroup(group) {
    state.selectedGroup = group;
    render();
}

function addGroup() {
    state.editGroupMode = 'create';
    state.editGroupOldName = '';
    document.getElementById('groupModalTitle').textContent = 'Gruppe erstellen';
    document.getElementById('groupModalInput').value = '';
    document.getElementById('groupModal').classList.remove('hidden');
    document.getElementById('groupModal').classList.add('flex');
    setTimeout(() => document.getElementById('groupModalInput').focus(), 100);
}

function renameGroup(groupName) {
    state.editGroupMode = 'rename';
    state.editGroupOldName = groupName;
    document.getElementById('groupModalTitle').textContent = 'Gruppe umbenennen';
    document.getElementById('groupModalInput').value = groupName;
    document.getElementById('groupModal').classList.remove('hidden');
    document.getElementById('groupModal').classList.add('flex');
    setTimeout(() => document.getElementById('groupModalInput').focus(), 100);
}

function deleteGroup(groupName) {
    const count = state.channels.filter(c => c.group === groupName).length;

    if (count === 0 && state.selectedGroup === groupName) {
        // Gruppe ist ausgewählt — zurück zu "Alle"
        state.selectedGroup = '__all__';
    }
    render();
    showToast('Gruppe gelöscht', 'success');
}

function deleteGroup(groupName) {
    const count = state.channels.filter(c => c.group === groupName).length;

    if (count > 0) {
        showConfirm(
            'Gruppe löschen',
            `Die Gruppe "${groupName}" enthält ${count} Sender. Was soll mit diesen Sendern geschehen?`,
            `<div class="text-sm">
                <p class="text-gray-400">Die Sender werden der Gruppe "Ohne Gruppe" zugeordnet.</p>
            </div>`,
            () => {
                // Alle Sender dieser Gruppe auf "keine Gruppe" setzen
                state.channels.forEach(c => {
                    if (c.group === groupName) c.group = '';
                });
                // Gruppe aus groupOrder entfernen
                state.groupOrder = state.groupOrder.filter(g => g !== groupName);
                // Falls die gelöschte Gruppe ausgewählt war, zurück zu "Alle"
                if (state.selectedGroup === groupName) state.selectedGroup = '__all__';
                render();
                showToast('Gruppe gelöscht', 'success');
            }
        );
    } else {
        // Keine Sender in dieser Gruppe — auch hier Bestätigung
        showConfirm(
            'Gruppe löschen',
            `Möchtest du die leere Gruppe "${groupName}" wirklich löschen?`,
            null,
            () => {
                if (state.selectedGroup === groupName) state.selectedGroup = '__all__';
                state.groupOrder = state.groupOrder.filter(g => g !== groupName);
                render();
                showToast('Gruppe gelöscht', 'success');
            }
        );
    }
}

function saveGroup() {
    const name = document.getElementById('groupModalInput').value.trim();
    if (!name) {
        showToast('Bitte einen Gruppennamen eingeben', 'error');
        return;
    }

    if (state.editGroupMode === 'create') {
        if (!state.groupOrder.includes(name)) {
            state.groupOrder.push(name);
            showToast(`Gruppe "${name}" erstellt`, 'success');
        } else {
            showToast('Gruppe existiert bereits', 'error');
            return;
        }
    } else if (state.editGroupMode === 'rename') {
        const oldName = state.editGroupOldName;
        if (name !== oldName) {
            // Alle Sender umbenennen
            state.channels.forEach(c => {
                if (c.group === oldName) c.group = name;
            });
            // groupOrder aktualisieren
            state.groupOrder = state.groupOrder.map(g => g === oldName ? name : g);
            // Falls ausgewählte Gruppe umbenannt wurde
            if (state.selectedGroup === oldName) state.selectedGroup = name;
            showToast(`Gruppe umbenannt zu "${name}"`, 'success');
        }
    }

    closeGroupModal();
    render();
}

function closeGroupModal() {
    document.getElementById('groupModal').classList.add('hidden');
    document.getElementById('groupModal').classList.remove('flex');
}
