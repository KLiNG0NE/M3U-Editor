/* ========================================================
    RENDERING
    ======================================================== */
function render() {
    renderGroups();
    renderChannels();
    renderToolbar();
    renderFooter();
    updateBatchBar();
    updateEpgIndicator();
    saveToLocalStorage(); // Debounced!
}

function renderGroups() {
    const map = getGroupMap(), sorted = getSortedGroups(), all = state.channels.length;
    const tvCount = state.channels.filter(c => !isRadio(c)).length;
    const radioCount = state.channels.filter(c => isRadio(c)).length;
    const ungrouped = state.channels.filter(c => !c.group).length;

    document.getElementById('countAll').textContent = all;
    document.getElementById('countTv').textContent = tvCount;
    document.getElementById('countRadio').textContent = radioCount;
    document.getElementById('countUngrouped').textContent = ungrouped;

    document.querySelectorAll('#sidebar .group-item').forEach(el =>
        el.classList.toggle('active', el.dataset.group === state.selectedGroup)
    );

    const container = document.getElementById('groupList');
    container.innerHTML = '';

    for (const g of sorted) {
        const count = map.get(g) || 0;
        const div = document.createElement('div');
        div.className = 'group-item' + (state.selectedGroup === g ? ' active' : '');
        div.dataset.group = g;
        div.draggable = true;

        // FIX: Sicherer Event-Handler ohne Inline-JavaScript
        div.onclick = (e) => {
            if (!e.target.closest('.group-actions')) selectGroup(g);
        };

        div.addEventListener('dragstart', e => {
            e.dataTransfer.setData('application/x-m3u-group', g);
            e.dataTransfer.effectAllowed = 'move';
            div.classList.add('dragging');
        });
        div.addEventListener('dragend', () => div.classList.remove('dragging'));

        div.addEventListener('dragover', e => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            const types = Array.from(e.dataTransfer.types);
            if(types.includes('application/x-m3u-channel')) {
                div.classList.remove('drag-over-top', 'drag-over-bottom');
                div.classList.add('drag-over-group');
            } else if(types.includes('application/x-m3u-group')) {
                div.classList.remove('drag-over-group');
                const r = div.getBoundingClientRect();
                if(e.clientY < r.top + r.height / 2) div.classList.add('drag-over-top');
                else div.classList.add('drag-over-bottom');
            }
        });
        div.addEventListener('dragleave', () => div.classList.remove('drag-over-top', 'drag-over-bottom', 'drag-over-group'));
        div.addEventListener('drop', e => sidebarGroupDrop(e, g));

        // FIX: Sicherer HTML-Inhalt mit escHtml()
        div.innerHTML = `<i class="fa-solid fa-grip-vertical text-xs text-gray-600 cursor-grab"></i>
            <span class="flex-1 text-sm font-medium truncate">${escHtml(g)}</span>
            <span class="text-xs text-gray-500 font-mono">${count}</span>
            <div class="group-actions">
                <button class="btn btn-icon btn-ghost" style="width:24px;height:24px;padding:0;" title="Umbenennen" data-action="rename" data-group="${escAttr(g)}">
                    <i class="fa-solid fa-pen text-[10px]"></i>
                </button>
                <button class="btn btn-icon btn-danger" style="width:24px;height:24px;padding:0;" title="Löschen" data-action="delete" data-group="${escAttr(g)}">
                    <i class="fa-solid fa-trash text-[10px]"></i>
                </button>
            </div>`;

        // FIX: Event-Delegation für Buttons (sicherer als Inline-Handler)
        const btnRename = div.querySelector('[data-action="rename"]');
        const btnDelete = div.querySelector('[data-action="delete"]');

        if (btnRename) btnRename.addEventListener('click', (e) => {
            e.stopPropagation();
            renameGroup(g);
        });

        if (btnDelete) btnDelete.addEventListener('click', (e) => {
            e.stopPropagation();
            deleteGroup(g);
        });

        container.appendChild(div);
    }
}

function renderChannels() {
    const container = document.getElementById('channelContainer'), list = getFilteredChannels();
    if (list.length === 0) {
        container.innerHTML = `<div class="empty-state">
            <i class="fa-solid ${state.channels.length === 0 ? 'fa-satellite-dish' : 'fa-filter-circle-xmark'} text-4xl text-gray-700 mb-4"></i>
            <p class="text-gray-500 text-lg font-medium">${state.channels.length === 0 ? 'Keine Sender vorhanden' : 'Keine Ergebnisse'}</p>
            <p class="text-gray-600 text-sm mt-1">${state.channels.length === 0 ? 'Importiere eine M3U-Datei oder erstelle einen neuen Sender.' : 'Versuche einen anderen Suchbegriff oder Filter.'}</p>
        </div>`;
        return;
    }
    if (state.viewMode === 'table') renderTable(container, list);
    else renderCards(container, list);
}

