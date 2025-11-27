// Get user ID from URL
const urlParams = new URLSearchParams(window.location.search);
const userId = parseInt(urlParams.get('id'));

// Load user data
function loadUserProfile() {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users[userId];
    
    if (!user) {
        alert('User not found!');
        window.location.href = 'user-list.html';
        return;
    }
    
    // Display user info
    document.getElementById('userName').textContent = user.username;
    document.getElementById('userContact').textContent = user.mobile || user.email || 'No contact';
    document.getElementById('userLicense').textContent = (user.licenseType || 'monthly').toUpperCase();
    
    // Display profile picture or initial
    const avatarDiv = document.getElementById('userAvatar');
    if (user.profilePicture) {
        avatarDiv.innerHTML = `<img src="${user.profilePicture}" alt="Profile Picture">`;
    } else {
        avatarDiv.textContent = user.username.charAt(0).toUpperCase();
    }
    
    if (user.expiryDate) {
        const expiryDate = new Date(user.expiryDate);
        const daysLeft = Math.ceil((expiryDate - new Date()) / (1000 * 60 * 60 * 24));
        
        if (daysLeft < 0) {
            document.getElementById('userStatus').textContent = 'Expired';
            document.getElementById('userStatus').className = 'status-badge status-expired';
        } else if (daysLeft <= 7) {
            document.getElementById('userStatus').textContent = 'Expiring Soon';
            document.getElementById('userStatus').className = 'status-badge status-expiring';
        } else {
            document.getElementById('userStatus').textContent = 'Active';
            document.getElementById('userStatus').className = 'status-badge status-active';
        }
        
        document.getElementById('userExpiry').textContent = expiryDate.toLocaleDateString();
    }
    
    // Load business data
    loadBusinessData(user);
}

function loadBusinessData(user) {
    // Get or create business data for user
    let businessData = JSON.parse(localStorage.getItem(`business_${userId}`)) || generateSampleData();
    
    // Store for modal access
    currentBusinessData = businessData;
    
    // Display stats
    document.getElementById('totalRevenue').textContent = `Rs. ${businessData.revenue.toLocaleString()}`;
    document.getElementById('shopBudget').textContent = `Rs. ${businessData.budget.toLocaleString()}`;
    document.getElementById('totalSales').textContent = businessData.sales.length;
    document.getElementById('totalPurchases').textContent = businessData.purchases.length;
    document.getElementById('totalItems').textContent = businessData.inventory.length;
    
    // Load tables
    loadSales(businessData.sales);
    loadPurchases(businessData.purchases);
    loadProducts(businessData.products);
    loadInventory(businessData.inventory);
    
    // Save data
    localStorage.setItem(`business_${userId}`, JSON.stringify(businessData));
}

function generateSampleData() {
    return {
        revenue: Math.floor(Math.random() * 500000) + 100000,
        budget: Math.floor(Math.random() * 300000) + 50000,
        sales: [
            { date: '2024-11-25', product: 'Laptop', quantity: 2, price: 45000, customer: 'Ali Khan' },
            { date: '2024-11-24', product: 'Mouse', quantity: 5, price: 800, customer: 'Sara Ahmed' },
            { date: '2024-11-23', product: 'Keyboard', quantity: 3, price: 1500, customer: 'Ahmed Raza' },
            { date: '2024-11-22', product: 'Monitor', quantity: 1, price: 25000, customer: 'Fatima Ali' },
            { date: '2024-11-21', product: 'USB Cable', quantity: 10, price: 200, customer: 'Hassan Shah' }
        ],
        purchases: [
            { date: '2024-11-20', product: 'Laptop', quantity: 5, cost: 40000, supplier: 'Tech Suppliers' },
            { date: '2024-11-19', product: 'Mouse', quantity: 20, cost: 600, supplier: 'Electronics Hub' },
            { date: '2024-11-18', product: 'Keyboard', quantity: 15, cost: 1200, supplier: 'Tech Suppliers' },
            { date: '2024-11-17', product: 'Monitor', quantity: 3, cost: 22000, supplier: 'Display World' },
            { date: '2024-11-16', product: 'USB Cable', quantity: 50, cost: 150, supplier: 'Cable Store' }
        ],
        products: [
            { name: 'Laptop', category: 'Electronics', price: 45000, icon: '💻' },
            { name: 'Mouse', category: 'Accessories', price: 800, icon: '🖱️' },
            { name: 'Keyboard', category: 'Accessories', price: 1500, icon: '⌨️' },
            { name: 'Monitor', category: 'Electronics', price: 25000, icon: '🖥️' },
            { name: 'USB Cable', category: 'Accessories', price: 200, icon: '🔌' },
            { name: 'Headphones', category: 'Audio', price: 3500, icon: '🎧' }
        ],
        inventory: [
            { product: 'Laptop', category: 'Electronics', stock: 8, unitPrice: 45000, status: 'in' },
            { product: 'Mouse', category: 'Accessories', stock: 25, unitPrice: 800, status: 'in' },
            { product: 'Keyboard', category: 'Accessories', stock: 18, unitPrice: 1500, status: 'in' },
            { product: 'Monitor', category: 'Electronics', stock: 4, unitPrice: 25000, status: 'low' },
            { product: 'USB Cable', category: 'Accessories', stock: 45, unitPrice: 200, status: 'in' },
            { product: 'Headphones', category: 'Audio', stock: 0, unitPrice: 3500, status: 'out' }
        ]
    };
}

