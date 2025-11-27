// ==========================================
// DASHBOARD ANALYTICS
// ==========================================

function showDashboard() {
    document.getElementById('dashboardModal').classList.add('active');
    calculateDashboardMetrics();
    loadTopProducts();
    loadSalesTrend();
}

function closeDashboard() {
    document.getElementById('dashboardModal').classList.remove('active');
}

function calculateDashboardMetrics() {
    const transactions = JSON.parse(localStorage.getItem('transactions')) || [];
    const returns = JSON.parse(localStorage.getItem('returns')) || [];
    const today = new Date().toDateString();
    
    // Today's sales
    const todayTransactions = transactions.filter(t => new Date(t.date).toDateString() === today);
    const todaySales = todayTransactions.reduce((sum, t) => sum + (t.total || 0), 0);
    
    // This month sales
    const now = new Date();
    const monthTransactions = transactions.filter(t => {
        const tDate = new Date(t.date);
        return tDate.getMonth() === now.getMonth() && tDate.getFullYear() === now.getFullYear();
    });
    const monthSales = monthTransactions.reduce((sum, t) => sum + (t.total || 0), 0);
    
    // Pending returns
    const pendingReturns = returns.filter(r => r.status === 'pending').length;
    
    document.getElementById('todaySales').textContent = `Rs. ${todaySales.toLocaleString()}`;
    document.getElementById('monthSales').textContent = `Rs. ${monthSales.toLocaleString()}`;
    document.getElementById('totalTransactions').textContent = transactions.length;
    document.getElementById('pendingReturns').textContent = pendingReturns;
}

function loadTopProducts() {
    const transactions = JSON.parse(localStorage.getItem('transactions')) || [];
    const productSales = {};
    
    transactions.forEach(t => {
        t.items?.forEach(item => {
            if (!productSales[item.name]) {
                productSales[item.name] = { qty: 0, total: 0 };
            }
            productSales[item.name].qty += item.quantity;
            productSales[item.name].total += item.total;
        });
    });
    
    const sorted = Object.entries(productSales)
        .sort((a, b) => b[1].qty - a[1].qty)
        .slice(0, 5);
    
    const list = document.getElementById('topProductsList');
    list.innerHTML = '';
    
    sorted.forEach(([name, data]) => {
        const div = document.createElement('div');
        div.style.cssText = 'padding: 10px; border-bottom: 1px solid #e0e0e0; display: flex; justify-content: space-between;';
        div.innerHTML = `
            <div><strong>${name}</strong><br><small style="color: #666;">${data.qty} units sold</small></div>
            <div style="text-align: right; font-weight: 600; color: #667eea;">Rs. ${data.total.toLocaleString()}</div>
        `;
        list.appendChild(div);
    });
}

function loadSalesTrend() {
    const transactions = JSON.parse(localStorage.getItem('transactions')) || [];
    const last7Days = {};
    
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        last7Days[dateStr] = 0;
    }
    
    transactions.forEach(t => {
        const dateStr = new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        if (last7Days[dateStr] !== undefined) {
            last7Days[dateStr] += t.total || 0;
        }
    });
    
    const maxSale = Math.max(...Object.values(last7Days), 1);
    const chart = document.getElementById('salesTrendChart');
    chart.innerHTML = '';
    
    Object.entries(last7Days).forEach(([date, amount]) => {
        const height = (amount / maxSale) * 200;
        const bar = document.createElement('div');
        bar.style.cssText = `
            flex: 1;
            background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);
            height: ${height}px;
            border-radius: 5px 5px 0 0;
            position: relative;
            cursor: pointer;
            transition: all 0.3s;
        `;
        bar.title = `${date}: Rs. ${amount.toLocaleString()}`;
        bar.onmouseover = function() { this.style.opacity = '0.8'; };
        bar.onmouseout = function() { this.style.opacity = '1'; };
        chart.appendChild(bar);
    });
}

// ==========================================
// ADVANCED REPORTING
// ==========================================

function showAdvancedReport() {
    document.getElementById('advancedReportModal').classList.add('active');
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    document.getElementById('reportStartDate').value = firstDay.toISOString().split('T')[0];
    document.getElementById('reportEndDate').value = today.toISOString().split('T')[0];
}

function closeAdvancedReport() {
    document.getElementById('advancedReportModal').classList.remove('active');
}

