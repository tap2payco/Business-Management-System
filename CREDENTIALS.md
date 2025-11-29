# BizMgr - Fresh Start Credentials

## Login Information

**URL:** http://localhost:3001/signin

**Phone:** 0710975264  
**Password:** admin123

⚠️ **IMPORTANT:** Change this password after your first login!

---

## What Was Done

✅ Complete database reset
✅ All old data deleted (users, invoices, customers, etc.)
✅ Fresh business created: "Creotix Technologies"
✅ Admin user created with credentials above
✅ Ready for logo upload and fresh start

---

## Next Steps

1. **Login**
   - Go to http://localhost:3001/signin
   - Use credentials above

2. **Upload Logo**
   - Navigate to Settings
   - Upload your business logo
   - It will auto-save to database

3. **Update Business Info**
   - Update business name, address, email if needed
   - Set default tax rate
   - Choose currency

4. **Start Using**
   - Create items (products/services)
   - Add customers
   - Generate invoices
   - Record payments

---

## System Features Ready

✅ Single business setup
✅ 3 professional invoice templates
✅ Logo support in PDFs
✅ Receipt generation
✅ Dashboard with metrics
✅ Complete CRUD for:
   - Invoices
   - Customers
   - Items
   - Expenses
   - Payments
   - Receipts

---

## Template URLs

After creating an invoice, view PDFs with:

- **Modern (default):** `/api/pdf/invoice/[id]`
- **Classic:** `/api/pdf/invoice/[id]?template=classic`
- **Minimal:** `/api/pdf/invoice/[id]?template=minimal`

---

## Support Files

- **Testing Guide:** `.gemini/antigravity/brain/.../testing-guide.md`
- **Quick Reference:** `QUICK-REFERENCE.md`
- **Template Docs:** `templates/README.md`

---

## Security Note

The default password `admin123` is for initial setup only.

**To change password:**
1. Currently, password change must be done via database
2. Or create a new user via signup page
3. Password change UI can be added if needed

Let me know if you need help setting up a password change feature!