function loadSales(sales) {
    const tbody = document.getElementById('salesTableBody');
    tbody.innerHTML = '';
    
    sales.forEach(sale => {
        const total = sale.quantity * sale.price;
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${sale.date}</td>
            <td><strong>${sale.product}</strong></td>
            <td>${sale.quantity}</td>
            <td>Rs. ${sale.price.toLocaleString()}</td>
            <td><strong>Rs. ${total.toLocaleString()}</strong></td>
            <td>${sale.customer}</td>
        `;
        tbody.appendChild(tr);
    });
}

function loadPurchases(purchases) {
    const tbody = document.getElementById('purchasesTableBody');
    tbody.innerHTML = '';
    
    purchases.forEach(purchase => {
        const total = purchase.quantity * purchase.cost;
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${purchase.date}</td>
            <td><strong>${purchase.product}</strong></td>
            <td>${purchase.quantity}</td>
            <td>Rs. ${purchase.cost.toLocaleString()}</td>
            <td><strong>Rs. ${total.toLocaleString()}</strong></td>
            <td>${purchase.supplier}</td>
        `;
        tbody.appendChild(tr);
    });
}

function loadProducts(products) {
    const grid = document.getElementById('productsGrid');
    grid.innerHTML = '';
    
    products.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <div class="product-icon">${product.icon}</div>
            <h4>${product.name}</h4>
            <p>${product.category}</p>
            <div class="product-price">Rs. ${product.price.toLocaleString()}</div>
        `;
        grid.appendChild(card);
    });
}

function loadInventory(inventory) {
    const tbody = document.getElementById('inventoryTableBody');
    tbody.innerHTML = '';
    
    inventory.forEach(item => {
        const totalValue = item.stock * item.unitPrice;
        const statusClass = item.status === 'in' ? 'stock-in' : item.status === 'low' ? 'stock-low' : 'stock-out';
        const statusText = item.status === 'in' ? 'In Stock' : item.status === 'low' ? 'Low Stock' : 'Out of Stock';
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${item.product}</strong></td>
            <td>${item.category}</td>
            <td>${item.stock}</td>
            <td>Rs. ${item.unitPrice.toLocaleString()}</td>
            <td><strong>Rs. ${totalValue.toLocaleString()}</strong></td>
            <td><span class="stock-badge ${statusClass}">${statusText}</span></td>
        `;
        tbody.appendChild(tr);
    });
}

function showTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab
    document.getElementById(tabName).classList.add('active');
    event.target.classList.add('active');
}

// Handle profile picture upload
document.getElementById('profilePicInput').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
        alert('File size should be less than 2MB');
        return;
    }
    
    // Check file type
    if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(event) {
        const imageData = event.target.result;
        
        // Update user's profile picture
        const users = JSON.parse(localStorage.getItem('users')) || [];
        if (users[userId]) {
            users[userId].profilePicture = imageData;
            localStorage.setItem('users', JSON.stringify(users));
            
            // Update display
            document.getElementById('userAvatar').innerHTML = `<img src="${imageData}" alt="Profile Picture">`;
            alert('Profile picture updated successfully!');
        }
    };
    
    reader.readAsDataURL(file);
});

