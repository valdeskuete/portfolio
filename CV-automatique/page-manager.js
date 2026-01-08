/**
 * Page Management Module for CV Generator
 * Handles page separation visualization, numbering, and page detection
 */

const PageManager = {
    pages: [],
    currentPageIndex: 0,
    pageHeight: 297, // mm
    pageWidth: 210, // mm
    
    /**
     * Add page breaks to HTML content while keeping it on one continuous display
     * This shows visual page separations without actually dividing content
     */
    renderWithPageBreaks(cvHtml) {
        const container = document.getElementById('cvPreviewContent');
        if (!container) return;
        
        // Just add the HTML as-is, no division
        container.innerHTML = cvHtml;
        container.className = 'cv-preview-content';
        
        // Add visual page breaks - approximate based on content height
        setTimeout(() => this.addPageBreakMarkers(), 50);
        
        // Update total pages based on actual height
        this.detectTotalPages();
    },
    
    /**
     * Add visual page break markers based on content height
     */
    addPageBreakMarkers() {
        const container = document.getElementById('cvPreviewContent');
        if (!container) return;
        
        // Get approximate height of one A4 page in pixels
        // A4 = 297mm at ~96 DPI = ~1122px
        const pageHeightPx = 1122;
        const contentHeight = container.scrollHeight;
        
        // Calculate pages needed
        window.totalPages = Math.max(1, Math.ceil(contentHeight / pageHeightPx));
        this.updatePageIndicator();
    },
    
    /**
     * Detect total pages from content height
     */
    detectTotalPages() {
        const container = document.getElementById('cvPreviewContent');
        if (!container) return;
        
        const pageHeightPx = 1122; // A4 at 96 DPI
        const contentHeight = container.scrollHeight;
        window.totalPages = Math.max(1, Math.ceil(contentHeight / pageHeightPx));
    },
    
    /**
     * Update page indicator in toolbar
     */
    updatePageIndicator() {
        const display = document.getElementById('currentPageDisplay');
        if (display) {
            display.textContent = `Page ${window.currentPage}/${window.totalPages}`;
        }
    },
    
    /**
     * Navigate to page (scroll based on page height)
     */
    goToPage(pageNum) {
        if (pageNum >= 1 && pageNum <= window.totalPages) {
            window.currentPage = pageNum;
            this.scrollToPage(pageNum);
            this.updatePageIndicator();
        }
    },
    
    /**
     * Scroll to specific page in preview
     */
    scrollToPage(pageNum) {
        const container = document.getElementById('cvPreviewContainer');
        if (!container) return;
        
        const pageHeightPx = 1122; // A4 at 96 DPI
        const scrollPosition = (pageNum - 1) * pageHeightPx;
        
        container.scrollTop = scrollPosition;
    }
};

// Expose to window
window.PageManager = PageManager;

