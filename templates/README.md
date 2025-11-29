# PDF Templates

This document describes the available PDF templates for invoices and receipts.

## Invoice Templates

The system supports multiple invoice templates that can be selected via query parameter:

### 1. Modern Template (Default)
- **File**: `templates/invoice-modern.html`
- **Usage**: `/api/pdf/invoice/[id]` (default) or `/api/pdf/invoice/[id]?template=modern`
- **Design**: Clean, contemporary design with Outfit font
- **Features**:
  - Large, prominent invoice number
  - Grid-based layout for better organization
  - Properly aligned table columns
  - Clear visual hierarchy
  - Responsive totals section

### 2. Classic Template
- **File**: `templates/invoice.html`
- **Usage**: `/api/pdf/invoice/[id]?template=classic`
- **Design**: Traditional invoice layout with Inter font
- **Features**:
  - Blue accent color scheme
  - Rounded corners and shadows
  - Compact layout

### 3. Minimal Template
- **File**: `templates/invoice-minimal.html`
- **Usage**: `/api/pdf/invoice/[id]?template=minimal`
- **Design**: Ultra-clean, minimalist design with IBM Plex Sans
- **Features**:
  - Black and white color scheme
  - Maximum readability
  - Professional typography
  - Simplified layout

## Receipt Template

- **File**: `templates/receipt.html`
- **Design**: Green accent color to distinguish from invoices
- **Features**:
  - Business logo support
  - Compact format
  - Clear amount display

## Logo Support

All templates support business logos:
- Logos are automatically converted to base64 data URLs for PDF embedding
- Fallback placeholder logo if none is uploaded
- Supports common image formats (PNG, JPG, SVG)

## Customization

To add a new template:
1. Create a new HTML file in `templates/` directory
2. Use Handlebars syntax for data binding
3. Update the PDF route to include the new template option
4. Test with sample data

## Data Structure

Templates receive the following data:

### Invoice Data
```javascript
{
  number: string,
  business: { name, email, phone, address, currency, logo },
  customer: { name, address },
  items: [{ description, quantity, unitPrice, taxRate, lineTotal }],
  issueDate: string,
  dueDate: string,
  subtotal: number,
  taxTotal: number,
  grandTotal: number,
  amountPaid: number,
  balanceDue: number,
  currency: string,
  notes: string
}
```

### Receipt Data
```javascript
{
  number: string,
  issuedAt: string,
  amount: number,
  currency: string,
  business: { name, address, logo },
  customer: { name, address }
}
```