function updateFeature(featureName) {
    const checkbox = document.getElementById(`feature-${featureName}`);
    const users = JSON.parse(localStorage.getItem('users')) || [];
    
    if (!users[userId]) return;
    
    // Initialize features object if not exists
    if (!users[userId].features) {
        users[userId].features = {};
    }
    
    // Update feature
    users[userId].features[featureName] = checkbox.checked;
    
    // Save to localStorage
    localStorage.setItem('users', JSON.stringify(users));
    
    console.log(`Feature ${featureName} is now ${checkbox.checked ? 'enabled' : 'disabled'}`);
}

function updateAccountSetting(settingName) {
    const checkbox = document.getElementById(`setting-${settingName}`);
    console.log(`Setting ${settingName} is now ${checkbox.checked ? 'enabled' : 'disabled'}`);
}

function saveAllSettings() {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    
    if (!users[userId]) {
        alert('User not found!');
        return;
    }
    
    // Collect all feature settings
    const features = {
        sales: document.getElementById('feature-sales').checked,
        purchases: document.getElementById('feature-purchases').checked,
        inventory: document.getElementById('feature-inventory').checked,
        reports: document.getElementById('feature-reports').checked,
        customers: document.getElementById('feature-customers').checked,
        multistore: document.getElementById('feature-multistore').checked,
        financial: document.getElementById('feature-financial').checked,
        notifications: document.getElementById('feature-notifications').checked
    };
    
    // Collect account settings
    const accountSettings = {
        active: document.getElementById('setting-active').checked,
        api: document.getElementById('setting-api').checked,
        export: document.getElementById('setting-export').checked
    };
    
    // Update user
    users[userId].features = features;
    users[userId].accountSettings = accountSettings;
    
    localStorage.setItem('users', JSON.stringify(users));
    
    alert('Settings saved successfully!');
}

function loadUserSettings() {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users[userId];
    
    if (!user) return;
    
    // Load features (default all enabled except export)
    const features = user.features || {
        sales: true,
        purchases: true,
        inventory: true,
        reports: true,
        customers: true,
        multistore: false,
        financial: true,
        notifications: true,
        export: false
    };
    
    // Show/hide export button based on feature
    const exportBtn = document.getElementById('exportButtonContainer');
    if (exportBtn) {
        exportBtn.style.display = features.export ? 'block' : 'none';
    }
    
    Object.keys(features).forEach(feature => {
        const checkbox = document.getElementById(`feature-${feature}`);
        if (checkbox) checkbox.checked = features[feature];
    });
    
    // Load account settings (default all enabled)
    const accountSettings = user.accountSettings || {
        active: true,
        api: false,
        export: true
    };
    
    Object.keys(accountSettings).forEach(setting => {
        const checkbox = document.getElementById(`setting-${setting}`);
        if (checkbox) checkbox.checked = accountSettings[setting];
    });
}

function showFeaturesModal() {
    document.getElementById('featuresModal').classList.add('active');
    loadModalFeatures();
}

function closeFeaturesModal() {
    // Ask for confirmation if there are unsaved changes
    const saveBtn = document.getElementById('floatingSaveBtn');
    if (saveBtn && saveBtn.classList.contains('show')) {
        if (!confirm('You have unsaved changes. Are you sure you want to close without saving?')) {
            return;
        }
    }
    
    // Hide floating save button
    if (saveBtn) {
        saveBtn.classList.remove('show');
        setTimeout(() => {
            saveBtn.remove();
        }, 300);
    }
    
    // Reload original features (revert changes)
    loadModalFeatures();
    
    // Close modal
    document.getElementById('featuresModal').classList.remove('active');
}

function loadModalFeatures() {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users[userId];
    
    if (!user) return;
    
    // Load features (default all enabled)
    const features = user.features || {
        sales: true,
        purchases: true,
        inventory: true,
        reports: true,
        customers: true,
        multistore: false,
        financial: true,
        notifications: true
    };
    
    Object.keys(features).forEach(feature => {
        const checkbox = document.getElementById(`modal-feature-${feature}`);
        if (checkbox) checkbox.checked = features[feature];
    });
}

