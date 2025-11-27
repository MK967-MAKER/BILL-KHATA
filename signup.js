const signupForm = document.getElementById('signupForm');
const contactMethodRadios = document.querySelectorAll('input[name="contactMethod"]');
const mobileGroup = document.getElementById('mobileGroup');
const emailGroup = document.getElementById('emailGroup');
const mobileInput = document.getElementById('signupMobile');
const emailInput = document.getElementById('signupEmail');
const errorMessage = document.getElementById('errorMessage');
const successMessage = document.getElementById('successMessage');

// Toggle between mobile and email input
contactMethodRadios.forEach(radio => {
    radio.addEventListener('change', function() {
        if (this.value === 'mobile') {
            mobileGroup.style.display = 'block';
            emailGroup.style.display = 'none';
            mobileInput.required = true;
            emailInput.required = false;
        } else {
            mobileGroup.style.display = 'none';
            emailGroup.style.display = 'block';
            mobileInput.required = false;
            emailInput.required = true;
        }
    });
});

signupForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Hide previous messages
    errorMessage.style.display = 'none';
    successMessage.style.display = 'none';
    
    const username = document.getElementById('signupUsername').value.trim();
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const contactMethod = document.querySelector('input[name="contactMethod"]:checked').value;
    
    // Validation
    if (password !== confirmPassword) {
        showError('Passwords do not match');
        return;
    }
    
    if (password.length < 6) {
        showError('Password must be at least 6 characters');
        return;
    }
    
    // Get existing users from localStorage
    let users = JSON.parse(localStorage.getItem('users')) || [];
    
    // Check if username already exists
    if (users.find(u => u.username === username)) {
        showError('Username already exists');
        return;
    }
    
    // Create new user object
    const newUser = {
        username: username,
        password: password
    };
    
    if (contactMethod === 'mobile') {
        const mobile = mobileInput.value.trim();
        if (!mobile) {
            showError('Please enter mobile number');
            return;
        }
        // Check if mobile already registered
        if (users.find(u => u.mobile === mobile)) {
            showError('Mobile number already registered');
            return;
        }
        newUser.mobile = mobile;
    } else {
        const email = emailInput.value.trim();
        if (!email) {
            showError('Please enter email address');
            return;
        }
        // Check if email already registered
        if (users.find(u => u.email === email)) {
            showError('Email already registered');
            return;
        }
        newUser.email = email;
    }
    
    // Get account type
    const accountType = document.getElementById('accountType').value;
    
    // Add user role and default settings
    newUser.role = 'user';
    newUser.accountType = accountType; // 'admin' or 'user'
    newUser.profileEnabled = true;
    newUser.createdDate = new Date().toISOString();
    
    // Save user
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    // Auto login the user
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    
    showSuccess('Account created successfully! Redirecting to POS System...');
    
    // Redirect to appropriate POS system after 2 seconds
    setTimeout(() => {
        if (accountType === 'user') {
            window.location.href = 'user-pos.html';
        } else {
            window.location.href = 'pos-system.html';
        }
    }, 2000);
});

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
}

function showSuccess(message) {
    successMessage.textContent = message;
    successMessage.style.display = 'block';
}

function toggleAccountType() {
    // Optional: Add any additional logic when account type changes
}
