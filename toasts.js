/* ========================================================
    TOAST-NOTIFICATIONS
    ======================================================== */
function showToast(message, type = 'info', duration = 3000) {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');

    const bgColor = type === 'success' ? 'bg-success-dim border-success' :
                   type === 'error' ? 'bg-danger-dim border-danger' :
                   'bg-accent-dim border-accent';
    const textColor = type === 'success' ? 'text-success' :
                     type === 'error' ? 'text-danger' : 'text-accent';
    const icon = type === 'success' ? 'fa-circle-check' :
                type === 'error' ? 'fa-circle-exclamation' : 'fa-circle-info';

    toast.className = `toast-enter flex items-center gap-3 px-4 py-3 rounded-xl border ${bgColor} backdrop-blur-md`;
    toast.innerHTML = `
        <i class="fa-solid ${icon} ${textColor}"></i>
        <span class="text-sm ${textColor}">${escHtml(message)}</span>
    `;

    container.appendChild(toast);

    // Auto-Remove
    setTimeout(() => {
        toast.classList.remove('toast-enter');
        toast.classList.add('toast-exit');
        setTimeout(() => toast.remove(), 300);
    }, duration);

    // Click to dismiss
    toast.addEventListener('click', () => {
        toast.classList.remove('toast-enter');
        toast.classList.add('toast-exit');
        setTimeout(() => toast.remove(), 300);
    });
}