function quickUpdateFeature(featureName) {
    // Show floating save button when any feature is toggled
    showFloatingSaveButton();
    console.log(`Feature ${featureName} toggled`);
}

function showFloatingSaveButton() {
    let saveBtn = document.getElementById('floatingSaveBtn');
    
    if (!saveBtn) {
        // Create floating save button if it doesn't exist
        saveBtn = document.createElement('div');
        saveBtn.id = 'floatingSaveBtn';
        saveBtn.className = 'floating-save-button';
        saveBtn.innerHTML = `
            <button onclick="saveQuickFeatures()" class="btn-save-float">
                💾 Save Changes
            </button>
        `;
        document.body.appendChild(saveBtn);
    }
    
    // Show with animation
    setTimeout(() => {
        saveBtn.classList.add('show');
    }, 10);
}

function saveQuickFeatures() {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    
    if (!users[userId]) {
        alert('User not found!');
        return;
    }
    
    // Collect all feature settings from modal
    const features = {
        sales: document.getElementById('modal-feature-sales').checked,
        purchases: document.getElementById('modal-feature-purchases').checked,
        inventory: document.getElementById('modal-feature-inventory').checked,
        reports: document.getElementById('modal-feature-reports').checked,
        customers: document.getElementById('modal-feature-customers').checked,
        multistore: document.getElementById('modal-feature-multistore').checked,
        financial: document.getElementById('modal-feature-financial').checked,
        notifications: document.getElementById('modal-feature-notifications').checked,
        export: document.getElementById('modal-feature-export').checked
    };
    
    // Update user
    users[userId].features = features;
    localStorage.setItem('users', JSON.stringify(users));
    
    // Update export button visibility
    const exportBtn = document.getElementById('exportButtonContainer');
    if (exportBtn) {
        exportBtn.style.display = features.export ? 'block' : 'none';
    }
    
    // Also update the settings tab if it exists
    Object.keys(features).forEach(feature => {
        const checkbox = document.getElementById(`feature-${feature}`);
        if (checkbox) checkbox.checked = features[feature];
    });
    
    // Hide floating save button
    const saveBtn = document.getElementById('floatingSaveBtn');
    if (saveBtn) {
        saveBtn.classList.remove('show');
        setTimeout(() => {
            saveBtn.remove();
        }, 300);
    }
    
    alert('Features updated successfully!');
    closeFeaturesModal();
}

function saveAndClose() {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    
    if (!users[userId]) {
        alert('User not found!');
        return;
    }
    
    // Collect all feature settings from modal
    const features = {
        sales: document.getElementById('modal-feature-sales').checked,
        purchases: document.getElementById('modal-feature-purchases').checked,
        inventory: document.getElementById('modal-feature-inventory').checked,
        reports: document.getElementById('modal-feature-reports').checked,
        customers: document.getElementById('modal-feature-customers').checked,
        multistore: document.getElementById('modal-feature-multistore').checked,
        financial: document.getElementById('modal-feature-financial').checked,
        notifications: document.getElementById('modal-feature-notifications').checked
    };
    
    // Update user
    users[userId].features = features;
    localStorage.setItem('users', JSON.stringify(users));
    
    // Hide floating save button if exists
    const saveBtn = document.getElementById('floatingSaveBtn');
    if (saveBtn) {
        saveBtn.classList.remove('show');
        setTimeout(() => {
            saveBtn.remove();
        }, 300);
    }
    
    // Show success message
    alert('Features saved successfully!');
    
    // Scroll to top of profile page
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Close modal
    document.getElementById('featuresModal').classList.remove('active');
}

// Load profile on page load
loadUserProfile();
loadUserSettings();
checkProfileStatus();