function renderTable(container, list) {
    let html = `<div class="table-header">
        <div class="custom-check ${state.selectedIds.size === list.length && list.length > 0 ? 'checked' : ''}" onclick="toggleSelectAll()"></div>
        <div>Logo</div>
        <div>Name / URL</div>
        <div>Gruppe</div>
        <div>Nr.</div>
        <div></div>
        <div class="text-right">Aktionen</div>
    </div>`;

    for (const ch of list) {
        const sel = state.selectedIds.has(ch.id), radio = isRadio(ch);

        // FIX: Sicheres Logo-Rendering
        const logo = ch.tvg.logo ?
            `<img src="${escAttr(ch.tvg.logo)}" alt="" class="w-10 h-10 rounded-md object-contain bg-elevated"
             onerror="handleLogoError(this, ${radio})">
             <div class="logo-placeholder" style="display:none"><i class="fa-solid ${radio ? 'fa-radio' : 'fa-tv'}"></i></div>` :
            `<div class="logo-placeholder"><i class="fa-solid ${radio ? 'fa-radio radio-icon' : 'fa-tv'}"></i></div>`;

        const chno = ch.tvg.chno ?
            `<span class="font-mono text-xs bg-elevated px-2 py-0.5 rounded">${escHtml(ch.tvg.chno)}</span>` :
            '<span class="text-gray-700 text-xs">-</span>';

        html += `<div class="channel-row ${sel ? 'selected' : ''}" data-id="${escAttr(ch.id)}"
            draggable="true"
            ondragstart="channelDragStart(event,'${escAttr(ch.id)}')"
            ondragend="channelDragEnd(event)"
            ondragover="channelDragOver(event)"
            ondragleave="channelDragLeave(event)"
            ondrop="channelDrop(event,'${escAttr(ch.id)}')">
            <div class="custom-check ${sel ? 'checked' : ''}" onclick="event.stopPropagation();toggleSelect('${escAttr(ch.id)}')"></div>
            <div>${logo}</div>
            <div class="min-w-0">
                <div class="text-sm font-medium truncate">${escHtml(ch.name || 'Unbenannt')}</div>
                <div class="text-xs text-gray-600 font-mono truncate">${escHtml(ch.url || 'Keine URL')}</div>
            </div>
            <div>${ch.group ? `<span class="badge bg-accent-dim text-accent">${escHtml(ch.group)}</span>` : '<span class="text-gray-700 text-xs">-</span>'}</div>
            <div>${chno}</div>
            <div>${radio ? '<i class="fa-solid fa-radio radio-icon" title="Radio-Sender"></i>' : ''}</div>
            <div class="flex items-center justify-end gap-1">
                <button class="btn btn-icon btn-ghost" style="width:26px;height:26px;padding:0;" title="Oben" onclick="event.stopPropagation();moveChannel('${escAttr(ch.id)}',-1)"><i class="fa-solid fa-chevron-up text-[10px]"></i></button>
                <button class="btn btn-icon btn-ghost" style="width:26px;height:26px;padding:0;" title="Unten" onclick="event.stopPropagation();moveChannel('${escAttr(ch.id)}',1)"><i class="fa-solid fa-chevron-down text-[10px]"></i></button>
                <button class="btn btn-icon btn-ghost" style="width:26px;height:26px;padding:0;" title="Kopieren" onclick="event.stopPropagation();duplicateChannel('${escAttr(ch.id)}')"><i class="fa-solid fa-copy text-[10px]"></i></button>
                <button class="btn btn-icon btn-ghost" style="width:26px;height:26px;padding:0;" title="Bearbeiten" onclick="event.stopPropagation();editChannel('${escAttr(ch.id)}')"><i class="fa-solid fa-pen text-[10px]"></i></button>
                <button class="btn btn-icon btn-danger" style="width:26px;height:26px;padding:0;" title="Löschen" onclick="event.stopPropagation();deleteChannel('${escAttr(ch.id)}')"><i class="fa-solid fa-trash text-[10px]"></i></button>
            </div>
        </div>`;
    }
    container.innerHTML = html;
}

