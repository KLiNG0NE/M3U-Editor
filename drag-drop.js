/* ========================================================
    DRAG & DROP
    ======================================================== */
function channelDragStart(event, id) {
    event.dataTransfer.setData('application/x-m3u-channel', id);
    event.dataTransfer.effectAllowed = 'move';
    state.dragSrcId = id;
    event.target.classList.add('dragging');
}

function channelDragEnd(event) {
    event.target.classList.remove('dragging');
    state.dragSrcId = null;
    // Alle Drag-Over-Klassen entfernen
    document.querySelectorAll('.drag-over-top, .drag-over-bottom, .drag-over-group').forEach(el => {
        el.classList.remove('drag-over-top', 'drag-over-bottom', 'drag-over-group');
    });
}

function channelDragOver(event) {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';

    const types = Array.from(event.dataTransfer.types);
    if (types.includes('application/x-m3u-channel')) {
        const target = event.currentTarget;
        target.classList.remove('drag-over-bottom');
        target.classList.add('drag-over-top');
    }
}

function channelDragLeave(event) {
    // FIX P0: event.target durch event.currentTarget ersetzt, um Flackern bei Hover über Unterelemente zu verhindern
    event.currentTarget.classList.remove('drag-over-top', 'drag-over-bottom');
}

function channelDrop(event, targetId) {
    event.preventDefault();
    event.stopPropagation();

    const srcId = event.dataTransfer.getData('application/x-m3u-channel');
    if (!srcId || srcId === targetId) return;

    // Kanäle im Array umsortieren
    const srcIdx = state.channels.findIndex(c => c.id === srcId);
    const targetIdx = state.channels.findIndex(c => c.id === targetId);

    if (srcIdx === -1 || targetIdx === -1) return;

    const channel = state.channels[srcIdx];
    state.channels.splice(srcIdx, 1);
    state.channels.splice(targetIdx, 0, channel);

    render();
}

function sidebarGroupDragOver(event) {
    event.preventDefault();
    event.currentTarget.classList.add('drag-over-group');
}

function sidebarGroupDragLeave(event) {
    event.currentTarget.classList.remove('drag-over-group');
}

function sidebarGroupDrop(event, groupName) {
    event.preventDefault();
    event.currentTarget.classList.remove('drag-over-group');

    const channelId = event.dataTransfer.getData('application/x-m3u-channel');
    if (!channelId) return;

    const ch = state.channels.find(c => c.id === channelId);
    if (!ch) return;

    if (groupName === '__ungrouped__') {
        ch.group = '';
    } else {
        ch.group = groupName;
    }

    render();
    showToast(`Sender der Gruppe "${groupName === '__ungrouped__' ? 'Ohne Gruppe' : groupName}" zugewiesen`, 'success');
}