function exportTransactions() {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users[userId];
    
    if (!user) {
        alert('User not found!');
        return;
    }
    
    // Check if export feature is enabled
    if (!user.features || !user.features.export) {
        alert('Export feature is not enabled for this user. Please contact admin.');
        return;
    }
    
    // Get date range
    const fromDateInput = document.getElementById('exportFromDate');
    const toDateInput = document.getElementById('exportToDate');
    
    let fromDate, toDate;
    const today = new Date().toISOString().split('T')[0];
    
    if (fromDateInput && toDateInput && fromDateInput.value && toDateInput.value) {
        fromDate = fromDateInput.value;
        toDate = toDateInput.value;
        
        // Validate date range
        if (fromDate > toDate) {
            alert('From Date cannot be after To Date!');
            return;
        }
    } else {
        // Default to today if no dates selected
        fromDate = today;
        toDate = today;
    }
    
    // Get business data
    const businessData = JSON.parse(localStorage.getItem(`business_${userId}`)) || { sales: [], purchases: [] };
    
    // Filter transactions by date range
    const filteredSales = businessData.sales.filter(s => s.date >= fromDate && s.date <= toDate);
    const filteredPurchases = businessData.purchases.filter(p => p.date >= fromDate && p.date <= toDate);
    
    // Create CSV content
    let csvContent = "Daily Transaction Report\n";
    csvContent += `User: ${user.username}\n`;
    csvContent += `Date: ${new Date().toLocaleDateString()}\n\n`;
    
    // Sales section
    csvContent += "SALES TRANSACTIONS\n";
    csvContent += "Date,Product,Quantity,Price,Total,Customer\n";
    
    todaySales.forEach(sale => {
        const total = sale.quantity * sale.price;
        csvContent += `${sale.date},${sale.product},${sale.quantity},${sale.price},${total},${sale.customer}\n`;
    });
    
    const totalSales = todaySales.reduce((sum, s) => sum + (s.quantity * s.price), 0);
    csvContent += `\nTotal Sales:,,,,,Rs. ${totalSales}\n\n`;
    
    // Purchases section
    csvContent += "PURCHASE TRANSACTIONS\n";
    csvContent += "Date,Product,Quantity,Cost,Total,Supplier\n";
    
    todayPurchases.forEach(purchase => {
        const total = purchase.quantity * purchase.cost;
        csvContent += `${purchase.date},${purchase.product},${purchase.quantity},${purchase.cost},${total},${purchase.supplier}\n`;
    });
    
    const totalPurchases = todayPurchases.reduce((sum, p) => sum + (p.quantity * p.cost), 0);
    csvContent += `\nTotal Purchases:,,,,,Rs. ${totalPurchases}\n`;
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `transactions_${user.username}_${today}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    alert(`Daily transactions exported successfully!\n\nSales: ${todaySales.length} transactions\nPurchases: ${todayPurchases.length} transactions\n\nFile: transactions_${user.username}_${today}.csv`);
}


function toggleProfileStatus() {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users[userId];
    
    if (!user) {
        alert('User not found!');
        return;
    }
    
    const currentStatus = user.profileEnabled !== false; // Default true if not set
    const newStatus = !currentStatus;
    
    const action = newStatus ? 'ENABLE' : 'DISABLE';
    const confirmMsg = newStatus 
        ? `Are you sure you want to ENABLE this profile?\n\nUser: ${user.username}\n\nUser will regain access to all features.`
        : `Are you sure you want to DISABLE this profile?\n\nUser: ${user.username}\n\nUser will lose access to:\n- Login\n- All features\n- All data\n\nThis action can be reversed.`;
    
    if (!confirm(confirmMsg)) return;
    
    // Update profile status
    users[userId].profileEnabled = newStatus;
    localStorage.setItem('users', JSON.stringify(users));
    
    // Update button
    updateProfileButton(newStatus);
    
    alert(`Profile ${action}D successfully!\n\nUser: ${user.username}\nStatus: ${newStatus ? 'ACTIVE' : 'DISABLED'}`);
}

function updateProfileButton(isEnabled) {
    const btn = document.getElementById('toggleProfileBtn');
    if (!btn) return;
    
    if (isEnabled) {
        btn.textContent = '🔒 Disable Profile';
        btn.style.background = 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)';
    } else {
        btn.textContent = '✅ Enable Profile';
        btn.style.background = 'linear-gradient(135deg, #28a745 0%, #218838 100%)';
    }
}

function checkProfileStatus() {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users[userId];
    
    if (!user) return;
    
    const isEnabled = user.profileEnabled !== false;
    updateProfileButton(isEnabled);
    
    // Show status indicator
    if (!isEnabled) {
        const statusIndicator = document.createElement('div');
        statusIndicator.style.cssText = 'background: #dc3545; color: white; padding: 10px; text-align: center; font-weight: bold; margin-bottom: 20px; border-radius: 5px;';
        statusIndicator.textContent = '⚠️ THIS PROFILE IS DISABLED - User cannot login or access any features';
        
        const profileHeader = document.querySelector('.profile-header');
        if (profileHeader) {
            profileHeader.insertAdjacentElement('beforebegin', statusIndicator);
        }
    }
}


let currentBusinessData = null;

function showRevenueDetails() {
    if (!currentBusinessData) return;
    
    const totalSalesRevenue = currentBusinessData.sales.reduce((sum, s) => sum + (s.quantity * s.price), 0);
    const totalPurchasesCost = currentBusinessData.purchases.reduce((sum, p) => sum + (p.quantity * p.cost), 0);
    const netProfit = totalSalesRevenue - totalPurchasesCost;
    
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 600px;">
            <span class="close" onclick="this.parentElement.parentElement.remove()">&times;</span>
            <h2>💰 Revenue Details</h2>
            
            <div style="margin-top: 20px;">
                <div class="stat-box revenue" style="margin-bottom: 15px;">
                    <div class="stat-details">
                        <h3>Rs. ${currentBusinessData.revenue.toLocaleString()}</h3>
                        <p>Total Revenue</p>
                    </div>
                </div>
                
                <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin-bottom: 15px;">
                    <h3 style="margin-bottom: 15px; color: #333;">Revenue Breakdown</h3>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 10px; padding: 10px; background: white; border-radius: 5px;">
                        <span>💵 Sales Revenue:</span>
                        <strong style="color: #28a745;">Rs. ${totalSalesRevenue.toLocaleString()}</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 10px; padding: 10px; background: white; border-radius: 5px;">
                        <span>💸 Purchase Costs:</span>
                        <strong style="color: #dc3545;">Rs. ${totalPurchasesCost.toLocaleString()}</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 10px; background: white; border-radius: 5px; border: 2px solid #667eea;">
                        <span><strong>📊 Net Profit:</strong></span>
                        <strong style="color: ${netProfit >= 0 ? '#28a745' : '#dc3545'};">Rs. ${netProfit.toLocaleString()}</strong>
                    </div>
                </div>
                
                <div style="background: #fff3cd; padding: 15px; border-radius: 5px; border-left: 4px solid #ffc107;">
                    <strong>📈 Performance:</strong>
                    <p style="margin: 5px 0 0 0; color: #856404;">
                        ${currentBusinessData.sales.length} sales transactions completed<br>
                        ${currentBusinessData.purchases.length} purchase orders processed
                    </p>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function showBudgetDetails() {
    if (!currentBusinessData) return;
    
    const totalInventoryValue = currentBusinessData.inventory.reduce((sum, item) => sum + (item.stock * item.unitPrice), 0);
    const availableBudget = currentBusinessData.budget - totalInventoryValue;
    const budgetUtilization = ((totalInventoryValue / currentBusinessData.budget) * 100).toFixed(1);
    
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 600px;">
            <span class="close" onclick="this.parentElement.parentElement.remove()">&times;</span>
            <h2>🏪 Shop Budget Details</h2>
            
            <div style="margin-top: 20px;">
                <div class="stat-box budget" style="margin-bottom: 15px;">
                    <div class="stat-details">
                        <h3>Rs. ${currentBusinessData.budget.toLocaleString()}</h3>
                        <p>Total Shop Budget</p>
                    </div>
                </div>
                
                <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin-bottom: 15px;">
                    <h3 style="margin-bottom: 15px; color: #333;">Budget Allocation</h3>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 10px; padding: 10px; background: white; border-radius: 5px;">
                        <span>📦 Inventory Value:</span>
                        <strong style="color: #667eea;">Rs. ${totalInventoryValue.toLocaleString()}</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 10px; padding: 10px; background: white; border-radius: 5px;">
                        <span>💵 Available Budget:</span>
                        <strong style="color: #28a745;">Rs. ${availableBudget.toLocaleString()}</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 10px; background: white; border-radius: 5px; border: 2px solid #667eea;">
                        <span><strong>📊 Utilization:</strong></span>
                        <strong style="color: ${budgetUtilization > 80 ? '#dc3545' : '#28a745'};">${budgetUtilization}%</strong>
                    </div>
                </div>
                
                <div style="background: #e3f2fd; padding: 15px; border-radius: 5px; border-left: 4px solid #2196f3;">
                    <strong>📋 Inventory Summary:</strong>
                    <p style="margin: 5px 0 0 0; color: #1565c0;">
                        ${currentBusinessData.inventory.length} different products in stock<br>
                        Total stock value: Rs. ${totalInventoryValue.toLocaleString()}
                    </p>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}


function showAddInventoryModal() {
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 500px;">
            <span class="close" onclick="this.parentElement.parentElement.remove()">&times;</span>
            <h2>➕ Add Inventory Item</h2>
            
            <form id="addInventoryForm" style="margin-top: 20px;">
                <div class="input-group">
                    <label>Product Name</label>
                    <input type="text" id="newProductName" required placeholder="Enter product name">
                </div>
                
                <div class="input-group">
                    <label>Category</label>
                    <select id="newCategory" required>
                        <option value="Electronics">Electronics</option>
                        <option value="Accessories">Accessories</option>
                        <option value="Audio">Audio</option>
                        <option value="Computers">Computers</option>
                        <option value="Mobile">Mobile</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
                
                <div class="input-group">
                    <label>Stock Quantity</label>
                    <input type="number" id="newStock" required min="0" placeholder="Enter quantity">
                </div>
                
                <div class="input-group">
                    <label>Unit Price (Rs.)</label>
                    <input type="number" id="newUnitPrice" required min="0" placeholder="Enter price">
                </div>
                
                <button type="submit" class="btn-primary" style="width: 100%; margin-top: 10px;">
                    💾 Add to Inventory
                </button>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Handle form submission
    document.getElementById('addInventoryForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const newItem = {
            product: document.getElementById('newProductName').value.trim(),
            category: document.getElementById('newCategory').value,
            stock: parseInt(document.getElementById('newStock').value),
            unitPrice: parseInt(document.getElementById('newUnitPrice').value),
            status: 'in'
        };
        
        // Determine status based on stock
        if (newItem.stock === 0) {
            newItem.status = 'out';
        } else if (newItem.stock <= 5) {
            newItem.status = 'low';
        }
        
        // Get business data
        let businessData = JSON.parse(localStorage.getItem(`business_${userId}`)) || currentBusinessData;
        
        if (!businessData.inventory) {
            businessData.inventory = [];
        }
        
        // Add new item
        businessData.inventory.push(newItem);
        
        // Save
        localStorage.setItem(`business_${userId}`, JSON.stringify(businessData));
        currentBusinessData = businessData;
        
        // Reload inventory
        loadInventory(businessData.inventory);
        
        // Update total items count
        document.getElementById('totalItems').textContent = businessData.inventory.length;
        
        modal.remove();
        alert(`Item added successfully!\n\nProduct: ${newItem.product}\nStock: ${newItem.stock}\nPrice: Rs. ${newItem.unitPrice}`);
    });
}


// Load user features
function loadUserFeatures() {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users[userId];
    
    if (!user) return;
    
    // Default features (all enabled if not set)
    const defaultFeatures = {
        userManagement: true,
        trialSystem: true,
        licenseSystem: true,
        flashSale: true
    };
    
    const features = user.features || defaultFeatures;
    
    // Set checkboxes
    if (document.getElementById('feature-userManagement')) {
        document.getElementById('feature-userManagement').checked = features.userManagement !== false;
    }
    if (document.getElementById('feature-trialSystem')) {
        document.getElementById('feature-trialSystem').checked = features.trialSystem !== false;
    }
    if (document.getElementById('feature-licenseSystem')) {
        document.getElementById('feature-licenseSystem').checked = features.licenseSystem !== false;
    }
    if (document.getElementById('feature-flashSale')) {
        document.getElementById('feature-flashSale').checked = features.flashSale !== false;
    }
}

// Call on page load
if (typeof userId !== 'undefined') {
    loadUserFeatures();
}

// Load user profile when page loads
document.addEventListener('DOMContentLoaded', function() {
    loadUserProfile();
});