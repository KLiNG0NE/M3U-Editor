/* ========================================================
    TASTATUR-KÜRZEL
    ======================================================== */
document.addEventListener('keydown', function(e) {
    // Nur wenn kein Modal offen und kein Input fokussiert
    const isInputFocused = document.activeElement.tagName === 'INPUT' ||
                           document.activeElement.tagName === 'TEXTAREA' ||
                           document.activeElement.tagName === 'SELECT';
    const isModalOpen = !document.getElementById('confirmModal').classList.contains('hidden') ||
                       !document.getElementById('editModal').classList.contains('hidden') ||
                       !document.getElementById('groupModal').classList.contains('hidden') ||
                       !document.getElementById('urlModal').classList.contains('hidden') ||
                       !document.getElementById('epgModal').classList.contains('hidden');

    if (isInputFocused || isModalOpen) return;

    if (e.ctrlKey && e.key === 'n') {
        e.preventDefault();
        addChannel();
    } else if (e.ctrlKey && e.key === 'o') {
        e.preventDefault();
        importFile();
    } else if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        exportFile();
    } else if (e.key === 'Escape') {
        closeConfirm();
        closeEditModal();
        closeGroupModal();
        closeUrlModal();
        closeEpgModal();
    } else if (e.key === 'Delete' && state.selectedIds.size > 0) {
        e.preventDefault();
        batchDelete();
    }
});
