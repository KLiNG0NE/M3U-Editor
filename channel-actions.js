/* ========================================================
    KANAL-AKTIONEN
    ======================================================== */
function addChannel() {
    state.editChannelId = null;
    state.editRadio = false;

    // Modal-Felder zurücksetzen
    document.getElementById('editModalTitle').textContent = 'Neuer Sender';
    document.getElementById('editName').value = '';
    document.getElementById('editUrl').value = '';
    document.getElementById('editLogo').value = '';
    document.getElementById('editLogoPreview').classList.add('hidden');
    document.getElementById('editTvgId').value = '';
    document.getElementById('editTvgName').value = '';
    document.getElementById('editTvgLanguage').value = '';
    document.getElementById('editTvgCountry').value = '';
    document.getElementById('editTvgGenre').value = '';
    document.getElementById('editTvgChno').value = '';
    document.getElementById('editTvgShift').value = '';
    document.getElementById('editTvgUrl').value = '';
    document.getElementById('editTvgGuide').value = '';
    document.getElementById('editTvgSource').value = '';
    document.getElementById('editTvgRec').checked = false;
    document.getElementById('editNewGroup').classList.add('hidden');

    // Gruppen-Dropdown füllen
    updateGroupDropdown('');

    // Radio-Toggle zurücksetzen
    document.getElementById('radioToggle').classList.remove('on');
    document.getElementById('radioToggleLabel').textContent = 'TV-Sender';

    document.getElementById('editModal').classList.remove('hidden');
    document.getElementById('editModal').classList.add('flex');
    setTimeout(() => document.getElementById('editName').focus(), 100);
}

function editChannel(id) {
    const ch = state.channels.find(c => c.id === id);
    if (!ch) return;

    state.editChannelId = id;
    state.editRadio = isRadio(ch);

    document.getElementById('editModalTitle').textContent = 'Sender bearbeiten';
    document.getElementById('editName').value = ch.name || '';
    document.getElementById('editUrl').value = ch.url || '';
    document.getElementById('editLogo').value = ch.tvg.logo || '';
    document.getElementById('editTvgId').value = ch.tvg.id || '';
    document.getElementById('editTvgName').value = ch.tvg.name || '';
    document.getElementById('editTvgLanguage').value = ch.tvg.language || '';
    document.getElementById('editTvgCountry').value = ch.tvg.country || '';
    document.getElementById('editTvgGenre').value = ch.tvg.genre || '';
    document.getElementById('editTvgChno').value = ch.tvg.chno || '';
    document.getElementById('editTvgShift').value = ch.tvg.shift || '';
    document.getElementById('editTvgUrl').value = ch.tvg.url || '';
    document.getElementById('editTvgGuide').value = ch.tvg.guide || '';
    document.getElementById('editTvgSource').value = ch.tvg.source || '';
    document.getElementById('editTvgRec').checked = ch.tvg.rec === 'true' || ch.tvg.rec === true;
    document.getElementById('editNewGroup').classList.add('hidden');

    // Logo-Preview aktualisieren
    if (ch.tvg.logo) {
        document.getElementById('editLogoPreview').src = ch.tvg.logo;
        document.getElementById('editLogoPreview').classList.remove('hidden');
    } else {
        document.getElementById('editLogoPreview').classList.add('hidden');
    }

    // Gruppen-Dropdown füllen
    updateGroupDropdown(ch.group || '');

    // Radio-Toggle setzen
    if (isRadio(ch)) {
        document.getElementById('radioToggle').classList.add('on');
        document.getElementById('radioToggleLabel').textContent = 'Radio-Sender';
    } else {
        document.getElementById('radioToggle').classList.remove('on');
        document.getElementById('radioToggleLabel').textContent = 'TV-Sender';
    }

    document.getElementById('editModal').classList.remove('hidden');
    document.getElementById('editModal').classList.add('flex');
}

function updateGroupDropdown(selectedValue) {
    const select = document.getElementById('editGroup');
    select.innerHTML = '<option value="">-- keine Gruppe --</option>';

    // Option für "Neue Gruppe..." hinzufügen
    select.innerHTML += '<option value="__new__">+ Neue Gruppe...</option>';

    const groups = getAllGroupNames();
    for (const g of groups) {
        select.innerHTML += `<option value="${escAttr(g)}" ${g === selectedValue ? 'selected' : ''}>${escHtml(g)}</option>`;
    }

    if (selectedValue && !groups.includes(selectedValue)) {
        // Gruppe existiert nicht mehr - als Option hinzufügen
        select.innerHTML += `<option value="${escAttr(selectedValue)}" selected>${escHtml(selectedValue)}</option>`;
    }
}

function toggleNewGroupInput() {
    const select = document.getElementById('editGroup');
    const input = document.getElementById('editNewGroup');

    if (select.value === '__new__') {
        input.classList.remove('hidden');
        input.focus();
    } else {
        input.classList.add('hidden');
        input.value = '';
    }
}