function generateAdvancedReport() {
    const startDate = new Date(document.getElementById('reportStartDate').value);
    const endDate = new Date(document.getElementById('reportEndDate').value);
    const category = document.getElementById('reportCategory').value;
    
    const transactions = JSON.parse(localStorage.getItem('transactions')) || [];
    const products = JSON.parse(localStorage.getItem('products')) || [];
    
    const filtered = transactions.filter(t => {
        const tDate = new Date(t.date);
        return tDate >= startDate && tDate <= endDate;
    });
    
    const tbody = document.getElementById('advancedReportBody');
    tbody.innerHTML = '';
    
    let totalProfit = 0;
    
    filtered.forEach(t => {
        t.items?.forEach(item => {
            const product = products.find(p => p.name === item.name);
            const costPrice = product?.costPrice || item.price * 0.7;
            const profit = (item.price - costPrice) * item.quantity;
            totalProfit += profit;
            
            if (!category || product?.category === category) {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${new Date(t.date).toLocaleDateString()}</td>
                    <td>${item.name}</td>
                    <td>${product?.category || 'N/A'}</td>
                    <td>${item.quantity}</td>
                    <td>Rs. ${item.price.toLocaleString()}</td>
                    <td>Rs. ${item.total.toLocaleString()}</td>
                    <td style="color: #28a745; font-weight: 600;">Rs. ${profit.toLocaleString()}</td>
                `;
                tbody.appendChild(tr);
            }
        });
    });
}

function exportReportPDF() {
    alert('📥 PDF export feature coming soon!');
}

function exportReportExcel() {
    alert('📊 Excel export feature coming soon!');
}

// ==========================================
// USER MANAGEMENT
// ==========================================

function showUserManagement() {
    document.getElementById('userManagementModal').classList.add('active');
    loadUsers();
}

function closeUserManagement() {
    document.getElementById('userManagementModal').classList.remove('active');
}

function loadUsers() {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const tbody = document.getElementById('userManagementBody');
    tbody.innerHTML = '';
    
    if (users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 40px; color: #999;">No users found</td></tr>';
        return;
    }
    
    users.forEach((user, index) => {
        const lastLogin = user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never';
        const status = user.status || 'active';
        const statusColor = status === 'active' ? '#28a745' : status === 'inactive' ? '#ffc107' : '#dc3545';
        const statusText = status.charAt(0).toUpperCase() + status.slice(1);
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>
                <strong>${user.username}</strong>
                <br><small style="color: #666;">${user.mobile || ''}</small>
            </td>
            <td><span style="background: #667eea; color: white; padding: 3px 10px; border-radius: 12px; font-size: 12px;">${user.role || 'user'}</span></td>
            <td>${user.email || 'N/A'}</td>
            <td><span style="background: ${statusColor}; color: white; padding: 3px 8px; border-radius: 5px; font-size: 12px;">${statusText}</span></td>
            <td>${lastLogin}</td>
            <td>
                <button class="action-btn edit-btn" onclick="editUser(${index})">✏️ Edit</button>
                <button class="action-btn delete-btn" onclick="deleteUser(${index})">🗑️</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function showAddUserModal() {
    document.getElementById('userModalTitle').textContent = 'Add New User';
    document.getElementById('userSubmitBtn').textContent = 'Add User';
    document.getElementById('editUserIndex').value = '-1';
    document.getElementById('addUserForm').reset();
    document.getElementById('newUserPassword').required = true;
    document.getElementById('addUserModal').classList.add('active');
}

function closeAddUserModal() {
    document.getElementById('addUserModal').classList.remove('active');
    document.getElementById('addUserForm').reset();
    document.getElementById('editUserIndex').value = '-1';
}

document.getElementById('addUserForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const editIndex = parseInt(document.getElementById('editUserIndex').value);
    let users = JSON.parse(localStorage.getItem('users')) || [];
    
    if (editIndex >= 0) {
        // Update existing user
        users[editIndex].username = document.getElementById('newUsername').value;
        users[editIndex].email = document.getElementById('newUserEmail').value;
        users[editIndex].mobile = document.getElementById('newUserMobile').value;
        users[editIndex].role = document.getElementById('newUserRole').value;
        users[editIndex].accountType = document.getElementById('newUserAccountType').value;
        users[editIndex].status = document.getElementById('newUserStatus').value;
        
        const newPassword = document.getElementById('newUserPassword').value;
        if (newPassword) {
            users[editIndex].password = newPassword;
        }
        
        users[editIndex].updatedAt = new Date().toISOString();
        localStorage.setItem('users', JSON.stringify(users));
        closeAddUserModal();
        loadUsers();
        alert('✅ User updated successfully!');
    } else {
        // Add new user
        const userData = {
            username: document.getElementById('newUsername').value,
            email: document.getElementById('newUserEmail').value,
            mobile: document.getElementById('newUserMobile').value,
            password: document.getElementById('newUserPassword').value,
            role: document.getElementById('newUserRole').value,
            accountType: document.getElementById('newUserAccountType').value,
            status: document.getElementById('newUserStatus').value || 'active',
            createdAt: new Date().toISOString()
        };
        
        if (users.find(u => u.username === userData.username)) {
            alert('❌ Username already exists!');
            return;
        }
        
        users.push(userData);
        localStorage.setItem('users', JSON.stringify(users));
        closeAddUserModal();
        loadUsers();
        alert('✅ User added successfully!');
    }
});

function editUser(index) {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users[index];
    
    if (!user) {
        alert('❌ User not found!');
        return;
    }
    
    document.getElementById('userModalTitle').textContent = 'Edit User';
    document.getElementById('userSubmitBtn').textContent = 'Update User';
    document.getElementById('editUserIndex').value = index;
    
    document.getElementById('newUsername').value = user.username || '';
    document.getElementById('newUserEmail').value = user.email || '';
    document.getElementById('newUserMobile').value = user.mobile || '';
    document.getElementById('newUserPassword').value = '';
    document.getElementById('newUserPassword').required = false;
    document.getElementById('newUserRole').value = user.role || 'user';
    document.getElementById('newUserAccountType').value = user.accountType || 'admin';
    document.getElementById('newUserStatus').value = user.status || 'active';
    
    document.getElementById('addUserModal').classList.add('active');
}

function deleteUser(index) {
    if (confirm('Delete this user?')) {
        let users = JSON.parse(localStorage.getItem('users')) || [];
        users.splice(index, 1);
        localStorage.setItem('users', JSON.stringify(users));
        loadUsers();
        alert('✅ User deleted!');
    }
}

// ==========================================
// SUPPLIER MANAGEMENT
// ==========================================

function showSupplierModal() {
    document.getElementById('supplierModal').classList.add('active');
    loadSuppliers();
}

function closeSupplierModal() {
    document.getElementById('supplierModal').classList.remove('active');
}

function loadSuppliers() {
    const suppliers = JSON.parse(localStorage.getItem('suppliers')) || [];
    const tbody = document.getElementById('supplierBody');
    tbody.innerHTML = '';
    
    suppliers.forEach((supplier, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${supplier.name}</strong></td>
            <td>📞 ${supplier.contact}</td>
            <td>${supplier.email || 'N/A'}</td>
            <td style="color: #dc3545; font-weight: 600;">Rs. ${(supplier.balance || 0).toLocaleString()}</td>
            <td>
                <button class="action-btn edit-btn" onclick="editSupplier(${index})">✏️</button>
                <button class="action-btn delete-btn" onclick="deleteSupplier(${index})">🗑️</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function showAddSupplierModal() {
    document.getElementById('addSupplierModal').classList.add('active');
}

function closeAddSupplierModal() {
    document.getElementById('addSupplierModal').classList.remove('active');
    document.getElementById('addSupplierForm').reset();
}

document.getElementById('addSupplierForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const supplierData = {
        id: Date.now(),
        name: document.getElementById('supplierName').value,
        contact: document.getElementById('supplierContact').value,
        email: document.getElementById('supplierEmail').value,
        address: document.getElementById('supplierAddress').value,
        balance: 0,
        createdAt: new Date().toISOString()
    };
    
    let suppliers = JSON.parse(localStorage.getItem('suppliers')) || [];
    suppliers.push(supplierData);
    localStorage.setItem('suppliers', JSON.stringify(suppliers));
    
    closeAddSupplierModal();
    loadSuppliers();
    alert('✅ Supplier added successfully!');
});

function editSupplier(index) {
    alert('Edit supplier feature coming soon!');
}

function deleteSupplier(index) {
    if (confirm('Delete this supplier?')) {
        let suppliers = JSON.parse(localStorage.getItem('suppliers')) || [];
        suppliers.splice(index, 1);
        localStorage.setItem('suppliers', JSON.stringify(suppliers));
        loadSuppliers();
        alert('✅ Supplier deleted!');
    }
}

// ==========================================
// RETURN MANAGEMENT
// ==========================================

function showReturnModal() {
    document.getElementById('returnModal').classList.add('active');
    loadReturns();
    loadReturnProductsDropdown();
}

function closeReturnModal() {
    document.getElementById('returnModal').classList.remove('active');
}

function loadReturns() {
    const returns = JSON.parse(localStorage.getItem('returns')) || [];
    const tbody = document.getElementById('returnBody');
    tbody.innerHTML = '';
    
    returns.forEach((ret, index) => {
        const statusColor = ret.status === 'pending' ? '#ffc107' : '#28a745';
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>RET${String(index + 1).padStart(4, '0')}</strong></td>
            <td>${ret.product}</td>
            <td>${ret.quantity}</td>
            <td>${ret.reason}</td>
            <td><span style="background: ${statusColor}; color: white; padding: 3px 8px; border-radius: 5px; font-size: 12px;">${ret.status}</span></td>
            <td>Rs. ${ret.amount.toLocaleString()}</td>
            <td>
                <button class="action-btn edit-btn" onclick="approveReturn(${index})">✅</button>
                <button class="action-btn delete-btn" onclick="rejectReturn(${index})">❌</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function loadReturnProductsDropdown() {
    const products = JSON.parse(localStorage.getItem('products')) || [];
    const select = document.getElementById('returnProduct');
    select.innerHTML = '<option value="">Choose Product</option>';
    
    products.forEach(product => {
        const option = document.createElement('option');
        option.value = product.name;
        option.textContent = product.name;
        select.appendChild(option);
    });
}

function showAddReturnModal() {
    document.getElementById('addReturnModal').classList.add('active');
}

function closeAddReturnModal() {
    document.getElementById('addReturnModal').classList.remove('active');
    document.getElementById('addReturnForm').reset();
}

document.getElementById('addReturnForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const returnData = {
        product: document.getElementById('returnProduct').value,
        quantity: parseInt(document.getElementById('returnQty').value),
        reason: document.getElementById('returnReason').value,
        amount: parseFloat(document.getElementById('returnAmount').value),
        status: 'pending',
        date: new Date().toISOString(),
        processedBy: currentUser.username
    };
    
    let returns = JSON.parse(localStorage.getItem('returns')) || [];
    returns.push(returnData);
    localStorage.setItem('returns', JSON.stringify(returns));
    
    closeAddReturnModal();
    loadReturns();
    alert('✅ Return processed!');
});

function approveReturn(index) {
    let returns = JSON.parse(localStorage.getItem('returns')) || [];
    returns[index].status = 'approved';
    localStorage.setItem('returns', JSON.stringify(returns));
    loadReturns();
    alert('✅ Return approved!');
}

function rejectReturn(index) {
    let returns = JSON.parse(localStorage.getItem('returns')) || [];
    returns[index].status = 'rejected';
    localStorage.setItem('returns', JSON.stringify(returns));
    loadReturns();
    alert('❌ Return rejected!');
}

// ==========================================
// DISCOUNTS & PROMOTIONS
// ==========================================

function showDiscountModal() {
    document.getElementById('discountModal').classList.add('active');
    loadDiscounts();
    loadPromos();
    loadLoyalty();
}

function closeDiscountModal() {
    document.getElementById('discountModal').classList.remove('active');
}

function showDiscountTab(tabName) {
    document.querySelectorAll('#discountModal .report-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('#discountModal .report-tab').forEach(el => el.classList.remove('active'));
    
    document.getElementById(tabName + 'Tab').classList.add('active');
    event.target.classList.add('active');
}

function loadDiscounts() {
    const discounts = JSON.parse(localStorage.getItem('discounts')) || [];
    const tbody = document.getElementById('discountBody');
    tbody.innerHTML = '';
    
    discounts.forEach((discount, index) => {
        const validTill = new Date(discount.validTill).toLocaleDateString();
        const isActive = new Date(discount.validTill) > new Date();
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${discount.product}</td>
            <td><strong>${discount.percentage}%</strong></td>
            <td>${validTill}</td>
            <td><span style="background: ${isActive ? '#28a745' : '#dc3545'}; color: white; padding: 3px 8px; border-radius: 5px; font-size: 12px;">${isActive ? 'Active' : 'Expired'}</span></td>
            <td>
                <button class="action-btn delete-btn" onclick="deleteDiscount(${index})">🗑️</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function showAddDiscountModal() {
    alert('Add discount feature coming soon!');
}

function deleteDiscount(index) {
    if (confirm('Delete this discount?')) {
        let discounts = JSON.parse(localStorage.getItem('discounts')) || [];
        discounts.splice(index, 1);
        localStorage.setItem('discounts', JSON.stringify(discounts));
        loadDiscounts();
        alert('✅ Discount deleted!');
    }
}

function loadPromos() {
    const promos = JSON.parse(localStorage.getItem('promos')) || [];
    const tbody = document.getElementById('promoBody');
    tbody.innerHTML = '';
    
    promos.forEach((promo, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${promo.code}</strong></td>
            <td>${promo.discount}%</td>
            <td>${promo.usageCount || 0} / ${promo.maxUsage || 'Unlimited'}</td>
            <td>${new Date(promo.validTill).toLocaleDateString()}</td>
            <td>
                <button class="action-btn delete-btn" onclick="deletePromo(${index})">🗑️</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function showAddPromoModal() {
    alert('Add promo code feature coming soon!');
}

function deletePromo(index) {
    if (confirm('Delete this promo?')) {
        let promos = JSON.parse(localStorage.getItem('promos')) || [];
        promos.splice(index, 1);
        localStorage.setItem('promos', JSON.stringify(promos));
        loadPromos();
        alert('✅ Promo deleted!');
    }
}

function loadLoyalty() {
    const loyalty = JSON.parse(localStorage.getItem('loyalty')) || [];
    const tbody = document.getElementById('loyaltyBody');
    tbody.innerHTML = '';
    
    loyalty.forEach((member, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${member.customerName}</td>
            <td><strong>${member.points}</strong></td>
            <td>${member.tier || 'Bronze'}</td>
            <td>${member.rewards || 0}</td>
            <td>
                <button class="action-btn edit-btn" onclick="editLoyalty(${index})">✏️</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function showAddLoyaltyModal() {
    alert('Add loyalty program feature coming soon!');
}

function editLoyalty(index) {
    alert('Edit loyalty feature coming soon!');
}

// ==========================================
// BACKUP & SYNC
// ==========================================

function showBackupModal() {
    document.getElementById('backupModal').classList.add('active');
    updateLastBackupTime();
}

function closeBackupModal() {
    document.getElementById('backupModal').classList.remove('active');
}

function updateLastBackupTime() {
    const lastBackup = localStorage.getItem('lastBackupTime');
    if (lastBackup) {
        document.getElementById('lastBackupTime').textContent = new Date(lastBackup).toLocaleString();
    }
}

function backupDataLocal() {
    const backupData = {
        products: JSON.parse(localStorage.getItem('products')) || [],
        transactions: JSON.parse(localStorage.getItem('transactions')) || [],
        clients: JSON.parse(localStorage.getItem('clients')) || [],
        subdealers: JSON.parse(localStorage.getItem('subdealers')) || [],
        suppliers: JSON.parse(localStorage.getItem('suppliers')) || [],
        returns: JSON.parse(localStorage.getItem('returns')) || [],
        backupDate: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(backupData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pos-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    localStorage.setItem('lastBackupTime', new Date().toISOString());
    updateLastBackupTime();
    alert('✅ Backup downloaded successfully!');
}

function enableCloudBackup() {
    alert('☁️ Cloud backup feature coming soon!');
}

function restoreBackup() {
    const file = document.getElementById('backupFile').files[0];
    if (!file) {
        alert('Please select a backup file!');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const backupData = JSON.parse(e.target.result);
            
            if (confirm('⚠️ This will overwrite all current data. Continue?')) {
                localStorage.setItem('products', JSON.stringify(backupData.products));
                localStorage.setItem('transactions', JSON.stringify(backupData.transactions));
                localStorage.setItem('clients', JSON.stringify(backupData.clients));
                localStorage.setItem('subdealers', JSON.stringify(backupData.subdealers));
                localStorage.setItem('suppliers', JSON.stringify(backupData.suppliers));
                localStorage.setItem('returns', JSON.stringify(backupData.returns));
                
                alert('✅ Backup restored successfully! Refreshing page...');
                setTimeout(() => location.reload(), 1500);
            }
        } catch (error) {
            alert('❌ Invalid backup file!');
        }
    };
    reader.readAsText(file);
}

// ==========================================
// SETTINGS
// ==========================================

function showSettingsModal() {
    document.getElementById('settingsModal').classList.add('active');
    loadSettings();
}

function closeSettingsModal() {
    document.getElementById('settingsModal').classList.remove('active');
}

function showSettingsTab(tabName) {
    document.querySelectorAll('#settingsModal .report-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('#settingsModal .report-tab').forEach(el => el.classList.remove('active'));
    
    document.getElementById(tabName + 'Tab').classList.add('active');
    event.target.classList.add('active');
}

function loadSettings() {
    const settings = JSON.parse(localStorage.getItem('settings')) || {};
    
    document.getElementById('shopName').value = settings.shopName || '';
    document.getElementById('currencySelect').value = settings.currency || 'Rs.';
    document.getElementById('taxRate').value = settings.taxRate || 0;
    document.getElementById('receiptWidth').value = settings.receiptWidth || 80;
    document.getElementById('printHeader').value = settings.printHeader || '';
    document.getElementById('printFooter').value = settings.printFooter || '';
}

function saveGeneralSettings() {
    const settings = JSON.parse(localStorage.getItem('settings')) || {};
    
    settings.shopName = document.getElementById('shopName').value;
    settings.currency = document.getElementById('currencySelect').value;
    settings.taxRate = parseFloat(document.getElementById('taxRate').value) || 0;
    
    localStorage.setItem('settings', JSON.stringify(settings));
    alert('✅ General settings saved!');
}

function savePrinterSettings() {
    const settings = JSON.parse(localStorage.getItem('settings')) || {};
    
    settings.receiptWidth = parseInt(document.getElementById('receiptWidth').value);
    settings.printHeader = document.getElementById('printHeader').value;
    settings.printFooter = document.getElementById('printFooter').value;
    
    localStorage.setItem('settings', JSON.stringify(settings));
    alert('✅ Printer settings saved!');
}

function changePassword() {
    const current = document.getElementById('currentPassword').value;
    const newPass = document.getElementById('newPassword').value;
    const confirm = document.getElementById('confirmPassword').value;
    
    if (!current || !newPass || !confirm) {
        alert('❌ Please fill all fields!');
        return;
    }
    
    if (newPass !== confirm) {
        alert('❌ Passwords do not match!');
        return;
    }
    
    if (current !== currentUser.password) {
        alert('❌ Current password is incorrect!');
        return;
    }
    
    currentUser.password = newPass;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    let users = JSON.parse(localStorage.getItem('users')) || [];
    const userIndex = users.findIndex(u => u.username === currentUser.username);
    if (userIndex !== -1) {
        users[userIndex].password = newPass;
        localStorage.setItem('users', JSON.stringify(users));
    }
    
    alert('✅ Password changed successfully!');
    document.getElementById('currentPassword').value = '';
    document.getElementById('newPassword').value = '';
    document.getElementById('confirmPassword').value = '';
}


// ==========================================
// USER DATA HISTORY
// ==========================================

function showUserDataHistory() {
    document.getElementById('userDataHistoryModal').classList.add('active');
    loadUserDataHistory();
}

function closeUserDataHistory() {
    document.getElementById('userDataHistoryModal').classList.remove('active');
}

function loadUserDataHistory() {
    const userBackups = JSON.parse(localStorage.getItem('userBackups')) || {};
    const currentUserData = userBackups[currentUser.username];
    
    if (!currentUserData) {
        document.getElementById('lastSavedTime').textContent = 'Never';
        document.getElementById('savedByUser').textContent = '-';
        document.getElementById('productsCount').textContent = '0';
        document.getElementById('transactionsCount').textContent = '0';
        document.getElementById('clientsCount').textContent = '0';
        document.getElementById('subdealersCount').textContent = '0';
        return;
    }
    
    const lastSaved = new Date(currentUserData.lastSavedAt);
    document.getElementById('lastSavedTime').textContent = lastSaved.toLocaleString();
    document.getElementById('savedByUser').textContent = currentUserData.savedBy || currentUser.username;
    
    document.getElementById('productsCount').textContent = (currentUserData.products || []).length;
    document.getElementById('transactionsCount').textContent = (currentUserData.transactions || []).length;
    document.getElementById('clientsCount').textContent = (currentUserData.clients || []).length;
    document.getElementById('subdealersCount').textContent = (currentUserData.subdealers || []).length;
}


// ==========================================
// PURCHASE ORDERS
// ==========================================

function showPurchaseOrders() {
    document.getElementById('purchaseOrdersModal').classList.add('active');
    loadPurchaseOrders();
}

function closePurchaseOrders() {
    document.getElementById('purchaseOrdersModal').classList.remove('active');
}

function loadPurchaseOrders() {
    const orders = JSON.parse(localStorage.getItem('purchaseOrders')) || [];
    const tbody = document.getElementById('purchaseOrdersBody');
    tbody.innerHTML = '';
    
    if (orders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 40px; color: #999;">No purchase orders yet</td></tr>';
        return;
    }
    
    orders.forEach((order, index) => {
        const statusColor = order.status === 'pending' ? '#ffc107' : order.status === 'received' ? '#28a745' : '#dc3545';
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>PO-${String(index + 1).padStart(4, '0')}</strong></td>
            <td>${order.supplier}</td>
            <td>${new Date(order.date).toLocaleDateString()}</td>
            <td>${order.product} (${order.quantity})</td>
            <td>Rs. ${order.total.toLocaleString()}</td>
            <td><span style="background: ${statusColor}; color: white; padding: 3px 8px; border-radius: 5px; font-size: 12px;">${order.status}</span></td>
            <td>
                <button class="action-btn edit-btn" onclick="receivePO(${index})">✅ Receive</button>
                <button class="action-btn delete-btn" onclick="deletePO(${index})">🗑️</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function showAddPurchaseOrder() {
    loadPODropdowns();
    document.getElementById('addPurchaseOrderModal').classList.add('active');
}

function closeAddPurchaseOrder() {
    document.getElementById('addPurchaseOrderModal').classList.remove('active');
    document.getElementById('addPurchaseOrderForm').reset();
}

function loadPODropdowns() {
    const suppliers = JSON.parse(localStorage.getItem('suppliers')) || [];
    const products = JSON.parse(localStorage.getItem('products')) || [];
    
    const supplierSelect = document.getElementById('poSupplier');
    supplierSelect.innerHTML = '<option value="">Select Supplier</option>';
    suppliers.forEach(s => {
        supplierSelect.innerHTML += `<option value="${s.name}">${s.name}</option>`;
    });
    
    const productSelect = document.getElementById('poProduct');
    productSelect.innerHTML = '<option value="">Select Product</option>';
    products.forEach(p => {
        productSelect.innerHTML += `<option value="${p.name}">${p.name}</option>`;
    });
}


document.getElementById('addPurchaseOrderForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const quantity = parseInt(document.getElementById('poQuantity').value);
    const unitCost = parseFloat(document.getElementById('poUnitCost').value);
    
    const orderData = {
        supplier: document.getElementById('poSupplier').value,
        product: document.getElementById('poProduct').value,
        quantity: quantity,
        unitCost: unitCost,
        total: quantity * unitCost,
        deliveryDate: document.getElementById('poDeliveryDate').value,
        notes: document.getElementById('poNotes').value,
        status: 'pending',
        date: new Date().toISOString(),
        createdBy: currentUser.username
    };
    
    let orders = JSON.parse(localStorage.getItem('purchaseOrders')) || [];
    orders.push(orderData);
    localStorage.setItem('purchaseOrders', JSON.stringify(orders));
    
    logActivity('inventory', `Created PO for ${orderData.product}`);
    closeAddPurchaseOrder();
    loadPurchaseOrders();
    alert('✅ Purchase Order created!');
});

function receivePO(index) {
    if (confirm('Mark this order as received? Stock will be updated.')) {
        let orders = JSON.parse(localStorage.getItem('purchaseOrders')) || [];
        const order = orders[index];
        order.status = 'received';
        order.receivedDate = new Date().toISOString();
        
        // Update product stock
        let products = JSON.parse(localStorage.getItem('products')) || [];
        const productIndex = products.findIndex(p => p.name === order.product);
        if (productIndex !== -1) {
            products[productIndex].stock += order.quantity;
            localStorage.setItem('products', JSON.stringify(products));
        }
        
        localStorage.setItem('purchaseOrders', JSON.stringify(orders));
        logActivity('inventory', `Received PO: ${order.product} (${order.quantity} units)`);
        loadPurchaseOrders();
        alert('✅ Order received! Stock updated.');
    }
}

function deletePO(index) {
    if (confirm('Delete this purchase order?')) {
        let orders = JSON.parse(localStorage.getItem('purchaseOrders')) || [];
        orders.splice(index, 1);
        localStorage.setItem('purchaseOrders', JSON.stringify(orders));
        loadPurchaseOrders();
    }
}


// ==========================================
// BARCODE SCANNER
// ==========================================

function showBarcodeModal() {
    document.getElementById('barcodeModal').classList.add('active');
    document.getElementById('barcodeInput').focus();
}

function closeBarcodeModal() {
    document.getElementById('barcodeModal').classList.remove('active');
    document.getElementById('barcodeInput').value = '';
    document.getElementById('barcodeResult').innerHTML = '';
}

function searchByBarcode() {
    const barcode = document.getElementById('barcodeInput').value.trim();
    if (!barcode) {
        alert('Please enter a barcode!');
        return;
    }
    
    const products = JSON.parse(localStorage.getItem('products')) || [];
    const product = products.find(p => p.barcode === barcode || p.id.toString() === barcode);
    
    const resultDiv = document.getElementById('barcodeResult');
    
    if (product) {
        resultDiv.innerHTML = `
            <div style="background: #d4edda; padding: 15px; border-radius: 8px; text-align: left;">
                <h4 style="margin: 0 0 10px 0; color: #155724;">✅ Product Found!</h4>
                <p style="margin: 5px 0;"><strong>Name:</strong> ${product.name}</p>
                <p style="margin: 5px 0;"><strong>Price:</strong> Rs. ${product.price.toLocaleString()}</p>
                <p style="margin: 5px 0;"><strong>Stock:</strong> ${product.stock}</p>
                <button class="btn-primary" onclick="addToCartFromBarcode('${product.name}')" style="margin-top: 10px;">➕ Add to Cart</button>
            </div>
        `;
    } else {
        resultDiv.innerHTML = `
            <div style="background: #f8d7da; padding: 15px; border-radius: 8px;">
                <p style="margin: 0; color: #721c24;">❌ Product not found with barcode: ${barcode}</p>
            </div>
        `;
    }
}

function addToCartFromBarcode(productName) {
    const products = JSON.parse(localStorage.getItem('products')) || [];
    const product = products.find(p => p.name === productName);
    if (product) {
        addToCart(product);
        closeBarcodeModal();
    }
}

// ==========================================
// PURCHASE ORDERS
// ==========================================

function showPurchaseOrder() {
    document.getElementById('purchaseOrderModal').classList.add('active');
    loadPurchaseOrders();
}

function closePurchaseOrder() {
    document.getElementById('purchaseOrderModal').classList.remove('active');
}

function loadPurchaseOrders() {
    const orders = JSON.parse(localStorage.getItem('purchaseOrders')) || [];
    const tbody = document.getElementById('purchaseOrderBody');
    tbody.innerHTML = '';
    
    if (orders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 40px; color: #999;">No purchase orders yet</td></tr>';
        return;
    }
    
    orders.forEach((order, index) => {
        const statusColor = order.status === 'pending' ? '#ffc107' : order.status === 'received' ? '#28a745' : '#dc3545';
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>PO-${String(index + 1).padStart(4, '0')}</strong></td>
            <td>${order.supplier}</td>
            <td>${new Date(order.date).toLocaleDateString()}</td>
            <td>${order.items.length} items</td>
            <td>Rs. ${order.total.toLocaleString()}</td>
            <td><span style="background: ${statusColor}; color: white; padding: 3px 8px; border-radius: 5px; font-size: 12px;">${order.status}</span></td>
            <td>
                <button class="action-btn edit-btn" onclick="receivePO(${index})">📦 Receive</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

let poItems = [];

function showNewPurchaseOrder() {
    poItems = [];
    document.getElementById('newPurchaseOrderModal').classList.add('active');
    loadPODropdowns();
    updatePOItemsList();
}

function closeNewPurchaseOrder() {
    document.getElementById('newPurchaseOrderModal').classList.remove('active');
    document.getElementById('purchaseOrderForm').reset();
    poItems = [];
}

function loadPODropdowns() {
    const suppliers = JSON.parse(localStorage.getItem('suppliers')) || [];
    const products = JSON.parse(localStorage.getItem('products')) || [];
    
    const supplierSelect = document.getElementById('poSupplier');
    supplierSelect.innerHTML = '<option value="">Choose Supplier</option>';
    suppliers.forEach(s => {
        supplierSelect.innerHTML += `<option value="${s.name}">${s.name}</option>`;
    });
    
    const productSelect = document.getElementById('poProduct');
    productSelect.innerHTML = '<option value="">Select Product</option>';
    products.forEach(p => {
        productSelect.innerHTML += `<option value="${p.name}" data-price="${p.costPrice || p.price * 0.7}">${p.name}</option>`;
    });
}

function addPOItem() {
    const product = document.getElementById('poProduct').value;
    const qty = parseInt(document.getElementById('poQty').value);
    const price = parseFloat(document.getElementById('poPrice').value);
    
    if (!product || !qty || !price) {
        alert('Please fill all item fields!');
        return;
    }
    
    poItems.push({ product, qty, price, total: qty * price });
    updatePOItemsList();
    
    document.getElementById('poProduct').value = '';
    document.getElementById('poQty').value = '';
    document.getElementById('poPrice').value = '';
}

function updatePOItemsList() {
    const list = document.getElementById('poItemsList');
    list.innerHTML = '';
    
    let total = 0;
    poItems.forEach((item, index) => {
        total += item.total;
        list.innerHTML += `
            <div style="display: flex; justify-content: space-between; padding: 10px; background: #f8f9fa; border-radius: 5px; margin-bottom: 5px;">
                <span>${item.product} x ${item.qty}</span>
                <span>Rs. ${item.total.toLocaleString()} <button onclick="removePOItem(${index})" style="background: #dc3545; color: white; border: none; padding: 2px 8px; border-radius: 3px; cursor: pointer;">×</button></span>
            </div>
        `;
    });
    
    document.getElementById('poTotal').textContent = total.toLocaleString();
}

function removePOItem(index) {
    poItems.splice(index, 1);
    updatePOItemsList();
}

document.getElementById('purchaseOrderForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    if (poItems.length === 0) {
        alert('Please add at least one item!');
        return;
    }
    
    const orderData = {
        supplier: document.getElementById('poSupplier').value,
        deliveryDate: document.getElementById('poDeliveryDate').value,
        items: poItems,
        total: poItems.reduce((sum, item) => sum + item.total, 0),
        status: 'pending',
        date: new Date().toISOString(),
        createdBy: currentUser.username
    };
    
    let orders = JSON.parse(localStorage.getItem('purchaseOrders')) || [];
    orders.push(orderData);
    localStorage.setItem('purchaseOrders', JSON.stringify(orders));
    
    logActivity('purchase_order', `Created PO for ${orderData.supplier}`);
    
    closeNewPurchaseOrder();
    loadPurchaseOrders();
    alert('✅ Purchase Order created!');
});

function receivePO(index) {
    if (!confirm('Mark this order as received? Stock will be updated.')) return;
    
    let orders = JSON.parse(localStorage.getItem('purchaseOrders')) || [];
    let products = JSON.parse(localStorage.getItem('products')) || [];
    
    orders[index].items.forEach(item => {
        const productIndex = products.findIndex(p => p.name === item.product);
        if (productIndex !== -1) {
            products[productIndex].stock += item.qty;
        }
    });
    
    orders[index].status = 'received';
    orders[index].receivedDate = new Date().toISOString();
    
    localStorage.setItem('purchaseOrders', JSON.stringify(orders));
    localStorage.setItem('products', JSON.stringify(products));
    
    logActivity('inventory', `Received PO - Stock updated`);
    
    loadPurchaseOrders();
    alert('✅ Order received! Stock updated.');
}

// ==========================================
// ACTIVITY LOGS
// ==========================================

function logActivity(type, details) {
    let logs = JSON.parse(localStorage.getItem('activityLogs')) || [];
    logs.push({
        timestamp: new Date().toISOString(),
        user: currentUser?.username || 'System',
        type: type,
        details: details
    });
    localStorage.setItem('activityLogs', JSON.stringify(logs));
}

function showActivityLogs() {
    document.getElementById('activityLogsModal').classList.add('active');
    loadActivityLogs();
}

function closeActivityLogs() {
    document.getElementById('activityLogsModal').classList.remove('active');
}

function loadActivityLogs() {
    const logs = JSON.parse(localStorage.getItem('activityLogs')) || [];
    const tbody = document.getElementById('activityLogsBody');
    tbody.innerHTML = '';
    
    if (logs.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 40px; color: #999;">No activity logs yet</td></tr>';
        return;
    }
    
    logs.reverse().slice(0, 100).forEach(log => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${new Date(log.timestamp).toLocaleString()}</td>
            <td>${log.user}</td>
            <td><span style="background: #667eea; color: white; padding: 2px 8px; border-radius: 5px; font-size: 11px;">${log.type}</span></td>
            <td>${log.details}</td>
        `;
        tbody.appendChild(tr);
    });
}

function filterActivityLogs() {
    const startDate = document.getElementById('logStartDate').value;
    const endDate = document.getElementById('logEndDate').value;
    const type = document.getElementById('logType').value;
    
    let logs = JSON.parse(localStorage.getItem('activityLogs')) || [];
    
    if (startDate) {
        logs = logs.filter(l => new Date(l.timestamp) >= new Date(startDate));
    }
    if (endDate) {
        logs = logs.filter(l => new Date(l.timestamp) <= new Date(endDate + 'T23:59:59'));
    }
    if (type) {
        logs = logs.filter(l => l.type === type);
    }
    
    const tbody = document.getElementById('activityLogsBody');
    tbody.innerHTML = '';
    
    logs.reverse().forEach(log => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${new Date(log.timestamp).toLocaleString()}</td>
            <td>${log.user}</td>
            <td><span style="background: #667eea; color: white; padding: 2px 8px; border-radius: 5px; font-size: 11px;">${log.type}</span></td>
            <td>${log.details}</td>
        `;
        tbody.appendChild(tr);
    });
}

// ==========================================
// INVOICE GENERATOR
// ==========================================

function showInvoiceModal(transaction) {
    document.getElementById('invoiceModal').classList.add('active');
    
    const settings = JSON.parse(localStorage.getItem('settings')) || {};
    
    document.getElementById('invoiceShopName').textContent = settings.shopName || 'POS Shop';
    document.getElementById('invoiceShopAddress').textContent = settings.shopAddress || 'Shop Address';
    document.getElementById('invoiceShopContact').textContent = settings.shopContact || 'Contact';
    
    document.getElementById('invoiceNumber').textContent = transaction?.receiptNumber || 'INV-' + Date.now();
    document.getElementById('invoiceDate').textContent = new Date().toLocaleDateString();
    document.getElementById('invoiceCustomer').textContent = transaction?.customer || 'Walk-in Customer';
    document.getElementById('invoiceCustomerContact').textContent = transaction?.customerContact || '-';
    
    const itemsBody = document.getElementById('invoiceItems');
    itemsBody.innerHTML = '';
    
    let subtotal = 0;
    (transaction?.items || []).forEach(item => {
        subtotal += item.total;
        itemsBody.innerHTML += `
            <tr>
                <td style="padding: 10px; border: 1px solid #ddd;">${item.name}</td>
                <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">${item.quantity}</td>
                <td style="padding: 10px; border: 1px solid #ddd; text-align: right;">Rs. ${item.price.toLocaleString()}</td>
                <td style="padding: 10px; border: 1px solid #ddd; text-align: right;">Rs. ${item.total.toLocaleString()}</td>
            </tr>
        `;
    });
    
    const tax = subtotal * (settings.taxRate || 0) / 100;
    
    document.getElementById('invoiceSubtotal').textContent = subtotal.toLocaleString();
    document.getElementById('invoiceTax').textContent = tax.toLocaleString();
    document.getElementById('invoiceTotal').textContent = (subtotal + tax).toLocaleString();
}

function closeInvoiceModal() {
    document.getElementById('invoiceModal').classList.remove('active');
}

function printInvoice() {
    const invoiceContent = document.getElementById('invoicePreview').innerHTML;
    const printWindow = window.open('', '', 'width=800,height=600');
    printWindow.document.write(`
        <html>
        <head><title>Invoice</title></head>
        <body style="font-family: Arial, sans-serif; padding: 20px;">
            ${invoiceContent}
        </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
}

function downloadInvoicePDF() {
    alert('📥 PDF download feature coming soon!');
}

// ==========================================
// PROMO CODE MANAGEMENT
// ==========================================

function showAddPromoModal() {
    document.getElementById('addPromoModal').classList.add('active');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 30);
    document.getElementById('promoValidTill').value = tomorrow.toISOString().split('T')[0];
}

function closeAddPromoModal() {
    document.getElementById('addPromoModal').classList.remove('active');
    document.getElementById('addPromoForm').reset();
}

function generatePromoCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    document.getElementById('promoCode').value = code;
}

document.getElementById('addPromoForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const promoData = {
        code: document.getElementById('promoCode').value.toUpperCase(),
        discount: parseInt(document.getElementById('promoDiscount').value),
        maxUsage: parseInt(document.getElementById('promoMaxUsage').value) || 0,
        validTill: document.getElementById('promoValidTill').value,
        usageCount: 0,
        createdAt: new Date().toISOString()
    };
    
    let promos = JSON.parse(localStorage.getItem('promos')) || [];
    
    if (promos.find(p => p.code === promoData.code)) {
        alert('❌ Promo code already exists!');
        return;
    }
    
    promos.push(promoData);
    localStorage.setItem('promos', JSON.stringify(promos));
    
    logActivity('promo', `Created promo code: ${promoData.code}`);
    
    closeAddPromoModal();
    loadPromos();
    alert('✅ Promo code created!');
});

