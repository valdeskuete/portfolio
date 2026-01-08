/**
 * Page Management Module for CV Generator
 * Handles page separation, numbering, and overflow
 */

const PageManager = {
    pages: [],
    currentPageIndex: 0,
    pageHeight: 297, // mm
    pageWidth: 210, // mm
    contentPerPage: [],
    
    /**
     * Render CV with visible page separations
     */
    renderWithPageBreaks(cvHtml) {
        // Create pages container
        const container = document.getElementById('cvPreviewContent');
        if (!container) return;
        
        // Split content into pages
        const pages = this.splitIntoPages(cvHtml);
        
        // Clear and rebuild
        container.innerHTML = '';
        container.className = 'cv-pages-container';
        
        pages.forEach((pageContent, index) => {
            const pageDiv = document.createElement('div');
            pageDiv.className = 'cv-page';
            pageDiv.setAttribute('data-page', `${index + 1}/${pages.length}`);
            
            pageDiv.innerHTML = `
                <div class="cv-page-content">
                    ${pageContent}
                </div>
                <div class="page-break-indicator">--- Page Break ---</div>
            `;
            
            container.appendChild(pageDiv);
        });
        
        // Update page count
        window.totalPages = pages.length;
        this.updatePageIndicator();
    },
    
    /**
     * Split HTML content into pages based on height
     */
    splitIntoPages(htmlContent) {
        const pages = [];
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlContent;
        tempDiv.style.cssText = 'position: absolute; visibility: hidden; width: 210mm; font-size: 11px; padding: 1.5cm; line-height: 1.4;';
        document.body.appendChild(tempDiv);
        
        // Approximate page height in pixels (A4: 297mm ≈ 1122px at 96dpi)
        const pageHeightPx = 1122;
        let currentPage = '';
        let currentHeight = 0;
        let elementBuffer = '';
        
        // Get all content elements
        const elements = tempDiv.querySelectorAll('.cv-section, .cv-item, p, h2, h3');
        
        elements.forEach((element) => {
            const elementHeight = element.offsetHeight + 20; // Add padding
            
            // If adding this element exceeds page height, start new page
            if (currentHeight + elementHeight > pageHeightPx && currentPage.length > 0) {
                pages.push(currentPage.trim());
                currentPage = '';
                currentHeight = 0;
            }
            
            currentPage += element.outerHTML;
            currentHeight += elementHeight;
        });
        
        // Add remaining content
        if (currentPage.trim()) {
            pages.push(currentPage.trim());
        }
        
        document.body.removeChild(tempDiv);
        
        // Return at least 1 page
        return pages.length > 0 ? pages : [htmlContent];
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
     * Navigate to page
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
        const pages = document.querySelectorAll('.cv-page');
        if (pages[pageNum - 1]) {
            pages[pageNum - 1].scrollIntoView({ behavior: 'smooth' });
        }
    }
};

// Expose to window
window.PageManager = PageManager;
