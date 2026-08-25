/* ========================================================
   FIX: SICHERE ESCAPE-FUNKTIONEN (XSS-SCHUTZ)
   ======================================================== */
function escHtml(str) {
    if (str === undefined || str === null) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function escAttr(str) {
    if (str === undefined || str === null) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;')
        .replace(/\\/g, '\\\\');
}

/* ========================================================
   FIX: SICHERE LOGO-FEHLER-BEHANDLUNG
   ======================================================== */
function handleLogoError(img, isRadioFlag) {
    const icon = isRadioFlag ? 'fa-radio radio-icon' : 'fa-tv';
    const size = img.classList.contains('w-14') ? 'w-14 h-14' : 'w-10 h-10';
    img.outerHTML = '<div class="logo-placeholder ' + size + '"><i class="fa-solid ' + icon + '"></i></div>';
}

/* ========================================================
   FIX: DEBOUNCED LOCALSTORAGE SPEICHERUNG
   ======================================================== */
let saveTimeout = null;
function saveToLocalStorage() {
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
        try {
            const data = {
                channels: state.channels,
                epgUrls: state.epgUrls,
                groupOrder: state.groupOrder,
                nextId: idCounter
            };
            localStorage.setItem('m3uEditorData', JSON.stringify(data));
        } catch (e) {
            console.warn('LocalStorage-Speicherung fehlgeschlagen:', e);
        }
    }, 500); // 500ms Debounce
}

function loadFromLocalStorage() {
    try {
        const raw = localStorage.getItem('m3uEditorData');
        if (raw) {
            const data = JSON.parse(raw);
            state.channels = data.channels || [];
            state.epgUrls = data.epgUrls || [];
            state.groupOrder = data.groupOrder || [];
            idCounter = data.nextId || 0;
        }
    } catch (e) {
        console.warn('LocalStorage-Laden fehlgeschlagen:', e);
    }
}