// ==========================================
// DISCOUNT MANAGEMENT
// ==========================================

function showAddDiscountModal() {
    document.getElementById('addDiscountModal').classList.add('active');
    loadDiscountProducts();
}

function closeAddDiscountModal() {
    document.getElementById('addDiscountModal').classList.remove('active');
    document.getElementById('addDiscountForm').reset();
}

function loadDiscountProducts() {
    const products = JSON.parse(localStorage.getItem('products')) || [];
    const select = document.getElementById('discountProduct');
    select.innerHTML = '<option value="">Choose Product</option>';
    
    products.forEach(p => {
        select.innerHTML += `<option value="${p.name}">${p.name} - Rs. ${p.price}</option>`;
    });
}

document.getElementById('addDiscountForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const discountData = {
        product: document.getElementById('discountProduct').value,
        percentage: parseInt(document.getElementById('discountPercentage').value),
        validTill: document.getElementById('discountValidTill').value,
        createdAt: new Date().toISOString()
    };
    
    let discounts = JSON.parse(localStorage.getItem('discounts')) || [];
    discounts.push(discountData);
    localStorage.setItem('discounts', JSON.stringify(discounts));
    
    logActivity('discount', `Added ${discountData.percentage}% discount on ${discountData.product}`);
    
    closeAddDiscountModal();
    loadDiscounts();
    alert('✅ Discount added!');
});

