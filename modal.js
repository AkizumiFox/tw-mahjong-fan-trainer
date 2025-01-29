/**
 * Opens the settings modal
 */
export function openModal() {
    document.getElementById('modalOverlay').classList.add('show');
}

/**
 * Closes the settings modal
 */
export function closeModal() {
    document.getElementById('modalOverlay').classList.remove('show');
}

/**
 * Saves the settings and generates a new hand
 * @param {Function} generateHand The function to generate a new hand
 */
export function saveSettings(generateHand) {
    generateHand();
    closeModal();
}

/**
 * Initializes modal event listeners
 * @param {Function} generateHand The function to generate a new hand
 */
export function initializeModal(generateHand) {
    // Make functions available globally for HTML onclick handlers
    window.openModal = openModal;
    window.closeModal = closeModal;
    window.saveSettings = () => saveSettings(generateHand);

    // Tab switching
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs and contents
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding content
            tab.classList.add('active');
            const tabId = tab.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
        });
    });

    // Close modal when clicking outside
    document.getElementById('modalOverlay').addEventListener('click', (e) => {
        if (e.target === document.getElementById('modalOverlay')) {
            closeModal();
        }
    });
} 