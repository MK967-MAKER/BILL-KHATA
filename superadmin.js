// Initialize data
function initDashboard() {
    loadStats();
    loadUsers();
    loadAdmins();
    loadRequests();
    loadMessages();
    loadActivity();
    loadNotifications();
}

function showSection(sectionName) {
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    document.getElementById(sectionName).classList.add('active');
    event.target.classList.add('active');
    
    const titles = {
        overview: 'Dashboard Overview',
        users: 'User Management',
        admins: 'Admin Management',
        requests: 'Forget Key Requests',
        messages: 'User Messages',
        notifications: 'Chatbot Notifications',
        settings: 'System Settings'
    };
    
    // Load notifications if that section is shown
    if (sectionName === 'notifications') {
        loadNotifications();
    }
    
    document.getElementById('pageTitle').textContent = titles[sectionName];
}

function loadStats() {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const admins = JSON.parse(localStorage.getItem('admins')) || [];
    const licenseRequests = JSON.parse(localStorage.getItem('licenseRequests')) || [];
    const messages = JSON.parse(localStorage.getItem('adminMessages')) || [];
    
    const now = new Date();
    let purchased = 0;
    let active = 0;
    let expired = 0;
    let expiring = 0;
    
    users.forEach(user => {
        if (user.licenseType && user.licenseType !== 'trial') {
            purchased++;
        }
        
        if (user.expiryDate) {
            const expiryDate = new Date(user.expiryDate);
            const daysLeft = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));
            
            if (daysLeft < 0) {
                expired++;
            } else if (daysLeft <= 7) {
                expiring++;
            } else {
                active++;
            }
        }
    });
    
    document.getElementById('totalUsersBtn').textContent = users.length;
    document.getElementById('purchasedUsers').textContent = purchased;
    document.getElementById('activeUsers').textContent = active;
    document.getElementById('expiredUsers').textContent = expired;
    document.getElementById('expiringUsers').textContent = expiring;
    
    document.getElementById('totalAdmins').textContent = admins.length;
    document.getElementById('pendingRequests').textContent = licenseRequests.filter(r => r.status === 'pending').length;
    document.getElementById('totalMessages').textContent = messages.length;
}

