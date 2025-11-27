function loadRequests() {
    const filter = document.getElementById('requestFilter').value;
    const container = document.getElementById('requestsContainer');
    let licenseRequests = JSON.parse(localStorage.getItem('licenseRequests')) || [];
    
    // Filter requests
    let filteredRequests = licenseRequests;
    if (filter !== 'all') {
        filteredRequests = licenseRequests.filter(req => req.status === filter);
    }
    
    if (filteredRequests.length === 0) {
        container.innerHTML = '<div class="no-requests"><p>No license requests found</p></div>';
        return;
    }
    
    container.innerHTML = '';
    filteredRequests.forEach((request, index) => {
        const actualIndex = licenseRequests.findIndex(r => r === request);
        const requestCard = document.createElement('div');
        requestCard.className = 'request-card';
        
        const statusClass = request.status === 'approved' ? 'status-approved' : 
                           request.status === 'rejected' ? 'status-rejected' : 'status-pending';
        
        const licensePrice = request.licenseType === 'monthly' ? 'Rs. 1,000' : 'Rs. 5,000';
        const licenseDuration = request.licenseType === 'monthly' ? '30 days' : 'Unlimited';
        
        requestCard.innerHTML = `
            <div class="request-header">
                <div>
                    <h3>👤 ${request.username}</h3>
                    <span class="status-badge ${statusClass}">${request.status.toUpperCase()}</span>
                </div>
                <div class="request-date">${new Date(request.timestamp).toLocaleString()}</div>
            </div>
            
            <div class="request-body">
                <div class="request-info">
                    <div class="info-item">
                        <strong>📧 Email:</strong> ${request.email || 'N/A'}
                    </div>
                    <div class="info-item">
                        <strong>📱 Mobile:</strong> ${request.mobile || 'N/A'}
                    </div>
                    <div class="info-item">
                        <strong>📜 License Type:</strong> ${request.licenseType.toUpperCase()}
                    </div>
                    <div class="info-item">
                        <strong>⏱️ Duration:</strong> ${licenseDuration}
                    </div>
                    <div class="info-item">
                        <strong>💰 Price:</strong> ${licensePrice}
                    </div>
                    <div class="info-item">
                        <strong>💳 Payment Method:</strong> ${request.paymentMethod || 'Not specified'}
                    </div>
                </div>
                
                ${request.paymentScreenshot ? `
                    <div class="payment-screenshot">
                        <strong>Payment Screenshot:</strong>
                        <img src="${request.paymentScreenshot}" alt="Payment" onclick="openImagePreview('${request.paymentScreenshot}')">
                    </div>
                ` : ''}
                
                ${request.message ? `
                    <div class="request-message">
                        <strong>Message:</strong>
                        <p>${request.message}</p>
                    </div>
                ` : ''}
            </div>
            
            ${request.status === 'pending' ? `
                <div class="request-actions">
                    <button class="approve-btn" onclick="approveRequest(${actualIndex})">✓ Approve</button>
                    <button class="reject-btn" onclick="rejectRequest(${actualIndex})">✗ Reject</button>
                </div>
            ` : request.status === 'approved' ? `
                <div class="request-note">
                    <strong>✓ Approved on:</strong> ${request.actionDate ? new Date(request.actionDate).toLocaleString() : 'N/A'}
                </div>
            ` : `
                <div class="request-note">
                    <strong>✗ Rejected on:</strong> ${request.actionDate ? new Date(request.actionDate).toLocaleString() : 'N/A'}
                    ${request.rejectionReason ? `<br><strong>Reason:</strong> ${request.rejectionReason}` : ''}
                </div>
            `}
        `;
        
        container.appendChild(requestCard);
    });
}

function approveRequest(index) {
    if (!confirm('Are you sure you want to approve this license request?')) return;
    
    let licenseRequests = JSON.parse(localStorage.getItem('licenseRequests')) || [];
    let users = JSON.parse(localStorage.getItem('users')) || [];
    
    const request = licenseRequests[index];
    request.status = 'approved';
    request.actionDate = new Date().toISOString();
    
    // Update or create user with license
    const userIndex = users.findIndex(u => u.username === request.username);
    
    let expiryDate = new Date();
    if (request.licenseType === 'monthly') {
        expiryDate.setDate(expiryDate.getDate() + 30);
    } else {
        expiryDate.setFullYear(expiryDate.getFullYear() + 100);
    }
    
    if (userIndex !== -1) {
        // Update existing user
        users[userIndex].licenseType = request.licenseType;
        users[userIndex].licenseFee = request.licenseType === 'monthly' ? 1000 : 5000;
        users[userIndex].expiryDate = expiryDate.toISOString();
    } else {
        // Create new user
        users.push({
            username: request.username,
            password: 'temp123', // Temporary password
            email: request.email,
            mobile: request.mobile,
            licenseType: request.licenseType,
            licenseFee: request.licenseType === 'monthly' ? 1000 : 5000,
            expiryDate: expiryDate.toISOString(),
            createdDate: new Date().toISOString()
        });
    }
    
    localStorage.setItem('licenseRequests', JSON.stringify(licenseRequests));
    localStorage.setItem('users', JSON.stringify(users));
    
    alert('License request approved successfully!');
    loadRequests();
}

function rejectRequest(index) {
    const reason = prompt('Enter rejection reason (optional):');
    
    let licenseRequests = JSON.parse(localStorage.getItem('licenseRequests')) || [];
    licenseRequests[index].status = 'rejected';
    licenseRequests[index].actionDate = new Date().toISOString();
    if (reason) {
        licenseRequests[index].rejectionReason = reason;
    }
    
    localStorage.setItem('licenseRequests', JSON.stringify(licenseRequests));
    
    alert('License request rejected.');
    loadRequests();
}

function openImagePreview(imageData) {
    const preview = document.createElement('div');
    preview.className = 'image-preview-overlay';
    preview.innerHTML = `
        <div class="image-preview-content">
            <button class="preview-close" onclick="this.parentElement.parentElement.remove()">×</button>
            <img src="${imageData}" alt="Payment Screenshot">
        </div>
    `;
    document.body.appendChild(preview);
    
    preview.addEventListener('click', (e) => {
        if (e.target === preview) {
            preview.remove();
        }
    });
}

// Load requests on page load
loadRequests();