// ==========================================
// LOYALTY PROGRAM
// ==========================================

function showAddLoyaltyModal() {
    document.getElementById('addLoyaltyModal').classList.add('active');
}

function closeAddLoyaltyModal() {
    document.getElementById('addLoyaltyModal').classList.remove('active');
    document.getElementById('addLoyaltyForm').reset();
}

document.getElementById('addLoyaltyForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const loyaltyData = {
        customerName: document.getElementById('loyaltyCustomerName').value,
        contact: document.getElementById('loyaltyContact').value,
        points: parseInt(document.getElementById('loyaltyPoints').value) || 0,
        tier: document.getElementById('loyaltyTier').value,
        rewards: 0,
        joinedAt: new Date().toISOString()
    };
    
    let loyalty = JSON.parse(localStorage.getItem('loyalty')) || [];
    loyalty.push(loyaltyData);
    localStorage.setItem('loyalty', JSON.stringify(loyalty));
    
    logActivity('loyalty', `Added loyalty member: ${loyaltyData.customerName}`);
    
    closeAddLoyaltyModal();
    loadLoyalty();
    alert('✅ Loyalty member added!');
});

// Add loyalty points on purchase
function addLoyaltyPoints(customerContact, amount) {
    let loyalty = JSON.parse(localStorage.getItem('loyalty')) || [];
    const memberIndex = loyalty.findIndex(m => m.contact === customerContact);
    
    if (memberIndex !== -1) {
        const pointsEarned = Math.floor(amount / 100);
        loyalty[memberIndex].points += pointsEarned;
        
        // Update tier
        const points = loyalty[memberIndex].points;
        if (points > 5000) loyalty[memberIndex].tier = 'Platinum';
        else if (points > 1000) loyalty[memberIndex].tier = 'Gold';
        else if (points > 500) loyalty[memberIndex].tier = 'Silver';
        
        localStorage.setItem('loyalty', JSON.stringify(loyalty));
    }
}


