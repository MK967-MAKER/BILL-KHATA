function loadMessages() {
    const container = document.getElementById('messagesContainer');
    let adminMessages = JSON.parse(localStorage.getItem('adminMessages')) || [];
    
    if (adminMessages.length === 0) {
        container.innerHTML = '<div class="no-requests"><p>No messages from users</p></div>';
        return;
    }
    
    // Sort by timestamp (newest first)
    adminMessages.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    container.innerHTML = '';
    adminMessages.forEach((msg, index) => {
        const messageCard = document.createElement('div');
        messageCard.className = 'request-card';
        
        const isImage = msg.type === 'image';
        
        messageCard.innerHTML = `
            <div class="request-header">
                <div>
                    <h3>👤 ${msg.from || 'Anonymous User'}</h3>
                    ${msg.language ? `<span class="status-badge status-active">${msg.language.toUpperCase()}</span>` : ''}
                </div>
                <div class="request-date">${new Date(msg.timestamp).toLocaleString()}</div>
            </div>
            
            <div class="request-body">
                ${isImage ? `
                    <div class="payment-screenshot">
                        <strong>Image Message:</strong>
                        <p style="color: #666; font-size: 14px; margin: 5px 0;">${msg.fileName || 'Image'}</p>
                        <img src="${msg.image}" alt="${msg.fileName}" onclick="openImagePreview('${msg.image}')">
                    </div>
                ` : `
                    <div class="request-message">
                        <strong>Message:</strong>
                        <p>${msg.message}</p>
                    </div>
                `}
            </div>
            
            <div class="request-actions">
                <button class="approve-btn" onclick="replyToMessage(${index})">📧 Reply via Chat</button>
                <button class="reject-btn" onclick="deleteMessage(${index})">🗑️ Delete</button>
            </div>
        `;
        
        container.appendChild(messageCard);
    });
}

function deleteMessage(index) {
    if (!confirm('Are you sure you want to delete this message?')) return;
    
    let adminMessages = JSON.parse(localStorage.getItem('adminMessages')) || [];
    adminMessages.splice(index, 1);
    localStorage.setItem('adminMessages', JSON.stringify(adminMessages));
    
    loadMessages();
}

function replyToMessage(index) {
    let adminMessages = JSON.parse(localStorage.getItem('adminMessages')) || [];
    const msg = adminMessages[index];
    
    const replyText = prompt(`Reply to ${msg.from}:\n\nOriginal message: "${msg.message || 'Image message'}"\n\nEnter your reply:`);
    
    if (!replyText || replyText.trim() === '') {
        return;
    }
    
    // Save reply to user's messages
    let userReplies = JSON.parse(localStorage.getItem('userReplies')) || [];
    userReplies.push({
        to: msg.from,
        reply: replyText,
        originalMessage: msg.message || 'Image message',
        timestamp: new Date().toISOString(),
        from: 'Admin',
        read: false
    });
    localStorage.setItem('userReplies', JSON.stringify(userReplies));
    
    alert(`✅ Reply sent to ${msg.from}!`);
    
    // Mark message as replied
    adminMessages[index].replied = true;
    adminMessages[index].replyText = replyText;
    adminMessages[index].replyTime = new Date().toISOString();
    localStorage.setItem('adminMessages', JSON.stringify(adminMessages));
    
    loadMessages();
    
    chatbot.classList.remove('minimized');
    chatbot.classList.add('active');
    toggleBtn.style.display = 'none';
    
    // Load the conversation
    loadReplyContext();
}

function clearAllMessages() {
    if (!confirm('Are you sure you want to delete ALL messages? This cannot be undone!')) return;
    
    localStorage.setItem('adminMessages', JSON.stringify([]));
    loadMessages();
    alert('All messages cleared!');
}

function openImagePreview(imageData) {
    const preview = document.createElement('div');
    preview.className = 'image-preview-overlay';
    preview.innerHTML = `
        <div class="image-preview-content">
            <button class="preview-close" onclick="this.parentElement.parentElement.remove()">×</button>
            <img src="${imageData}" alt="User Image">
        </div>
    `;
    document.body.appendChild(preview);
    
    preview.addEventListener('click', (e) => {
        if (e.target === preview) {
            preview.remove();
        }
    });
}

function loadReplyContext() {
    const replyData = sessionStorage.getItem('replyToMessage');
    if (!replyData) return;
    
    const data = JSON.parse(replyData);
    const messagesDiv = document.getElementById('chatMessages');
    
    // Clear existing messages
    messagesDiv.innerHTML = '';
    
    // Show context header
    const contextHeader = document.createElement('div');
    contextHeader.className = 'message bot';
    contextHeader.innerHTML = `
        <div class="message-bubble" style="background: #fff3cd; color: #856404;">
            <strong>📧 Replying to: ${data.from}</strong><br>
            <small>${new Date(data.timestamp).toLocaleString()}</small>
        </div>
    `;
    messagesDiv.appendChild(contextHeader);
    
    // Show original message
    if (data.isImage) {
        const imageMsg = document.createElement('div');
        imageMsg.className = 'message user';
        imageMsg.innerHTML = `
            <div class="message-bubble">
                <div class="image-message">
                    <img src="${data.image}" alt="User Image" style="max-width: 150px; border-radius: 8px;">
                </div>
            </div>
        `;
        messagesDiv.appendChild(imageMsg);
    } else {
        const userMsg = document.createElement('div');
        userMsg.className = 'message user';
        userMsg.innerHTML = `
            <div class="message-bubble">
                <div>${data.message}</div>
            </div>
        `;
        messagesDiv.appendChild(userMsg);
    }
    
    // Show admin prompt
    const promptMsg = document.createElement('div');
    promptMsg.className = 'message bot';
    promptMsg.innerHTML = `
        <div class="message-bubble">
            <div>Type your reply below and click Send to respond to ${data.from}</div>
        </div>
    `;
    messagesDiv.appendChild(promptMsg);
    
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
    
    // Focus on input
    document.getElementById('chatInput').focus();
    
    // Clear session storage
    sessionStorage.removeItem('replyToMessage');
}

// Load messages on page load
loadMessages();

// Check if there's a reply context on page load
setTimeout(() => {
    const replyData = sessionStorage.getItem('replyToMessage');
    if (replyData) {
        const chatbot = document.getElementById('chatbotContainer');
        const toggleBtn = document.getElementById('chatbotToggle');
        
        chatbot.classList.remove('minimized');
        chatbot.classList.add('active');
        toggleBtn.style.display = 'none';
        
        loadReplyContext();
    }
}, 500);
