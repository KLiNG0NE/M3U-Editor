/* ========================================================
   BESTÄTIGUNGS-MODAL
   ======================================================== */
function showConfirm(title, message, details, onConfirm) {
    document.getElementById('confirmTitle').textContent = title;
    document.getElementById('confirmMessage').textContent = message;

    const detailsEl = document.getElementById('confirmDetails');
    if (details) {
        detailsEl.innerHTML = details;
        detailsEl.classList.remove('hidden');
    } else {
        detailsEl.innerHTML = '';
        detailsEl.classList.add('hidden');
    }

    state.pendingConfirmAction = onConfirm;
    document.getElementById('confirmOk').onclick = () => {
        const actionToExecute = state.pendingConfirmAction;
        closeConfirm();
        if (actionToExecute) actionToExecute();
    };

    document.getElementById('confirmModal').classList.remove('hidden');
    document.getElementById('confirmModal').classList.add('flex');
    setTimeout(() => document.getElementById('confirmCancel').focus(), 100);
}

function closeConfirm() {
    document.getElementById('confirmModal').classList.add('hidden');
    document.getElementById('confirmModal').classList.remove('flex');
    state.pendingConfirmAction = null;
}