// ==========================================
// EXPENSE TRACKING
// ==========================================

function showExpenseModal() {
    document.getElementById('expenseModal').classList.add('active');
    loadExpenses();
    calculateExpenseTotals();
}

function closeExpenseModal() {
    document.getElementById('expenseModal').classList.remove('active');
}

function loadExpenses() {
    const expenses = JSON.parse(localStorage.getItem('expenses')) || [];
    const tbody = document.getElementById('expenseBody');
    tbody.innerHTML = '';
    
    if (expenses.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 40px; color: #999;">No expenses recorded</td></tr>';
        return;
    }
    
    expenses.reverse().forEach((expense, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${new Date(expense.date).toLocaleDateString()}</td>
            <td><span style="background: #667eea; color: white; padding: 2px 8px; border-radius: 5px; font-size: 11px;">${expense.category}</span></td>
            <td>${expense.description}</td>
            <td style="color: #dc3545; font-weight: 600;">Rs. ${expense.amount.toLocaleString()}</td>
            <td><button class="action-btn delete-btn" onclick="deleteExpense(${expenses.length - 1 - index})">🗑️</button></td>
        `;
        tbody.appendChild(tr);
    });
}

function calculateExpenseTotals() {
    const expenses = JSON.parse(localStorage.getItem('expenses')) || [];
    const today = new Date().toDateString();
    const now = new Date();
    
    let todayTotal = 0, monthTotal = 0, total = 0;
    
    expenses.forEach(e => {
        const eDate = new Date(e.date);
        total += e.amount;
        if (eDate.toDateString() === today) todayTotal += e.amount;
        if (eDate.getMonth() === now.getMonth() && eDate.getFullYear() === now.getFullYear()) monthTotal += e.amount;
    });
    
    document.getElementById('todayExpenses').textContent = `Rs. ${todayTotal.toLocaleString()}`;
    document.getElementById('monthExpenses').textContent = `Rs. ${monthTotal.toLocaleString()}`;
    document.getElementById('totalExpensesAmount').textContent = `Rs. ${total.toLocaleString()}`;
}

function showAddExpenseModal() {
    document.getElementById('addExpenseModal').classList.add('active');
    document.getElementById('expenseDate').value = new Date().toISOString().split('T')[0];
}

function closeAddExpenseModal() {
    document.getElementById('addExpenseModal').classList.remove('active');
    document.getElementById('addExpenseForm').reset();
}

document.getElementById('addExpenseForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const expenseData = {
        category: document.getElementById('expenseCategory').value,
        amount: parseFloat(document.getElementById('expenseAmount').value),
        description: document.getElementById('expenseDescription').value,
        date: document.getElementById('expenseDate').value,
        addedBy: currentUser.username,
        addedAt: new Date().toISOString()
    };
    
    let expenses = JSON.parse(localStorage.getItem('expenses')) || [];
    expenses.push(expenseData);
    localStorage.setItem('expenses', JSON.stringify(expenses));
    
    logActivity('expense', `Added expense: ${expenseData.category} - Rs. ${expenseData.amount}`);
    
    closeAddExpenseModal();
    loadExpenses();
    calculateExpenseTotals();
    alert('✅ Expense added!');
});

function deleteExpense(index) {
    if (confirm('Delete this expense?')) {
        let expenses = JSON.parse(localStorage.getItem('expenses')) || [];
        expenses.splice(index, 1);
        localStorage.setItem('expenses', JSON.stringify(expenses));
        loadExpenses();
        calculateExpenseTotals();
    }
}

// ==========================================
// CASH REGISTER
// ==========================================

function showCashRegister() {
    document.getElementById('cashRegisterModal').classList.add('active');
    loadCashRegister();
}

function closeCashRegister() {
    document.getElementById('cashRegisterModal').classList.remove('active');
}

function loadCashRegister() {
    const today = new Date().toDateString();
    const cashRegister = JSON.parse(localStorage.getItem('cashRegister')) || {};
    const todayData = cashRegister[today] || { opening: 0, transactions: [] };
    
    let cashIn = 0, cashOut = 0;
    todayData.transactions.forEach(t => {
        if (t.type === 'in') cashIn += t.amount;
        else cashOut += t.amount;
    });
    
    // Get today's cash sales
    const transactions = JSON.parse(localStorage.getItem('transactions')) || [];
    const todaySales = transactions.filter(t => new Date(t.date).toDateString() === today && t.paymentMethod === 'cash')
        .reduce((sum, t) => sum + t.total, 0);
    
    const current = todayData.opening + cashIn + todaySales - cashOut;
    
    document.getElementById('openingBalance').textContent = `Rs. ${todayData.opening.toLocaleString()}`;
    document.getElementById('currentBalance').textContent = `Rs. ${current.toLocaleString()}`;
    
    // Load transactions
    const tbody = document.getElementById('cashRegisterBody');
    tbody.innerHTML = '';
    
    todayData.transactions.forEach(t => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${new Date(t.time).toLocaleTimeString()}</td>
            <td><span style="background: ${t.type === 'in' ? '#28a745' : '#dc3545'}; color: white; padding: 2px 8px; border-radius: 5px;">${t.type === 'in' ? 'Cash In' : 'Cash Out'}</span></td>
            <td style="color: ${t.type === 'in' ? '#28a745' : '#dc3545'}; font-weight: 600;">Rs. ${t.amount.toLocaleString()}</td>
            <td>${t.note}</td>
        `;
        tbody.appendChild(tr);
    });
}