function toggleRadioEdit() {
    state.editRadio = !state.editRadio;
    const toggle = document.getElementById('radioToggle');
    const label = document.getElementById('radioToggleLabel');

    if (state.editRadio) {
        toggle.classList.add('on');
        label.textContent = 'Radio-Sender';
    } else {
        toggle.classList.remove('on');
        label.textContent = 'TV-Sender';
    }
}

function updateLogoPreview() {
    const url = document.getElementById('editLogo').value.trim();
    const preview = document.getElementById('editLogoPreview');

    if (url) {
        preview.src = url;
        preview.classList.remove('hidden');
        preview.onerror = function() {
            this.classList.add('hidden');
        };
    } else {
        preview.classList.add('hidden');
    }
}

function saveChannel() {
    const name = document.getElementById('editName').value.trim();
    const url = document.getElementById('editUrl').value.trim();

    if (!name) {
        showToast('Bitte einen Sendernamen eingeben', 'error');
        return;
    }

    if (!url) {
        showToast('Bitte eine Stream-URL eingeben', 'error');
        return;
    }

    // Gruppe ermitteln
    let group = '';
    const groupSelect = document.getElementById('editGroup');
    const groupInput = document.getElementById('editNewGroup');

    if (groupSelect.value === '__new__' && !groupInput.classList.contains('hidden')) {
        group = groupInput.value.trim();
        if (group && !state.groupOrder.includes(group)) {
            state.groupOrder.push(group);
        }
    } else {
        group = groupSelect.value;
    }

    const channelData = {
        name: name,
        url: url,
        radio: state.editRadio,
        group: group,
        tvg: {
            id: document.getElementById('editTvgId').value.trim(),
            name: document.getElementById('editTvgName').value.trim(),
            logo: document.getElementById('editLogo').value.trim(),
            language: document.getElementById('editTvgLanguage').value.trim(),
            country: document.getElementById('editTvgCountry').value.trim(),
            genre: document.getElementById('editTvgGenre').value.trim(),
            chno: document.getElementById('editTvgChno').value.trim(),
            shift: document.getElementById('editTvgShift').value.trim(),
            url: document.getElementById('editTvgUrl').value.trim(),
            guide: document.getElementById('editTvgGuide').value.trim(),
            source: document.getElementById('editTvgSource').value.trim(),
            rec: document.getElementById('editTvgRec').checked ? 'true' : ''
        }
    };

    if (state.editChannelId) {
        // Bestehenden Kanal aktualisieren
        const idx = state.channels.findIndex(c => c.id === state.editChannelId);
        if (idx !== -1) {
            state.channels[idx] = { ...state.channels[idx], ...channelData };
        }
        showToast('Sender aktualisiert', 'success');
    } else {
        // Neuen Kanal hinzufügen
        const newChannel = { id: genId(), ...channelData };
        state.channels.push(newChannel);
        showToast('Sender hinzugefügt', 'success');
    }

    closeEditModal();
    render();
}

function closeEditModal() {
    document.getElementById('editModal').classList.add('hidden');
    document.getElementById('editModal').classList.remove('flex');
    state.editChannelId = null;
}

function deleteChannel(id) {
    const ch = state.channels.find(c => c.id === id);
    if (!ch) return;

    showConfirm(
        'Sender löschen',
        `Möchtest du "${escHtml(ch.name)}" wirklich löschen?`,
        null,
        () => {
            state.channels = state.channels.filter(c => c.id !== id);
            state.selectedIds.delete(id);
            render();
            showToast('Sender gelöscht', 'success');
        }
    );
}

function duplicateChannel(id) {
    const ch = state.channels.find(c => c.id === id);
    if (!ch) return;

    const copy = { ...JSON.parse(JSON.stringify(ch)), id: genId(), name: ch.name + ' (Kopie)' };
    const idx = state.channels.findIndex(c => c.id === id);
    state.channels.splice(idx + 1, 0, copy);
    render();
    showToast('Sender dupliziert', 'success');
}

function moveChannel(id, direction) {
    const idx = state.channels.findIndex(c => c.id === id);
    if (idx === -1) return;

    const newIdx = idx + direction;
    if (newIdx < 0 || newIdx >= state.channels.length) return;

    const channel = state.channels[idx];
    state.channels.splice(idx, 1);
    state.channels.splice(newIdx, 0, channel);

    // Kanal im Viewport scrollen
    setTimeout(() => {
        const el = document.querySelector(`[data-id="${id}"]`);
        if (el) el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }, 50);

    render();
}

function toggleSelect(id) {
    if (state.selectedIds.has(id)) {
        state.selectedIds.delete(id);
    } else {
        state.selectedIds.add(id);
    }
    updateBatchBar();
    // Nur die betroffene Zeile/Karte aktualisieren (Performance-Optimierung)
    const el = document.querySelector(`[data-id="${id}"]`);
    if (el) {
        const isChecked = state.selectedIds.has(id);
        el.classList.toggle('selected', isChecked);
        const check = el.querySelector('.custom-check');
        if (check) check.classList.toggle('checked', isChecked);
    }
}

function toggleSelectAll() {
    const list = getFilteredChannels();
    if (state.selectedIds.size === list.length) {
        state.selectedIds.clear();
    } else {
        state.selectedIds = new Set(list.map(c => c.id));
    }
    render();
}
