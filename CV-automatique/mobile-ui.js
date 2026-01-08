/**
 * Mobile UI Improvements
 * Gère les modals, les overlays et les interactions mobiles
 */

// ===== MODAL MANAGEMENT =====
const MobileUI = {
    tabModals: {},
    currentTab: 'content',
    
    init() {
        this.setupTabModals();
        this.setupSidebarToggle();
        this.setupTabNavigation();
        this.setupAutoPreview();
        this.setupPageIndicator();
    },

    /**
     * Setup tab modals for mobile
     */
    setupTabModals() {
        const tabPanels = document.querySelectorAll('.tab-panel');
        tabPanels.forEach(panel => {
            const tabName = panel.id.replace('tab-', '');
            this.tabModals[tabName] = panel;

            // Add close button if not present
            if (!panel.querySelector('.tab-panel-close')) {
                const closeBtn = document.createElement('button');
                closeBtn.className = 'tab-panel-close';
                closeBtn.innerHTML = '<i class="fas fa-times"></i>';
                closeBtn.onclick = (e) => {
                    e.stopPropagation();
                    this.closeModal();
                };
                panel.prepend(closeBtn);
            }
        });
    },

    /**
     * Open modal for a specific tab
     */
    openModal(tabName) {
        // Mobile only
        if (window.innerWidth > 767) return;

        this.currentTab = tabName;
        document.body.classList.add('modal-open');

        // Close all tabs
        Object.values(this.tabModals).forEach(panel => {
            panel.classList.remove('active');
        });

        // Open requested tab
        if (this.tabModals[tabName]) {
            this.tabModals[tabName].classList.add('active');
        }
    },

    /**
     * Close modal
     */
    closeModal() {
        document.body.classList.remove('modal-open');
        Object.values(this.tabModals).forEach(panel => {
            panel.classList.remove('active');
        });
    },

    /**
     * Setup sidebar toggle for mobile
     */
    setupSidebarToggle() {
        const toggle = document.getElementById('sidebarToggle');
        const sidebar = document.getElementById('editorSidebar');
        const backdrop = document.createElement('div');
        backdrop.className = 'modal-backdrop';

        if (!document.body.contains(backdrop)) {
            document.body.appendChild(backdrop);
        }

        if (toggle) {
            toggle.addEventListener('click', () => {
                sidebar.classList.toggle('open');
                backdrop.classList.toggle('active');
            });
        }

        backdrop.addEventListener('click', () => {
            sidebar.classList.remove('open');
            backdrop.classList.remove('active');
        });

        // Close sidebar on navigation button click
        const navButtons = document.querySelectorAll('.nav-btn');
        navButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                if (window.innerWidth <= 767) {
                    sidebar.classList.remove('open');
                    backdrop.classList.remove('active');
                }
            });
        });
    },

    /**
     * Setup tab navigation
     */
    setupTabNavigation() {
        const navButtons = document.querySelectorAll('.nav-btn');
        navButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tabName = btn.dataset.tab;
                
                // Update active button
                navButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                if (window.innerWidth <= 767) {
                    // Mobile: Open as modal
                    this.openModal(tabName);
                } else {
                    // Desktop: Show inline
                    const panels = document.querySelectorAll('.tab-panel');
                    panels.forEach(p => p.classList.remove('active'));
                    document.getElementById(`tab-${tabName}`)?.classList.add('active');
                }
            });
        });
    },

    /**
     * Setup auto-preview on input changes
     */
    setupAutoPreview() {
        // Re-render preview on any input change
        document.addEventListener('input', (e) => {
            if (e.target.matches('input, textarea, select')) {
                // Debounce to avoid too many updates
                clearTimeout(this.previewTimeout);
                this.previewTimeout = setTimeout(() => {
                    if (window.updatePreview) {
                        window.updatePreview();
                    }
                }, 100);
            }
        });

        // Also update on change events for selects
        document.addEventListener('change', (e) => {
            if (e.target.matches('select')) {
                if (window.updatePreview) {
                    window.updatePreview();
                }
            }
        });
    },

    /**
     * Update page indicator
     */
    setupPageIndicator() {
        // Update when page changes
        this.updatePageDisplay();
    },

    updatePageDisplay() {
        const display = document.getElementById('currentPageDisplay');
        if (display && window.currentPage !== undefined && window.totalPages !== undefined) {
            display.textContent = `Page ${window.currentPage}/${window.totalPages}`;
        }

        const zoomDisplay = document.getElementById('zoomLevelDisplay');
        if (zoomDisplay && window.zoomLevel !== undefined) {
            zoomDisplay.textContent = `${window.zoomLevel}%`;
        }
    }
};

// ===== INITIALIZE ON DOM READY =====
document.addEventListener('DOMContentLoaded', () => {
    MobileUI.init();
});

// ===== WINDOW RESIZE HANDLER =====
window.addEventListener('resize', () => {
    // Reset modals on resize
    if (window.innerWidth > 767) {
        MobileUI.closeModal();
    }
});

// ===== EXPOSE TO WINDOW FOR COMPATIBILITY =====
window.MobileUI = MobileUI;