function setOpeningBalance() {
    const amount = prompt('Enter opening balance:');
    if (amount && !isNaN(amount)) {
        const today = new Date().toDateString();
        let cashRegister = JSON.parse(localStorage.getItem('cashRegister')) || {};
        if (!cashRegister[today]) cashRegister[today] = { opening: 0, transactions: [] };
        cashRegister[today].opening = parseFloat(amount);
        localStorage.setItem('cashRegister', JSON.stringify(cashRegister));
        loadCashRegister();
        alert('✅ Opening balance set!');
    }
}

function addCashIn() {
    const amount = prompt('Enter cash in amount:');
    const note = prompt('Note (optional):') || 'Cash In';
    if (amount && !isNaN(amount)) {
        addCashTransaction('in', parseFloat(amount), note);
    }
}

function addCashOut() {
    const amount = prompt('Enter cash out amount:');
    const note = prompt('Note (optional):') || 'Cash Out';
    if (amount && !isNaN(amount)) {
        addCashTransaction('out', parseFloat(amount), note);
    }
}

function addCashTransaction(type, amount, note) {
    const today = new Date().toDateString();
    let cashRegister = JSON.parse(localStorage.getItem('cashRegister')) || {};
    if (!cashRegister[today]) cashRegister[today] = { opening: 0, transactions: [] };
    
    cashRegister[today].transactions.push({
        type: type,
        amount: amount,
        note: note,
        time: new Date().toISOString()
    });
    
    localStorage.setItem('cashRegister', JSON.stringify(cashRegister));
    loadCashRegister();
    alert(`✅ Cash ${type} recorded!`);
}

