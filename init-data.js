// Initialize sample data for testing
function initializeSampleData() {
    // Check if data already exists
    if (localStorage.getItem('dataInitialized')) {
        console.log('Sample data already initialized');
        return;
    }
    
    // Sample users with different license types
    const sampleUsers = [
        {
            username: 'ali_khan',
            password: 'pass123',
            mobile: '03001234567',
            email: 'ali@example.com',
            licenseType: 'lifetime',
            licenseFee: 5000,
            expiryDate: new Date(Date.now() + 365 * 100 * 24 * 60 * 60 * 1000).toISOString(),
            createdDate: new Date('2024-01-15').toISOString()
        },
        {
            username: 'sara_ahmed',
            password: 'pass123',
            mobile: '03009876543',
            email: 'sara@example.com',
            licenseType: 'monthly',
            licenseFee: 1000,
            expiryDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
            createdDate: new Date('2024-10-20').toISOString()
        },
        {
            username: 'ahmed_raza',
            password: 'pass123',
            mobile: '03111234567',
            licenseType: 'monthly',
            licenseFee: 1000,
            expiryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
            createdDate: new Date('2024-11-01').toISOString()
        },
        {
            username: 'fatima_ali',
            password: 'pass123',
            email: 'fatima@example.com',
            licenseType: 'monthly',
            licenseFee: 1000,
            expiryDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            createdDate: new Date('2024-11-10').toISOString()
        },
        {
            username: 'hassan_shah',
            password: 'pass123',
            mobile: '03221234567',
            licenseType: 'lifetime',
            licenseFee: 5000,
            expiryDate: new Date(Date.now() + 365 * 100 * 24 * 60 * 60 * 1000).toISOString(),
            createdDate: new Date('2024-02-10').toISOString()
        },
        {
            username: 'ayesha_malik',
            password: 'pass123',
            email: 'ayesha@example.com',
            licenseType: 'monthly',
            licenseFee: 1000,
            expiryDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
            createdDate: new Date('2024-11-05').toISOString()
        },
        {
            username: 'usman_khan',
            password: 'pass123',
            mobile: '03331234567',
            licenseType: 'monthly',
            licenseFee: 1000,
            expiryDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            createdDate: new Date('2024-11-15').toISOString()
        },
        {
            username: 'zainab_hussain',
            password: 'pass123',
            email: 'zainab@example.com',
            licenseType: 'lifetime',
            licenseFee: 5000,
            expiryDate: new Date(Date.now() + 365 * 100 * 24 * 60 * 60 * 1000).toISOString(),
            createdDate: new Date('2024-03-20').toISOString()
        }
    ];
    
    // Sample admins
    const sampleAdmins = [
        {
            username: 'admin1',
            password: 'admin123',
            email: 'admin1@pos.com'
        },
        {
            username: 'admin2',
            password: 'admin123',
            email: 'admin2@pos.com'
        }
    ];
    
    // Sample license requests
    const sampleLicenseRequests = [
        {
            username: 'new_user1',
            email: 'newuser1@example.com',
            mobile: '03001234567',
            licenseType: 'monthly',
            paymentMethod: 'JazzCash',
            message: 'I want to purchase monthly license for my shop',
            status: 'pending',
            timestamp: new Date('2024-11-26').toISOString()
        },
        {
            username: 'new_user2',
            email: 'newuser2@example.com',
            mobile: '03009876543',
            licenseType: 'lifetime',
            paymentMethod: 'Faysal Bank',
            message: 'Need lifetime license for my business',
            status: 'pending',
            timestamp: new Date('2024-11-25').toISOString()
        },
        {
            username: 'approved_user',
            email: 'approved@example.com',
            mobile: '03111234567',
            licenseType: 'monthly',
            paymentMethod: 'EasyPaisa',
            status: 'approved',
            timestamp: new Date('2024-11-24').toISOString(),
            actionDate: new Date('2024-11-25').toISOString()
        }
    ];
    
    // Sample messages
    const sampleMessages = [
        {
            from: 'ali_khan',
            message: 'I need help with my license renewal',
            timestamp: new Date('2024-11-26').toISOString()
        },
        {
            from: 'sara_ahmed',
            message: 'How can I upgrade to lifetime license?',
            timestamp: new Date('2024-11-25').toISOString()
        },
        {
            from: 'ahmed_raza',
            message: 'My trial is expiring soon, what should I do?',
            timestamp: new Date('2024-11-24').toISOString()
        }
    ];
    
    // Save to localStorage
    localStorage.setItem('users', JSON.stringify(sampleUsers));
    localStorage.setItem('admins', JSON.stringify(sampleAdmins));
    localStorage.setItem('licenseRequests', JSON.stringify(sampleLicenseRequests));
    localStorage.setItem('adminMessages', JSON.stringify(sampleMessages));
    localStorage.setItem('dataInitialized', 'true');
    
    console.log('Sample data initialized successfully!');
    console.log(`- ${sampleUsers.length} users created`);
    console.log(`- ${sampleAdmins.length} admins created`);
    console.log(`- ${sampleLicenseRequests.length} license requests created`);
    console.log(`- ${sampleMessages.length} messages created`);
}

// Run initialization
initializeSampleData();
