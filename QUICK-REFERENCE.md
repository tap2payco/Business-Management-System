# Quick Reference: Invoice Templates & Logo

## Template URLs

Replace `[invoice-id]` with your actual invoice ID (e.g., `cmiihqwyo000j13qh5tzo9wc5`)

### Modern Template (Default)
```
http://localhost:3001/api/pdf/invoice/[invoice-id]
```
- Clean, contemporary design
- Outfit font family
- Grid-based layout

### Classic Template
```
http://localhost:3001/api/pdf/invoice/[invoice-id]?template=classic
```
- Traditional invoice style
- Blue accent colors (#2563eb)
- Inter font family

### Minimal Template
```
http://localhost:3001/api/pdf/invoice/[invoice-id]?template=minimal
```
- Ultra-clean black & white
- IBM Plex Sans font
- Minimalist design

---

## Logo Verification Checklist

✅ **Upload Logo:**
1. Go to Settings (`/settings`)
2. Upload logo image (PNG/JPG)
3. Should see "Logo uploaded and saved successfully"
4. Logo preview appears immediately

✅ **Verify in Database:**
```bash
cd /home/elespius/biz-mgr-auth
node -e "const {PrismaClient} = require('@prisma/client'); const p = new PrismaClient(); p.business.findFirst().then(b => {console.log('Business:', b.name); console.log('Logo:', b.logo); process.exit()})"
```

✅ **Check Terminal Logs:**
When viewing a PDF, you should see:
```
Invoice business logo: /uploads/[filename].png
Processing logo path: /uploads/[filename].png
Logo file exists: true
Logo converted to base64, mime: image/png
```

✅ **NOT see:**
```
Using fallback logo  ❌
```

---

## Quick Test Steps

1. **Create Invoice:**
   - `/invoices/new`
   - Add customer details
   - Add items
   - Save

2. **View PDF:**
   - Click "View PDF" on invoice page
   - Logo should appear at top

3. **Try Different Templates:**
   - Add `?template=classic` to URL
   - Add `?template=minimal` to URL
   - Compare designs

4. **Test Receipt:**
   - Record a payment
   - View receipt PDF
   - Logo should appear (green theme)

---

## File Locations

- **Templates:** `/home/elespius/biz-mgr-auth/templates/`
  - `invoice-modern.html` (default)
  - `invoice.html` (classic)
  - `invoice-minimal.html`
  - `receipt.html`

- **Uploaded Logos:** `/home/elespius/biz-mgr-auth/public/uploads/`

- **Template Docs:** `/home/elespius/biz-mgr-auth/templates/README.md`

---

## Common Issues & Fixes

### Logo Not Showing
1. Hard refresh: `Ctrl+Shift+R`
2. Check terminal for "Using fallback logo"
3. Verify logo file exists in `public/uploads/`
4. Re-upload logo in Settings

### Wrong Template
- Check URL has correct `?template=` parameter
- Valid values: `classic`, `minimal`
- No parameter = modern (default)

### Invoice Creation Error
- Check terminal for error messages
- Verify you're logged in
- Ensure businessId is set in session

---

## Current System Status

✅ Database: Clean, single business
✅ Logo: Saved and working
✅ Templates: 3 styles available
✅ Business: Creotix Technologies
✅ Port: 3001
✅ Ready for production use