// ==========================================
// KEYBOARD SHORTCUTS
// ==========================================

function showShortcutsModal() {
    document.getElementById('shortcutsModal').classList.add('active');
}

function closeShortcutsModal() {
    document.getElementById('shortcutsModal').classList.remove('active');
}

// Add more keyboard shortcuts
document.addEventListener('keydown', function(e) {
    if (e.key === 'F3') {
        e.preventDefault();
        showBarcodeModal();
    }
    if (e.key === 'F4') {
        e.preventDefault();
        showInventoryManagement();
    }
    if (e.key === 'F5') {
        e.preventDefault();
        showFinancialReports();
    }
    if (e.key === 'F7') {
        e.preventDefault();
        showShortcutsModal();
    }
});

// ==========================================
// SUPPLIER EDIT & LEDGER
// ==========================================

let currentSupplierIndex = -1;

function editSupplier(index) {
    const suppliers = JSON.parse(localStorage.getItem('suppliers')) || [];
    const supplier = suppliers[index];
    
    document.getElementById('supplierName').value = supplier.name;
    document.getElementById('supplierContact').value = supplier.contact;
    document.getElementById('supplierEmail').value = supplier.email || '';
    document.getElementById('supplierAddress').value = supplier.address || '';
    
    currentSupplierIndex = index;
    document.getElementById('addSupplierModal').classList.add('active');
}

