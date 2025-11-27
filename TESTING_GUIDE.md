# 🧪 Testing Guide - User POS System

## 🚀 Quick Test Setup

### Method 1: Using Test Account Creator (Recommended)

1. **Open Test Account Creator:**
   ```
   Open: create-test-user.html
   ```

2. **Create User POS Account:**
   - Click "✅ Create User POS Account" button
   - Success message will appear

3. **Login:**
   - Go to `index.html`
   - Username: `cashier`
   - Password: `cashier123`
   - Click Login

4. **Result:**
   - Automatically redirected to `user-pos.html`
   - Simple cashier interface
   - Only sales features

---

### Method 2: Manual Signup

1. **Open Signup Page:**
   ```
   Open: signup.html
   ```

2. **Fill Form:**
   - Username: `testcashier`
   - Account Type: Select "User POS (Limited Access)"
   - Contact: Mobile or Email
   - Password: `test123`
   - Confirm Password: `test123`

3. **Click Sign Up:**
   - Auto-redirected to User POS

---

## 🧪 Test Scenarios

### Test 1: User POS Login
```
✅ Login with: cashier / cashier123
✅ Should redirect to user-pos.html
✅ Should see "👤 Cashier" badge
✅ Should only see Sales menu
```

### Test 2: Admin POS Login
```
✅ Create Admin POS account (manager / manager123)
✅ Login with admin account
✅ Should redirect to pos-system.html
✅ Should see all features (Inventory, Reports, etc.)
```

### Test 3: User POS Features
```
✅ Can view products
✅ Can add to cart
✅ Can increase/decrease quantity
✅ Can checkout
✅ Can print receipt
✅ Can clear cart
✅ Can see notifications
✅ Can use chat support
```

### Test 4: User POS Restrictions
```
❌ Cannot access Inventory menu
❌ Cannot access Reports menu
❌ Cannot access Clients menu
❌ Cannot access License menu
❌ Cannot add/edit products
```

### Test 5: Sale Transaction
```
1. Login as cashier
2. Add products to cart
3. Enter customer paid amount
4. Click Checkout
5. Click "Complete Sale"
6. Receipt should print
7. Cart should clear
8. Stock should update
```

### Test 6: Notifications
```
1. Login as superadmin
2. Go to Notifications
3. Send broadcast to "All Users"
4. Login as cashier
5. Click notification panel
6. Should see admin message
```

---

## 📊 Test Accounts

### Pre-created Accounts:

| Username | Password | Type | Access |
|----------|----------|------|--------|
| superadmin | super123 | Superadmin | Full Control |
| cashier | cashier123 | User POS | Sales Only |
| manager | manager123 | Admin POS | Full Access |

---

## 🔍 Verification Checklist

### User POS Interface:
- [ ] Sidebar shows: Sales, Dashboard, Logout, Chat Support
- [ ] No Inventory menu
- [ ] No Reports menu
- [ ] No Clients menu
- [ ] No License menu
- [ ] Shows "👤 Cashier" badge
- [ ] Notification panel works
- [ ] Chat support works

### Sales Functionality:
- [ ] Products load correctly
- [ ] Can search products
- [ ] Can filter by category
- [ ] Add to cart works
- [ ] Quantity controls work
- [ ] Remove from cart works
- [ ] Checkout calculates correctly
- [ ] Payment modal appears
- [ ] Sale completes successfully
- [ ] Receipt prints correctly
- [ ] Cart clears after sale

### Transaction Recording:
- [ ] Sale saved in localStorage
- [ ] Shows in superadmin activity log
- [ ] Receipt number generated
- [ ] Cashier name recorded
- [ ] Stock updated correctly

---

## 🐛 Troubleshooting

### Issue: User redirected to Admin POS
**Solution:** Check `accountType` in localStorage
```javascript
// Open browser console
let users = JSON.parse(localStorage.getItem('users'));
console.log(users);
// Find your user and check accountType
```

### Issue: Buttons not working
**Solution:** Check browser console for errors
```
F12 → Console tab → Look for errors
```

### Issue: Products not loading
**Solution:** Add sample products
```
1. Login as admin/superadmin
2. Go to Inventory
3. Add some products
4. Logout and login as cashier
```

### Issue: Account already exists
**Solution:** Clear and recreate
```
Open: create-test-user.html
Click: "🗑️ Clear All Accounts"
Then create new account
```

---

## 📱 Testing Flow

### Complete Test Flow:

```
1. CREATE ACCOUNTS
   ├─ Open create-test-user.html
   ├─ Create User POS (cashier)
   └─ Create Admin POS (manager)

2. ADD PRODUCTS (as admin)
   ├─ Login as manager/manager123
   ├─ Go to Inventory
   ├─ Add 5-10 products
   └─ Logout

3. TEST USER POS
   ├─ Login as cashier/cashier123
   ├─ Verify limited interface
   ├─ Add products to cart
   ├─ Complete sale
   ├─ Print receipt
   └─ Verify transaction

4. TEST NOTIFICATIONS
   ├─ Login as superadmin
   ├─ Send notification to cashier
   ├─ Logout
   ├─ Login as cashier
   └─ Check notification received

5. VERIFY RESTRICTIONS
   ├─ Try to access admin features
   └─ Should be blocked/hidden
```

---

## ✅ Expected Results

### User POS (Cashier):
- ✅ Simple, clean interface
- ✅ Only sales functionality
- ✅ Fast checkout process
- ✅ Cannot break anything
- ✅ Cannot access sensitive data

### Admin POS (Manager):
- ✅ Full-featured interface
- ✅ All management tools
- ✅ Reports and analytics
- ✅ Complete control

### Superadmin:
- ✅ Can see all transactions
- ✅ Can track sales by cashier
- ✅ Can send notifications
- ✅ Full system control

---

## 🎯 Success Criteria

Test is successful if:
1. ✅ User POS account creates successfully
2. ✅ Login redirects to correct POS
3. ✅ User can make sales
4. ✅ User cannot access admin features
5. ✅ Transactions save correctly
6. ✅ Receipts print correctly
7. ✅ Notifications work
8. ✅ Stock updates properly

---

## 📞 Support

If you encounter any issues:
1. Check browser console (F12)
2. Verify localStorage data
3. Clear cache and retry
4. Check TESTING_GUIDE.md
5. Check USER_POS_GUIDE.md

---

## 🎉 Ready to Test!

**Quick Start:**
1. Open `create-test-user.html`
2. Click "Create User POS Account"
3. Go to `index.html`
4. Login: cashier / cashier123
5. Start testing! 🚀

**System is ready for production testing!** ✅
