/* ========================================================
    INITIALISIERUNG
    ======================================================== */
document.addEventListener('DOMContentLoaded', function() {
    // FIX: Daten aus localStorage laden
    loadFromLocalStorage();

    // Erste Render-Ausführung
    render();

    // FIX P0: Konsistente Drag & Drop Handler für statische Sidebar-Elemente via addEventListener
    const staticSidebarGroups = ['__all__', '__tv__', '__radio__', '__ungrouped__'];
    staticSidebarGroups.forEach(g => {
        const el = document.querySelector(`[data-group="${g}"]`);
        if (el) {
            el.addEventListener('dragover', sidebarGroupDragOver);
            el.addEventListener('dragleave', sidebarGroupDragLeave);
            el.addEventListener('drop', (e) => sidebarGroupDrop(e, g));
        }
    });

    // Willkommens-Toast wenn leer
    if (state.channels.length === 0) {
        setTimeout(() => {
            showToast('Willkommen! Ziehe eine M3U-Datei hierher oder klicke auf "Import"', 'info', 5000);
        }, 500);
    }
});