function showSupplierLedger(index) {
    currentSupplierIndex = index;
    const suppliers = JSON.parse(localStorage.getItem('suppliers')) || [];
    const supplier = suppliers[index];
    
    document.getElementById('supplierLedgerTitle').textContent = `📒 ${supplier.name} - Ledger`;
    document.getElementById('supplierLedgerInfo').innerHTML = `
        <strong>Contact:</strong> ${supplier.contact} | <strong>Balance:</strong> Rs. ${(supplier.balance || 0).toLocaleString()}
    `;
    
    loadSupplierLedgerEntries(index);
    document.getElementById('supplierLedgerModal').classList.add('active');
}

function closeSupplierLedger() {
    document.getElementById('supplierLedgerModal').classList.remove('active');
}

function loadSupplierLedgerEntries(index) {
    const suppliers = JSON.parse(localStorage.getItem('suppliers')) || [];
    const ledger = suppliers[index].ledger || [];
    const tbody = document.getElementById('supplierLedgerBody');
    tbody.innerHTML = '';
    
    if (ledger.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 40px;">No transactions</td></tr>';
        return;
    }
    
    let balance = 0;
    ledger.forEach(entry => {
        if (entry.type === 'debit') balance += entry.amount;
        else balance -= entry.amount;
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${new Date(entry.date).toLocaleDateString()}</td>
            <td>${entry.description}</td>
            <td style="color: #dc3545;">${entry.type === 'debit' ? 'Rs. ' + entry.amount.toLocaleString() : '-'}</td>
            <td style="color: #28a745;">${entry.type === 'credit' ? 'Rs. ' + entry.amount.toLocaleString() : '-'}</td>
            <td style="font-weight: 600;">Rs. ${balance.toLocaleString()}</td>
        `;
        tbody.appendChild(tr);
    });
}

function showAddSupplierPayment() {
    const amount = prompt('Enter payment amount:');
    const desc = prompt('Description:') || 'Payment';
    
    if (amount && !isNaN(amount)) {
        let suppliers = JSON.parse(localStorage.getItem('suppliers')) || [];
        if (!suppliers[currentSupplierIndex].ledger) suppliers[currentSupplierIndex].ledger = [];
        
        suppliers[currentSupplierIndex].ledger.push({
            type: 'credit',
            amount: parseFloat(amount),
            description: desc,
            date: new Date().toISOString()
        });
        
        suppliers[currentSupplierIndex].balance = (suppliers[currentSupplierIndex].balance || 0) - parseFloat(amount);
        localStorage.setItem('suppliers', JSON.stringify(suppliers));
        
        loadSupplierLedgerEntries(currentSupplierIndex);
        alert('✅ Payment recorded!');
    }
}