function renderCards(container, list) {
    let html = '<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 p-4">';

    for (const ch of list) {
        const sel = state.selectedIds.has(ch.id), radio = isRadio(ch);

        // FIX: Sicheres Logo-Rendering für Karten
        const logo = ch.tvg.logo ?
            `<img src="${escAttr(ch.tvg.logo)}" alt="" class="w-14 h-14 rounded-lg object-contain bg-elevated"
             onerror="handleLogoError(this, ${radio})">` :
            `<div class="logo-placeholder w-14 h-14"><i class="fa-solid ${radio ? 'fa-radio radio-icon' : 'fa-tv'} text-lg"></i></div>`;

        html += `<div class="channel-card ${sel ? 'selected' : ''}" data-id="${escAttr(ch.id)}"
            draggable="true"
            ondragstart="channelDragStart(event,'${escAttr(ch.id)}')"
            ondragend="channelDragEnd(event)"
            ondragover="channelDragOver(event)"
            ondragleave="channelDragLeave(event)"
            ondrop="channelDrop(event,'${escAttr(ch.id)}')"
            onclick="toggleSelect('${escAttr(ch.id)}')">
            <div class="flex items-start gap-3 mb-3">
                <div class="custom-check ${sel ? 'checked' : ''}" onclick="event.stopPropagation();toggleSelect('${escAttr(ch.id)}')" style="margin-top:2px;"></div>
                ${logo}
                <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2">
                        <span class="text-sm font-semibold truncate">${escHtml(ch.name || 'Unbenannt')}</span>
                        ${radio ? '<i class="fa-solid fa-radio radio-icon flex-shrink-0" title="Radio"></i>' : ''}
                    </div>
                    ${ch.group ? `<span class="badge bg-accent-dim text-accent mt-1">${escHtml(ch.group)}</span>` : ''}
                </div>
            </div>
            <div class="text-[11px] text-gray-600 font-mono truncate mb-3">${escHtml(ch.url || 'Keine URL')}</div>
            <div class="flex items-center justify-between">
                <div class="flex gap-1">
                    ${ch.tvg.chno ? `<span class="text-[11px] font-mono bg-elevated px-2 py-0.5 rounded text-gray-400">Nr. ${escHtml(ch.tvg.chno)}</span>` : ''}
                </div>
                <div class="flex items-center gap-1">
                    <button class="btn btn-icon btn-ghost" style="width:26px;height:26px;padding:0;" title="Bearbeiten" onclick="event.stopPropagation();editChannel('${escAttr(ch.id)}')"><i class="fa-solid fa-pen text-[10px]"></i></button>
                    <button class="btn btn-icon btn-danger" style="width:26px;height:26px;padding:0;" title="Löschen" onclick="event.stopPropagation();deleteChannel('${escAttr(ch.id)}')"><i class="fa-solid fa-trash text-[10px]"></i></button>
                </div>
            </div>
        </div>`;
    }

    html += '</div>';
    container.innerHTML = html;
}

/* ========================================================
    TOOLBAR & FOOTER
    ======================================================== */
function renderToolbar() {
    const total = state.channels.length;
    const filtered = getFilteredChannels().length;
    let info = `${filtered} von ${total} Sendern`;

    if (state.selectedGroup === '__tv__') info += ' • TV-Sender';
    else if (state.selectedGroup === '__radio__') info += ' • Radio-Sender';
    else if (state.selectedGroup === '__ungrouped__') info += ' • Ohne Gruppe';
    else if (state.selectedGroup !== '__all__') info += ` • ${state.selectedGroup}`;

    if (state.searchQuery) info += ` • Suche: "${escHtml(state.searchQuery)}"`;

    document.getElementById('toolbarInfo').textContent = info;
}

function renderFooter() {
    const total = state.channels.length;
    const tvCount = state.channels.filter(c => !isRadio(c)).length;
    const radioCount = state.channels.filter(c => isRadio(c)).length;
    const groupCount = new Set(state.channels.map(c => c.group).filter(Boolean)).size;

    document.getElementById('footerStats').textContent =
        `${total} Sender • ${tvCount} TV • ${radioCount} Radio • ${groupCount} Gruppen`;
}

function updateBatchBar() {
    const bar = document.getElementById('batchBar');
    if (state.selectedIds.size > 0) {
        bar.classList.remove('hidden');
        bar.classList.add('flex');
        document.getElementById('batchCount').textContent = state.selectedIds.size + ' ausgewählt';

        // Gruppen-Dropdown aktualisieren
        const select = document.getElementById('batchGroup');
        const currentVal = select.value;
        select.innerHTML = '<option value="">Gruppe zuweisen...</option>';
        for (const g of getAllGroupNames()) {
            select.innerHTML += `<option value="${escAttr(g)}">${escHtml(g)}</option>`;
        }
        select.value = currentVal;
    } else {
        bar.classList.add('hidden');
        bar.classList.remove('flex');
    }
}

function updateEpgIndicator() {
    const dot = document.getElementById('epgDot');
    if (state.epgUrls.length > 0) dot.classList.remove('hidden');
    else dot.classList.add('hidden');
}
