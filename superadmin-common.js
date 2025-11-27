// Common Superadmin Functions
// This file should be included in all superadmin pages

// Toggle Superadmin Sidebar - Common function for all pages
function toggleSuperadminSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const dashboard = document.querySelector('.dashboard');
    
    if (sidebar && dashboard) {
        sidebar.classList.toggle('minimized');
        dashboard.classList.toggle('sidebar-minimized');
        
        // Save state globally for all superadmin pages
        localStorage.setItem('superadminSidebarMinimized', sidebar.classList.contains('minimized'));
    }
}

// Load sidebar state on page load - Common for all pages
function loadSuperadminSidebarState() {
    const isMinimized = localStorage.getItem('superadminSidebarMinimized') === 'true';
    if (isMinimized) {
        const sidebar = document.querySelector('.sidebar');
        const dashboard = document.querySelector('.dashboard');
        if (sidebar) sidebar.classList.add('minimized');
        if (dashboard) dashboard.classList.add('sidebar-minimized');
    }
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', function() {
    loadSuperadminSidebarState();
});

// Update all superadmin sidebars to have toggle button
function updateSuperadminSidebar() {
    const logo = document.querySelector('.sidebar .logo');
    if (logo && !logo.querySelector('button')) {
        // Add toggle button if not exists
        const toggleButton = document.createElement('button');
        toggleButton.onclick = toggleSuperadminSidebar;
        toggleButton.style.cssText = 'background: rgba(255,255,255,0.2); border: none; color: white; width: 35px; height: 35px; border-radius: 5px; cursor: pointer; display: flex; align-items: center; justify-content: center;';
        toggleButton.title = 'Toggle Sidebar';
        toggleButton.innerHTML = `
            <span style="display: flex; flex-direction: column; gap: 4px;">
                <span style="display: block; width: 18px; height: 2px; background: white; border-radius: 2px;"></span>
                <span style="display: block; width: 18px; height: 2px; background: white; border-radius: 2px;"></span>
                <span style="display: block; width: 18px; height: 2px; background: white; border-radius: 2px;"></span>
            </span>
        `;
        
        // Update logo structure
        logo.style.cssText = 'display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 1px solid rgba(255, 255, 255, 0.2);';
        
        const logoContent = logo.innerHTML;
        logo.innerHTML = `<div>${logoContent}</div>`;
        logo.appendChild(toggleButton);
    }
    
    // Update nav items for tooltips
    const navItems = document.querySelectorAll('.nav-menu .nav-item');
    navItems.forEach(item => {
        if (!item.querySelector('span')) {
            const text = item.textContent.trim();
            const icon = text.split(' ')[0];
            const label = text.substring(text.indexOf(' ') + 1);
            
            item.setAttribute('data-tooltip', label);
            item.innerHTML = `<span>${icon}</span> <span>${label}</span>`;
        }
    });
}

// Call update function when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    updateSuperadminSidebar();
    loadSuperadminSidebarState();
});