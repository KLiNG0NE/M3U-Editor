/* ========================================================
   TAILWIND KONFIGURATION
   ======================================================== */
tailwind.config = {
    theme: {
        extend: {
            colors: {
                bg: '#0f0f0f',
                surface: '#181818',
                card: '#222222',
                elevated: '#2c2c2c',
                border: '#333333',
                'border-light': '#444444',
                accent: '#f59e0b',
                'accent-hover': '#d97706',
                'accent-dim': 'rgba(245,158,11,0.12)',
                danger: '#ef4444',
                'danger-dim': 'rgba(239,68,68,0.12)',
                success: '#22c55e',
                'success-dim': 'rgba(34,197,94,0.12)',
                radio: '#06b6d4',
                'radio-dim': 'rgba(6,182,212,0.12)',
            },
            fontFamily: {
                display: ['Outfit', 'sans-serif'],
                mono: ['JetBrains Mono', 'monospace'],
            }
        }
    }
}

/* ========================================================
   ZUSTAND
   ======================================================== */
const state = {
    channels: [], epgUrls: [],
    selectedGroup: '__all__', searchQuery: '',
    selectedIds: new Set(), sortOrder: 'default', viewMode: 'table',
    editChannelId: null, editRadio: false,
    editGroupMode: 'create', editGroupOldName: '',
    groupOrder: [], dragSrcId: null,
    pendingConfirmAction: null,
};

let idCounter = 0;
function genId() { return 'ch_' + (++idCounter) + '_' + Date.now(); }

// FIX: Vereinfachte isRadio-Funktion - nur Boolean-Check nötig
function isRadio(ch) { return ch.radio === true; }