function loadUsers() {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const tbody = document.getElementById('usersTableBody');
    const filter = document.getElementById('userFilter')?.value || 'all';
    const now = new Date();
    
    tbody.innerHTML = '';
    
    users.forEach((user, index) => {
        // Calculate license status
        let status = 'Trial';
        let statusClass = 'status-pending';
        let daysLeft = 0;
        let daysLeftClass = '';
        
        if (user.expiryDate) {
            const expiryDate = new Date(user.expiryDate);
            daysLeft = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));
            
            if (daysLeft < 0) {
                status = 'Expired';
                statusClass = 'status-expired';
                daysLeft = 0;
                daysLeftClass = 'critical';
            } else if (daysLeft <= 7) {
                status = 'Expiring Soon';
                statusClass = 'status-expiring';
                daysLeftClass = 'critical';
            } else {
                status = user.licenseType === 'lifetime' ? 'Lifetime' : 'Active';
                statusClass = 'status-active';
                daysLeftClass = daysLeft <= 30 ? 'warning' : 'good';
            }
        }
        
        if (user.licenseType && user.licenseType !== 'trial') {
            statusClass = 'status-purchased';
        }
        
        // Apply filter
        if (filter !== 'all') {
            if (filter === 'purchased' && (user.licenseType === 'trial' || !user.licenseType)) return;
            if (filter === 'active' && (daysLeft <= 7 || daysLeft === 0)) return;
            if (filter === 'expired' && daysLeft !== 0) return;
            if (filter === 'expiring' && (daysLeft > 7 || daysLeft === 0)) return;
        }
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><a href="user-profile.html?id=${index}" style="color: #667eea; text-decoration: none; cursor: pointer; font-weight: 500;">${user.username}</a></td>
            <td>${user.mobile || user.email || 'N/A'}</td>
            <td><span class="status-badge ${statusClass}">${status}</span></td>
            <td>${user.expiryDate ? new Date(user.expiryDate).toLocaleDateString() : 'N/A'}</td>
            <td><span class="days-left ${daysLeftClass}">${daysLeft > 0 ? daysLeft + ' days' : 'Expired'}</span></td>
            <td>
                <button class="action-btn edit-btn" onclick="editUser(${index})">Edit</button>
                <button class="action-btn delete-btn" onclick="deleteUser(${index})">Delete</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function loadAdmins() {
    const admins = JSON.parse(localStorage.getItem('admins')) || [];
    const tbody = document.getElementById('adminsTableBody');
    
    tbody.innerHTML = '';
    admins.forEach((admin, index) => {
        const tr = document.createElement('tr');
        const maskedPassword = '•'.repeat(admin.password.length);
        tr.innerHTML = `
            <td>${admin.username}</td>
            <td>${admin.email}</td>
            <td>
                <span id="pwd-${index}">${maskedPassword}</span>
                <button class="action-btn" onclick="togglePassword(${index})" style="background: #17a2b8; color: white; margin-left: 5px;">👁️</button>
            </td>
            <td><span class="status-badge status-active">Active</span></td>
            <td>
                <button class="action-btn edit-btn" onclick="editAdmin(${index})">Edit</button>
                <button class="action-btn delete-btn" onclick="deleteAdmin(${index})">Delete</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function togglePassword(index) {
    const admins = JSON.parse(localStorage.getItem('admins')) || [];
    const pwdSpan = document.getElementById(`pwd-${index}`);
    
    if (pwdSpan.textContent === '•'.repeat(admins[index].password.length)) {
        pwdSpan.textContent = admins[index].password;
    } else {
        pwdSpan.textContent = '•'.repeat(admins[index].password.length);
    }
}

function editAdmin(index) {
    const admins = JSON.parse(localStorage.getItem('admins')) || [];
    const admin = admins[index];
    
    document.getElementById('editAdminIndex').value = index;
    document.getElementById('editAdminUsername').value = admin.username;
    document.getElementById('editAdminEmail').value = admin.email;
    document.getElementById('editAdminPassword').value = admin.password;
    
    document.getElementById('editAdminModal').classList.add('active');
}

function loadRequests() {
    const requestsList = document.getElementById('requestsList');
    let forgetRequests = JSON.parse(localStorage.getItem('forgetRequests')) || [];
    
    if (forgetRequests.length === 0) {
        requestsList.innerHTML = '<p>No forget key requests</p>';
        return;
    }
    
    requestsList.innerHTML = '';
    forgetRequests.forEach((request, index) => {
        const requestDiv = document.createElement('div');
        requestDiv.className = 'request-item';
        requestDiv.innerHTML = `
            <h3>User: ${request.username}</h3>
            <p>Reason: ${request.reason}</p>
            <div class="key-display">Key: ${request.forgetKey}</div>
            <p>Status: <span class="status-badge status-${request.status}">${request.status.toUpperCase()}</span></p>
            <p>Date: ${new Date(request.timestamp).toLocaleString()}</p>
            ${request.status === 'pending' ? `
                <button class="approve-btn" onclick="approveRequest(${index})">Approve</button>
                <button class="reject-btn" onclick="rejectRequest(${index})">Reject</button>
            ` : ''}
        `;
        requestsList.appendChild(requestDiv);
    });
}

function loadMessages() {
    const messagesList = document.getElementById('messagesList');
    let adminMessages = JSON.parse(localStorage.getItem('adminMessages')) || [];
    
    if (adminMessages.length === 0) {
        messagesList.innerHTML = '<p>No messages from users</p>';
        return;
    }
    
    messagesList.innerHTML = '';
    adminMessages.forEach(msg => {
        const msgDiv = document.createElement('div');
        msgDiv.className = 'request-item';
        msgDiv.innerHTML = `
            <h3>From: ${msg.from}</h3>
            <p>${msg.message}</p>
            <p style="font-size: 12px; color: #999;">${new Date(msg.timestamp).toLocaleString()}</p>
        `;
        messagesList.appendChild(msgDiv);
    });
}

function loadActivity() {
    const activityList = document.getElementById('activityList');
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const requests = JSON.parse(localStorage.getItem('forgetRequests')) || [];
    const messages = JSON.parse(localStorage.getItem('adminMessages')) || [];
    const activityLog = JSON.parse(localStorage.getItem('activityLog')) || [];
    
    let activities = [];
    
    // Add sales activities from activity log
    activityLog.forEach(activity => {
        activities.push({
            text: activity.text,
            time: new Date(activity.timestamp).toLocaleString(),
            icon: activity.type === 'sale' ? '💰' : '📦',
            details: activity.details || ''
        });
    });
    
    users.slice(-5).forEach(user => {
        activities.push({
            text: `New user registered: ${user.username}`,
            time: 'Recently',
            icon: '👤'
        });
    });
    
    requests.slice(-5).forEach(req => {
        activities.push({
            text: `Password reset request from ${req.username}`,
            time: new Date(req.timestamp).toLocaleString(),
            icon: '🔑'
        });
    });
    
    messages.slice(-5).forEach(msg => {
        activities.push({
            text: `New message from ${msg.from}`,
            time: new Date(msg.timestamp).toLocaleString(),
            icon: '💬'
        });
    });
    
    activityList.innerHTML = '';
    
    if (activities.length === 0) {
        activityList.innerHTML = '<p style="text-align: center; padding: 20px; color: #999;">No recent activity</p>';
        return;
    }
    
    activities.slice(0, 15).forEach(activity => {
        const activityDiv = document.createElement('div');
        activityDiv.className = 'activity-item';
        
        let detailsHTML = '';
        if (activity.details) {
            // Check if receipt number exists
            if (activity.receiptNumber) {
                detailsHTML = `<small style="color: #999;">
                    <a href="#" onclick="viewReceiptDetails('${activity.receiptNumber}'); return false;" 
                       style="color: #667eea; text-decoration: underline; cursor: pointer;">
                       ${activity.details}
                    </a>
                </small><br>`;
            } else {
                detailsHTML = `<small style="color: #999;">${activity.details}</small><br>`;
            }
        }
        
        activityDiv.innerHTML = `
            <p>${activity.icon || '📌'} ${activity.text}</p>
            ${detailsHTML}
            <small style="color: #999;">${activity.time}</small>
        `;
        activityList.appendChild(activityDiv);
    });
}

function approveRequest(index) {
    let forgetRequests = JSON.parse(localStorage.getItem('forgetRequests')) || [];
    forgetRequests[index].status = 'approved';
    localStorage.setItem('forgetRequests', JSON.stringify(forgetRequests));
    loadRequests();
    loadStats();
    alert('Request approved!');
}

function rejectRequest(index) {
    let forgetRequests = JSON.parse(localStorage.getItem('forgetRequests')) || [];
    forgetRequests[index].status = 'rejected';
    localStorage.setItem('forgetRequests', JSON.stringify(forgetRequests));
    loadRequests();
    loadStats();
    alert('Request rejected.');
}

function deleteUser(index) {
    if (confirm('Are you sure you want to delete this user?')) {
        let users = JSON.parse(localStorage.getItem('users')) || [];
        users.splice(index, 1);
        localStorage.setItem('users', JSON.stringify(users));
        loadUsers();
        loadStats();
    }
}

function deleteAdmin(index) {
    if (confirm('Are you sure you want to delete this admin?')) {
        let admins = JSON.parse(localStorage.getItem('admins')) || [];
        admins.splice(index, 1);
        localStorage.setItem('admins', JSON.stringify(admins));
        loadAdmins();
        loadStats();
    }
}

function editUser(index) {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users[index];
    
    if (!user) {
        alert('User not found!');
        return;
    }
    
    document.getElementById('editUserIndex').value = index;
    document.getElementById('editUsername').value = user.username || '';
    document.getElementById('editMobile').value = user.mobile || '';
    document.getElementById('editEmail').value = user.email || '';
    document.getElementById('editPassword').value = '';
    document.getElementById('editLicenseType').value = user.licenseType || 'trial';
    document.getElementById('editUserStatus').value = user.status || 'active';
    
    // Load features
    const features = user.features || {};
    document.getElementById('feat_inventory').checked = features.inventory !== false;
    document.getElementById('feat_clients').checked = features.clients !== false;
    document.getElementById('feat_subdealers').checked = features.subdealers !== false;
    document.getElementById('feat_reports').checked = features.reports !== false;
    document.getElementById('feat_expenses').checked = features.expenses !== false;
    document.getElementById('feat_cashRegister').checked = features.cashRegister !== false;
    document.getElementById('feat_purchaseOrders').checked = features.purchaseOrders !== false;
    document.getElementById('feat_discounts').checked = features.discounts !== false;
    document.getElementById('feat_returns').checked = features.returns !== false;
    document.getElementById('feat_suppliers').checked = features.suppliers !== false;
    document.getElementById('feat_users').checked = features.users !== false;
    document.getElementById('feat_backup').checked = features.backup !== false;
    document.getElementById('feat_settings').checked = features.settings !== false;
    document.getElementById('feat_activityLogs').checked = features.activityLogs !== false;
    document.getElementById('feat_barcode').checked = features.barcode !== false;
    
    document.getElementById('editUserModal').classList.add('active');
}

// Edit User Form Submit
document.getElementById('editUserForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const index = parseInt(document.getElementById('editUserIndex').value);
    let users = JSON.parse(localStorage.getItem('users')) || [];
    
    users[index].username = document.getElementById('editUsername').value;
    users[index].mobile = document.getElementById('editMobile').value;
    users[index].email = document.getElementById('editEmail').value;
    users[index].licenseType = document.getElementById('editLicenseType').value;
    users[index].status = document.getElementById('editUserStatus').value;
    
    const newPassword = document.getElementById('editPassword').value;
    if (newPassword) {
        users[index].password = newPassword;
    }
    
    // Save features
    users[index].features = {
        inventory: document.getElementById('feat_inventory').checked,
        clients: document.getElementById('feat_clients').checked,
        subdealers: document.getElementById('feat_subdealers').checked,
        reports: document.getElementById('feat_reports').checked,
        expenses: document.getElementById('feat_expenses').checked,
        cashRegister: document.getElementById('feat_cashRegister').checked,
        purchaseOrders: document.getElementById('feat_purchaseOrders').checked,
        discounts: document.getElementById('feat_discounts').checked,
        returns: document.getElementById('feat_returns').checked,
        suppliers: document.getElementById('feat_suppliers').checked,
        users: document.getElementById('feat_users').checked,
        backup: document.getElementById('feat_backup').checked,
        settings: document.getElementById('feat_settings').checked,
        activityLogs: document.getElementById('feat_activityLogs').checked,
        barcode: document.getElementById('feat_barcode').checked
    };
    
    users[index].updatedAt = new Date().toISOString();
    
    localStorage.setItem('users', JSON.stringify(users));
    closeModal('editUserModal');
    loadUsers();
    alert('✅ User updated successfully!');
});

function showAddUserModal() {
    document.getElementById('addUserModal').classList.add('active');
}

function showAddAdminModal() {
    document.getElementById('addAdminModal').classList.add('active');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

document.getElementById('addUserForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const licenseType = document.getElementById('licenseType').value;
    let expiryDate = new Date();
    
    // Calculate expiry date and fee based on license type
    let licenseFee = 0;
    switch(licenseType) {
        case 'monthly':
            expiryDate.setDate(expiryDate.getDate() + 30);
            licenseFee = 1000;
            break;
        case 'lifetime':
            expiryDate.setFullYear(expiryDate.getFullYear() + 100);
            licenseFee = 5000;
            break;
    }
    
    const newUser = {
        username: document.getElementById('newUsername').value,
        password: document.getElementById('newPassword').value,
        mobile: document.getElementById('newMobile').value,
        email: document.getElementById('newEmail').value,
        licenseType: licenseType,
        licenseFee: licenseFee,
        expiryDate: expiryDate.toISOString(),
        createdDate: new Date().toISOString()
    };
    
    let users = JSON.parse(localStorage.getItem('users')) || [];
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    closeModal('addUserModal');
    loadUsers();
    loadStats();
    this.reset();
    alert('User added successfully!');
});

document.getElementById('addAdminForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const newAdmin = {
        username: document.getElementById('newAdminUsername').value,
        password: document.getElementById('newAdminPassword').value,
        email: document.getElementById('newAdminEmail').value
    };
    
    let admins = JSON.parse(localStorage.getItem('admins')) || [];
    admins.push(newAdmin);
    localStorage.setItem('admins', JSON.stringify(admins));
    
    closeModal('addAdminModal');
    loadAdmins();
    loadStats();
    this.reset();
    alert('Admin added successfully!');
});

document.getElementById('editAdminForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const index = document.getElementById('editAdminIndex').value;
    const updatedAdmin = {
        username: document.getElementById('editAdminUsername').value,
        password: document.getElementById('editAdminPassword').value,
        email: document.getElementById('editAdminEmail').value
    };
    
    let admins = JSON.parse(localStorage.getItem('admins')) || [];
    admins[index] = updatedAdmin;
    localStorage.setItem('admins', JSON.stringify(admins));
    
    closeModal('editAdminModal');
    loadAdmins();
    alert('Admin updated successfully!');
});

function toggleEditPassword() {
    const pwdInput = document.getElementById('editAdminPassword');
    if (pwdInput.type === 'password') {
        pwdInput.type = 'text';
    } else {
        pwdInput.type = 'password';
    }
}

function clearAllData() {
    if (confirm('Are you sure? This will delete all data!')) {
        localStorage.clear();
        alert('All data cleared!');
        location.reload();
    }
}

function exportData() {
    const data = {
        users: JSON.parse(localStorage.getItem('users')) || [],
        admins: JSON.parse(localStorage.getItem('admins')) || [],
        requests: JSON.parse(localStorage.getItem('forgetRequests')) || [],
        messages: JSON.parse(localStorage.getItem('adminMessages')) || []
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'pos-data-export.json';
    link.click();
}

// View receipt details
function viewReceiptDetails(receiptNumber) {
    const transactions = JSON.parse(localStorage.getItem('transactions')) || [];
    const transaction = transactions.find(t => t.receiptNumber === receiptNumber);
    
    if (!transaction) {
        alert('Receipt not found!');
        return;
    }
    
    const printerSettings = JSON.parse(localStorage.getItem('printerSettings')) || {};
    const currency = printerSettings.currency || 'Rs.';
    const date = new Date(transaction.date);
    
    // Get client info if credit sale
    let clientInfo = '';
    if (transaction.paymentMethod === 'credit' && transaction.clientId !== null) {
        const clients = JSON.parse(localStorage.getItem('clients')) || [];
        const client = clients[transaction.clientId];
        if (client) {
            clientInfo = `
                <div style="background: #fff3cd; padding: 10px; border-radius: 5px; margin: 10px 0;">
                    <strong>Credit Sale to:</strong> ${client.name}<br>
                    <strong>Contact:</strong> ${client.contact}
                </div>
            `;
        }
    }
    
    // Build items list
    let itemsList = '';
    transaction.items.forEach(item => {
        itemsList += `
            <tr>
                <td style="padding: 5px; border-bottom: 1px solid #e0e0e0;">${item.name}</td>
                <td style="padding: 5px; border-bottom: 1px solid #e0e0e0; text-align: center;">${item.quantity}</td>
                <td style="padding: 5px; border-bottom: 1px solid #e0e0e0; text-align: right;">${currency} ${item.price.toLocaleString()}</td>
                <td style="padding: 5px; border-bottom: 1px solid #e0e0e0; text-align: right;">${currency} ${item.total.toLocaleString()}</td>
            </tr>
        `;
    });
    
    const paymentBadge = transaction.paymentMethod === 'cash' 
        ? '<span style="background: #28a745; color: white; padding: 3px 10px; border-radius: 5px; font-size: 12px;">CASH</span>'
        : '<span style="background: #ffc107; color: #333; padding: 3px 10px; border-radius: 5px; font-size: 12px;">CREDIT</span>';
    
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.style.cssText = 'display: flex; position: fixed; z-index: 10000; left: 0; top: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); align-items: center; justify-content: center;';
    
    modal.innerHTML = `
        <div style="background: white; padding: 30px; border-radius: 15px; max-width: 600px; width: 90%; max-height: 90vh; overflow-y: auto; position: relative;">
            <span onclick="this.parentElement.parentElement.remove()" style="position: absolute; right: 20px; top: 20px; font-size: 28px; cursor: pointer; color: #999;">&times;</span>
            
            <h2 style="color: #333; margin-bottom: 20px;">📄 Receipt Details</h2>
            
            <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                    <div>
                        <strong>Receipt #:</strong> ${receiptNumber}<br>
                        <strong>Date:</strong> ${date.toLocaleDateString()}<br>
                        <strong>Time:</strong> ${date.toLocaleTimeString()}
                    </div>
                    <div>
                        <strong>Admin:</strong> ${transaction.admin}<br>
                        <strong>Payment:</strong> ${paymentBadge}
                    </div>
                </div>
            </div>
            
            ${clientInfo}
            
            <h3 style="color: #333; margin: 20px 0 10px 0;">Items Sold:</h3>
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="background: #667eea; color: white;">
                        <th style="padding: 8px; text-align: left;">Item</th>
                        <th style="padding: 8px; text-align: center;">Qty</th>
                        <th style="padding: 8px; text-align: right;">Price</th>
                        <th style="padding: 8px; text-align: right;">Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsList}
                </tbody>
            </table>
            
            <div style="margin-top: 20px; padding: 15px; background: #f8f9fa; border-radius: 8px;">
                <div style="display: flex; justify-content: space-between; margin: 5px 0;">
                    <span>Subtotal:</span>
                    <strong>${currency} ${transaction.subtotal.toLocaleString()}</strong>
                </div>
                ${transaction.tax > 0 ? `
                <div style="display: flex; justify-content: space-between; margin: 5px 0;">
                    <span>Tax:</span>
                    <strong>${currency} ${transaction.tax.toLocaleString()}</strong>
                </div>
                ` : ''}
                <div style="display: flex; justify-content: space-between; margin: 10px 0; padding-top: 10px; border-top: 2px solid #667eea; font-size: 18px;">
                    <span><strong>TOTAL:</strong></span>
                    <strong style="color: #667eea;">${currency} ${transaction.total.toLocaleString()}</strong>
                </div>
                <div style="display: flex; justify-content: space-between; margin: 5px 0;">
                    <span>Paid:</span>
                    <strong>${currency} ${transaction.paid.toLocaleString()}</strong>
                </div>
                <div style="display: flex; justify-content: space-between; margin: 5px 0;">
                    <span>Change:</span>
                    <strong style="color: #28a745;">${currency} ${transaction.change.toLocaleString()}</strong>
                </div>
            </div>
            
            <button onclick="this.parentElement.parentElement.remove()" style="width: 100%; margin-top: 20px; padding: 12px; background: #667eea; color: white; border: none; border-radius: 8px; font-size: 16px; cursor: pointer;">
                Close
            </button>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close on background click
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// Initialize dashboard on load
initDashboard();


function filterUsers(type) {
    // Navigate to user-list page with filter parameter
    window.location.href = `user-list.html?filter=${type}`;
}

function updateLicenseFee() {
    const licenseType = document.getElementById('licenseType').value;
    const feeInput = document.getElementById('licenseFee');
    
    switch(licenseType) {
        case 'monthly':
            feeInput.value = 'Rs. 1,000';
            break;
        case 'lifetime':
            feeInput.value = 'Rs. 5,000';
            break;
    }
}

// Notifications Functions
let currentReplyMessage = null;

function loadNotifications() {
    const adminMessages = JSON.parse(localStorage.getItem('adminMessages')) || [];
    const notificationsList = document.getElementById('notificationsList');
    
    if (!notificationsList) return;
    
    // Update badge
    const unreadCount = adminMessages.filter(msg => !msg.read && !msg.replied).length;
    const badge = document.getElementById('notificationBadge');
    if (badge) {
        if (unreadCount > 0) {
            badge.textContent = unreadCount;
            badge.style.display = 'inline-block';
        } else {
            badge.style.display = 'none';
        }
    }
    
    if (adminMessages.length === 0) {
        notificationsList.innerHTML = '<p style="text-align: center; padding: 40px; color: #999;">No messages yet</p>';
        return;
    }
    
    notificationsList.innerHTML = '';
    
    adminMessages.reverse().forEach((msg, index) => {
        const actualIndex = adminMessages.length - 1 - index;
        const date = new Date(msg.timestamp);
        const isNew = !msg.read && !msg.replied;
        const isReplied = msg.replied;
        
        const messageCard = document.createElement('div');
        messageCard.style.cssText = `
            background: ${isReplied ? '#f5f5f5' : 'white'};
            padding: 20px;
            border-radius: 10px;
            margin-bottom: 15px;
            border: 2px solid ${isNew ? '#dc3545' : '#e0e0e0'};
            opacity: ${isReplied ? '0.7' : '1'};
        `;
        
        let messageContent = '';
        if (msg.type === 'text') {
            messageContent = `
                <div style="margin: 10px 0;">
                    <strong>Message:</strong><br>
                    <div style="background: #f8f9fa; padding: 10px; border-radius: 5px; margin-top: 5px;">
                        ${msg.message}
                    </div>
                </div>
            `;
        } else if (msg.type === 'image') {
            messageContent = `
                <div style="margin: 10px 0;">
                    <strong>Image Message:</strong> ${msg.fileName || 'image.png'}<br>
                    <img src="${msg.message}" alt="User image" 
                         style="max-width: 300px; max-height: 300px; border-radius: 8px; margin-top: 10px; cursor: pointer;"
                         onclick="window.open('${msg.message}', '_blank')">
                </div>
            `;
        }
        
        let replySection = '';
        if (isReplied && msg.replyText) {
            replySection = `
                <div style="background: #e8f5e9; padding: 10px; border-radius: 5px; margin-top: 10px; border-left: 4px solid #28a745;">
                    <strong style="color: #2e7d32;">✅ Your Reply:</strong><br>
                    <div style="color: #2e7d32; margin-top: 5px;">${msg.replyText}</div>
                    <small style="color: #666;">Replied on: ${new Date(msg.replyTime).toLocaleString()}</small>
                </div>
            `;
        }
        
        messageCard.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: start;">
                <div style="flex: 1;">
                    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                        <h3 style="margin: 0;">👤 ${msg.from}</h3>
                        ${isNew ? '<span style="background: #dc3545; color: white; padding: 3px 10px; border-radius: 5px; font-size: 12px;">NEW</span>' : ''}
                        ${isReplied ? '<span style="background: #28a745; color: white; padding: 3px 10px; border-radius: 5px; font-size: 12px;">✅ REPLIED</span>' : ''}
                        <span style="background: #667eea; color: white; padding: 3px 10px; border-radius: 5px; font-size: 12px;">${msg.language || 'ENGLISH'}</span>
                    </div>
                    <small style="color: #999;">${date.toLocaleString()}</small>
                    ${messageContent}
                    ${replySection}
                </div>
            </div>
            ${!isReplied ? `
                <div style="display: flex; gap: 10px; margin-top: 15px;">
                    <button class="btn-primary" onclick="openReplyModal(${actualIndex})" style="flex: 1;">💬 Reply</button>
                    <button class="btn-secondary" onclick="markAsRead(${actualIndex})" style="flex: 1;">✓ Mark as Read</button>
                </div>
            ` : ''}
        `;
        
        notificationsList.appendChild(messageCard);
    });
}

function openReplyModal(index) {
    const adminMessages = JSON.parse(localStorage.getItem('adminMessages')) || [];
    const msg = adminMessages[index];
    
    if (!msg) return;
    
    currentReplyMessage = { index, msg };
    
    const replyUserInfo = document.getElementById('replyUserInfo');
    replyUserInfo.innerHTML = `
        <strong>From:</strong> ${msg.from}<br>
        <strong>Date:</strong> ${new Date(msg.timestamp).toLocaleString()}<br>
        <strong>Original Message:</strong><br>
        <div style="background: white; padding: 10px; border-radius: 5px; margin-top: 5px;">
            ${msg.type === 'text' ? msg.message : 'Image message'}
        </div>
    `;
    
    document.getElementById('replyText').value = '';
    document.getElementById('replyModal').classList.add('active');
}

function sendReply() {
    const replyText = document.getElementById('replyText').value.trim();
    
    if (!replyText) {
        alert('Please enter a reply message!');
        return;
    }
    
    if (!currentReplyMessage) return;
    
    const { index, msg } = currentReplyMessage;
    
    // Update message as replied
    let adminMessages = JSON.parse(localStorage.getItem('adminMessages')) || [];
    adminMessages[index].replied = true;
    adminMessages[index].replyText = replyText;
    adminMessages[index].replyTime = new Date().toISOString();
    adminMessages[index].read = true;
    localStorage.setItem('adminMessages', JSON.stringify(adminMessages));
    
    // Send notification to user
    let userNotifications = JSON.parse(localStorage.getItem('userNotifications')) || [];
    userNotifications.push({
        id: Date.now(),
        username: msg.from,
        title: '💬 Admin Reply',
        message: replyText,
        timestamp: new Date().toISOString(),
        read: false,
        type: 'admin_reply'
    });
    localStorage.setItem('userNotifications', JSON.stringify(userNotifications));
    
    alert('✅ Reply sent successfully!');
    closeModal('replyModal');
    loadNotifications();
    currentReplyMessage = null;
}

function markAsRead(index) {
    let adminMessages = JSON.parse(localStorage.getItem('adminMessages')) || [];
    adminMessages[index].read = true;
    localStorage.setItem('adminMessages', JSON.stringify(adminMessages));
    loadNotifications();
}

function sendBroadcastNotification() {
    // Load users for dropdown
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const specificUserSelect = document.getElementById('specificUser');
    specificUserSelect.innerHTML = '';
    
    users.forEach(user => {
        const option = document.createElement('option');
        option.value = user.username;
        option.textContent = user.username;
        specificUserSelect.appendChild(option);
    });
    
    document.getElementById('broadcastModal').classList.add('active');
}

function toggleUserSelect() {
    const recipient = document.getElementById('broadcastRecipient').value;
    const userSelectGroup = document.getElementById('userSelectGroup');
    
    if (recipient === 'specific') {
        userSelectGroup.style.display = 'block';
    } else {
        userSelectGroup.style.display = 'none';
    }
}

document.getElementById('broadcastForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const recipient = document.getElementById('broadcastRecipient').value;
    const title = document.getElementById('broadcastTitle').value;
    const message = document.getElementById('broadcastMessage').value;
    
    let userNotifications = JSON.parse(localStorage.getItem('userNotifications')) || [];
    
    if (recipient === 'all') {
        // Send to all users
        const users = JSON.parse(localStorage.getItem('users')) || [];
        users.forEach(user => {
            userNotifications.push({
                id: Date.now() + Math.random(),
                username: user.username,
                title: title,
                message: message,
                timestamp: new Date().toISOString(),
                read: false,
                type: 'broadcast'
            });
        });
    } else {
        // Send to specific user
        const username = document.getElementById('specificUser').value;
        userNotifications.push({
            id: Date.now(),
            username: username,
            title: title,
            message: message,
            timestamp: new Date().toISOString(),
            read: false,
            type: 'broadcast'
        });
    }
    
    localStorage.setItem('userNotifications', JSON.stringify(userNotifications));
    
    alert('✅ Notification sent successfully!');
    closeModal('broadcastModal');
    this.reset();
});

// Auto-refresh notifications every 10 seconds
setInterval(() => {
    if (document.getElementById('notifications') && document.getElementById('notifications').classList.contains('active')) {
        loadNotifications();
    }
}, 10000);



