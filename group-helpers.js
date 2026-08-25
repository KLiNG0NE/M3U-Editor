/* ========================================================
    GRUPPEN HILFSFUNKTIONEN
    ======================================================== */
function getGroupMap() {
    const m = new Map();
    for(const c of state.channels){ const g = c.group || ''; m.set(g, (m.get(g) || 0) + 1); }
    return m;
}

function getSortedGroups() {
    const m = getGroupMap(), o = [], s = new Set();
    for(const g of state.groupOrder){
        if(g && !s.has(g)) { o.push(g); s.add(g); }
    }
    return [...o, ...[...m.keys()].filter(g => g && !s.has(g)).sort((a,b) => a.localeCompare(b))];
}

function getAllGroupNames() {
    const names = new Set(state.channels.map(c => c.group).filter(Boolean));
    state.groupOrder.forEach(g => { if(g) names.add(g); });
    return [...names].sort((a,b) => a.localeCompare(b));
}

function getFilteredChannels() {
    let list = [...state.channels];
    if (state.selectedGroup === '__tv__') list = list.filter(c => !isRadio(c));
    else if (state.selectedGroup === '__radio__') list = list.filter(c => isRadio(c));
    else if (state.selectedGroup === '__ungrouped__') list = list.filter(c => !c.group);
    else if (state.selectedGroup !== '__all__') list = list.filter(c => c.group === state.selectedGroup);

    if (state.searchQuery) {
        const q = state.searchQuery.toLowerCase();
        list = list.filter(c =>
            (c.name && c.name.toLowerCase().includes(q)) ||
            (c.group && c.group.toLowerCase().includes(q)) ||
            (c.tvg.id && c.tvg.id.toLowerCase().includes(q)) ||
            (c.url && c.url.toLowerCase().includes(q))
        );
    }

    switch(state.sortOrder) {
        case 'name-asc': list.sort((a,b) => a.name.localeCompare(b.name)); break;
        case 'name-desc': list.sort((a,b) => b.name.localeCompare(a.name)); break;
        case 'chno-asc': list.sort((a,b) => (parseFloat(a.tvg.chno) || 0) - (parseFloat(b.tvg.chno) || 0)); break;
        case 'chno-desc': list.sort((a,b) => (parseFloat(b.tvg.chno) || 0) - (parseFloat(a.tvg.chno) || 0)); break;
    }
    return list;
}
