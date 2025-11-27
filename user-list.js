// Get filter from URL parameter
const urlParams = new URLSearchParams(window.location.search);
let filterType = urlParams.get('filter') || 'all';

// Convert 'total' to 'all' for consistency
if (filterType === 'total') {
    filterType = 'all';
}

// Set filter dropdown and title
const filterDropdown = document.getElementById('userFilter');
if (filterDropdown) {
    filterDropdown.value = filterType;
}
updateTitle(filterType);

function updateTitle(filter) {
    const titles = {
        all: 'All Users',
        total: 'All Users',
        purchased: 'License Purchased Users',
        active: 'Active Users',
        expired: 'Expired Users',
        expiring: 'To Be Expired Users'
    };
    document.getElementById('listTitle').textContent = titles[filter] || 'All Users';
}

function loadFilteredUsers() {
    const filterDropdown = document.getElementById('userFilter');
    const filter = filterDropdown ? filterDropdown.value : filterType;
    updateTitle(filter);
    
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const tbody = document.getElementById('usersTableBody');
    const now = new Date();
    
    tbody.innerHTML = '';
    let count = 0;
    
    users.forEach((user, index) => {
        // Calculate license status
        let status = 'Trial';
        let statusClass = 'status-pending';
        let daysLeft = 0;
        let daysLeftClass = '';
        let fee = 'N/A';
        
        if (user.expiryDate) {
            const expiryDate = new Date(user.expiryDate);
            daysLeft = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));
            
            if (user.licenseType === 'lifetime') {
                status = 'Lifetime';
                statusClass = 'status-active';
                daysLeft = -1; // Special value for unlimited
                daysLeftClass = 'good';
            } else if (daysLeft < 0) {
                status = 'Expired';
                statusClass = 'status-expired';
                daysLeft = 0;
                daysLeftClass = 'critical';
            } else if (daysLeft <= 7) {
                status = 'Expiring Soon';
                statusClass = 'status-expiring';
                daysLeftClass = 'critical';
            } else if (daysLeft <= 30) {
                status = 'Active';
                statusClass = 'status-active';
                daysLeftClass = 'warning';
            } else {
                status = 'Active';
                statusClass = 'status-active';
                daysLeftClass = 'good';
            }
        }
        
        // Determine license type and fee
        let licenseTypeDisplay = user.licenseType || 'monthly';
        if (licenseTypeDisplay === 'monthly') {
            fee = 'Rs. 1,000';
        } else if (licenseTypeDisplay === 'lifetime') {
            fee = 'Rs. 5,000';
        }
        
        // Apply filter
        if (filter !== 'all' && filter !== 'total') {
            // Purchased: Users with monthly or lifetime license (not trial)
            if (filter === 'purchased') {
                if (user.licenseType === 'trial' || !user.licenseType) return;
            }
            // Active: Users with more than 7 days left
            else if (filter === 'active') {
                if (daysLeft === -1) {
                    // Lifetime users are always active
                } else if (daysLeft <= 7 || daysLeft === 0) {
                    return; // Skip if expiring soon or expired
                }
            }
            // Expired: Users with 0 days left (not lifetime)
            else if (filter === 'expired') {
                if (daysLeft !== 0 || daysLeft === -1) return;
            }
            // Expiring: Users with 1-7 days left
            else if (filter === 'expiring') {
                if (daysLeft > 7 || daysLeft === 0 || daysLeft === -1) return;
            }
        }
        
        count++;
        const tr = document.createElement('tr');
        
        // Profile picture or initial
        let avatarHtml = '';
        if (user.profilePicture) {
            avatarHtml = `<img src="${user.profilePicture}" style="width: 30px; height: 30px; border-radius: 50%; object-fit: cover; vertical-align: middle; margin-right: 8px;">`;
        } else {
            avatarHtml = `<span style="display: inline-block; width: 30px; height: 30px; border-radius: 50%; background: #667eea; color: white; text-align: center; line-height: 30px; margin-right: 8px; font-weight: bold;">${user.username.charAt(0).toUpperCase()}</span>`;
        }
        
        tr.innerHTML = `
            <td>${count}</td>
            <td>${avatarHtml}<strong><a href="user-profile.html?id=${index}" target="_blank" style="color: #667eea; text-decoration: none; cursor: pointer;">${user.username}</a></strong></td>
            <td>${user.mobile || user.email || 'N/A'}</td>
            <td><span class="status-badge ${statusClass}">${licenseTypeDisplay.toUpperCase()}</span></td>
            <td><span class="status-badge ${statusClass}">${status}</span></td>
            <td>${user.expiryDate ? new Date(user.expiryDate).toLocaleDateString() : 'N/A'}</td>
            <td><span class="days-left ${daysLeftClass}">${daysLeft === -1 ? 'Unlimited' : daysLeft > 0 ? daysLeft + ' days' : 'Expired'}</span></td>
            <td><strong>${fee}</strong></td>
            <td>
                <button class="action-btn edit-btn" onclick="editUserInfo(${index})">✏️ Edit</button>
                <button class="action-btn edit-btn" onclick="viewDetails(${index})">👁️ View</button>
                <button class="action-btn edit-btn" onclick="addInventoryItem(${index})">📦 Add Inventory</button>
                <button class="action-btn delete-btn" onclick="deleteUser(${index})">🗑️ Delete</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
    
    if (count === 0) {
        tbody.innerHTML = '<tr><td colspan="9" style="text-align: center; padding: 20px;">No users found</td></tr>';
    }
}

function viewDetails(index) {
    // Navigate to user profile page
    window.location.href = `user-profile.html?id=${index}`;
}

function deleteUser(index) {
    if (confirm('Are you sure you want to delete this user?')) {
        let users = JSON.parse(localStorage.getItem('users')) || [];
        users.splice(index, 1);
        localStorage.setItem('users', JSON.stringify(users));
        loadFilteredUsers();
        alert('User deleted successfully!');
    }
}

// Load users on page load
console.log('User List JS loaded successfully');
console.log('Filter type:', filterType);
console.log('Users in localStorage:', localStorage.getItem('users'));

try {
    loadFilteredUsers();
    console.log('Users loaded successfully');
} catch (error) {
    console.error('Error loading users:', error);
    document.getElementById('usersTableBody').innerHTML = '<tr><td colspan="9" style="text-align: center; padding: 20px; color: red;">Error loading users: ' + error.message + '</td></tr>';
}


function editUserInfo(index) {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users[index];
    
    if (!user) {
        alert('User not found!');
        return;
    }
    
    // Create edit modal
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 500px;">
            <span class="close" onclick="this.parentElement.parentElement.remove()">&times;</span>
            <h2>Edit User Information</h2>
            <form id="editUserForm" style="margin-top: 20px;">
                <div class="input-group">
                    <label>Username</label>
                    <input type="text" id="editUsername" value="${user.username}" required>
                </div>
                <div class="input-group">
                    <label>Mobile</label>
                    <input type="tel" id="editMobile" value="${user.mobile || ''}">
                </div>
                <div class="input-group">
                    <label>Email</label>
                    <input type="email" id="editEmail" value="${user.email || ''}">
                </div>
                <div class="input-group">
                    <label>Password</label>
                    <div style="position: relative;">
                        <input type="password" id="editPassword" value="${user.password}" required>
                        <button type="button" onclick="toggleEditPassword()" style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; font-size: 18px;">👁️</button>
                    </div>
                </div>
                <div class="input-group">
                    <label>License Type</label>
                    <select id="editLicenseType" required>
                        <option value="monthly" ${user.licenseType === 'monthly' ? 'selected' : ''}>Monthly (30 days)</option>
                        <option value="lifetime" ${user.licenseType === 'lifetime' ? 'selected' : ''}>Lifetime</option>
                    </select>
                </div>
                <button type="submit" class="btn-primary" style="width: 100%; margin-top: 10px;">💾 Save Changes</button>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Handle form submission
    document.getElementById('editUserForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const updatedUser = {
            ...user,
            username: document.getElementById('editUsername').value.trim(),
            mobile: document.getElementById('editMobile').value.trim(),
            email: document.getElementById('editEmail').value.trim(),
            password: document.getElementById('editPassword').value,
            licenseType: document.getElementById('editLicenseType').value
        };
        
        // Update expiry date if license type changed
        if (updatedUser.licenseType !== user.licenseType) {
            const expiryDate = new Date();
            if (updatedUser.licenseType === 'monthly') {
                expiryDate.setDate(expiryDate.getDate() + 30);
                updatedUser.licenseFee = 1000;
            } else {
                expiryDate.setFullYear(expiryDate.getFullYear() + 100);
                updatedUser.licenseFee = 5000;
            }
            updatedUser.expiryDate = expiryDate.toISOString();
        }
        
        users[index] = updatedUser;
        localStorage.setItem('users', JSON.stringify(users));
        
        modal.remove();
        alert('User information updated successfully!');
        loadFilteredUsers();
    });
}

function toggleEditPassword() {
    const pwdInput = document.getElementById('editPassword');
    pwdInput.type = pwdInput.type === 'password' ? 'text' : 'password';
}

function addInventoryItem(userIndex) {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users[userIndex];
    
    if (!user) {
        alert('User not found!');
        return;
    }
    
    // Create add inventory modal
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 500px;">
            <span class="close" onclick="this.parentElement.parentElement.remove()">&times;</span>
            <h2>📦 Add Inventory Item for ${user.username}</h2>
            <form id="addInventoryForm" style="margin-top: 20px;">
                <div class="input-group">
                    <label>Product Name</label>
                    <input type="text" id="productName" placeholder="Enter product name" required>
                </div>
                <div class="input-group">
                    <label>Category</label>
                    <select id="productCategory" required>
                        <option value="">Select Category</option>
                        <option value="Electronics">Electronics</option>
                        <option value="Accessories">Accessories</option>
                        <option value="Audio">Audio</option>
                        <option value="Mobile">Mobile</option>
                        <option value="Computer">Computer</option>
                        <option value="Gaming">Gaming</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
                <div class="input-group">
                    <label>Stock Quantity</label>
                    <input type="number" id="stockQuantity" placeholder="Enter quantity" min="0" required>
                </div>
                <div class="input-group">
                    <label>Unit Price (Rs.)</label>
                    <input type="number" id="unitPrice" placeholder="Enter price" min="0" step="0.01" required>
                </div>
                <button type="submit" class="btn-primary" style="width: 100%; margin-top: 10px;">💾 Add to Inventory</button>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Handle form submission
    document.getElementById('addInventoryForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const productName = document.getElementById('productName').value.trim();
        const category = document.getElementById('productCategory').value;
        const stock = parseInt(document.getElementById('stockQuantity').value);
        const price = parseFloat(document.getElementById('unitPrice').value);
        
        // Determine status based on stock
        let status = 'In Stock';
        if (stock === 0) {
            status = 'Out of Stock';
        } else if (stock <= 5) {
            status = 'Low Stock';
        }
        
        // Initialize inventory array if not exists
        if (!user.inventory) {
            user.inventory = [];
        }
        
        // Add new item
        const newItem = {
            id: Date.now(),
            name: productName,
            category: category,
            stock: stock,
            price: price,
            status: status,
            addedBy: 'Admin',
            addedDate: new Date().toISOString()
        };
        
        user.inventory.push(newItem);
        
        // Save updated user
        users[userIndex] = user;
        localStorage.setItem('users', JSON.stringify(users));
        
        modal.remove();
        alert(`✅ Inventory item "${productName}" added successfully for ${user.username}!`);
    });
}
