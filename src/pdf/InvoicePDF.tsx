import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { format } from 'date-fns';

interface InvoiceProps {
  invoice: {
    number: string;
    business: {
      name: string;
      logo?: string;
      email?: string;
      phone?: string;
      address?: string;
      currency?: string;
    };
    customer: {
      name: string;
      address?: string;
    };
    items: Array<{
      description: string;
      quantity: number;
      unitPrice: number;
      taxRate?: number;
      lineTotal: number;
    }>;
    issueDate?: string;
    dueDate?: string;
    subtotal: number;
    taxTotal: number;
    grandTotal: number;
    amountPaid: number;
    balanceDue: number;
    currency: string;
    notes?: string;
  };
}

const styles = StyleSheet.create({
  page: {
    paddingHorizontal: 40,
    paddingVertical: 36,
    fontSize: 10,
    fontFamily: 'Helvetica'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  logo: {
    width: 60,
    height: 50,
    marginRight: 12,
    marginBottom: 4,
  },
  businessInfo: {
    flex: 1
  },
  businessName: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  businessMeta: {
    fontSize: 9,
    color: '#666'
  },
  metaBox: {
    border: '2pt solid #2c3e50',
    paddingHorizontal: 10,
    paddingVertical: 8,
    minWidth: 140,
    textAlign: 'right'
  },
  invoiceTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 1,
  },
  invoiceNum: {
    fontSize: 11,
    color: '#666',
    marginBottom: 6,
  },
  invoiceDates: {
    fontSize: 9,
    color: '#555'
  },
  section: {
    marginBottom: 16,
  },
  sectionDivider: {
    marginBottom: 2,
  },
  twoCol: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  billBox: {
    flex: 1,
    marginRight: 16,
  },
  billTitle: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 4,
  },
  billContent: {
    fontSize: 10,
    lineHeight: 1.3,
  },
  table: {
    marginTop: 12,
    marginBottom: 12,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottom: '2pt solid #2c3e50',
    paddingHorizontal: 6,
    paddingVertical: 8,
    fontWeight: '700',
    fontSize: 10
  },
  tableRow: {
    flexDirection: 'row',
    paddingHorizontal: 6,
    paddingVertical: 7,
    borderBottom: '0.5pt solid #e8e8e8',
  },
  colDesc: { flex: 3, paddingRight: 6 },
  colQty: { flex: 0.8, textAlign: 'right', paddingRight: 4 },
  colUnit: { flex: 0.9, textAlign: 'right', paddingRight: 4 },
  colTotal: { flex: 1, textAlign: 'right' },
  totalsContainer: {
    marginTop: 12,
    paddingTop: 6,
  },
  totalsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '45%',
    marginLeft: 'auto',
    paddingHorizontal: 6,
    paddingVertical: 4,
    fontSize: 10
  },
  totalBold: {
    fontWeight: '700',
    borderTop: '1pt solid #ddd',
    paddingTop: 6,
    marginTop: 2,
  },
  notes: {
    marginTop: 16,
    fontSize: 9,
    paddingTop: 8,
    borderTop: '0.5pt solid #e8e8e8',
  },
  notesTitle: {
    fontWeight: '700',
    marginBottom: 3,
  }
});

export function InvoicePDF({ invoice }: InvoiceProps) {
  const { business, customer } = invoice;
  const issue = invoice.issueDate ? new Date(invoice.issueDate) : undefined;
  const due = invoice.dueDate ? new Date(invoice.dueDate) : undefined;

  const fmt = (v: number) => Number.isFinite(v) ? v.toFixed(2) : '0.00';

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header: Logo/Business Info + Invoice Meta Box */}
        <View style={styles.header}>
          <View style={styles.brand}>
            {business.logo ? (
              <Image src={business.logo} style={styles.logo} />
            ) : null}
            <View style={styles.businessInfo}>
              <Text style={styles.businessName}>{business.name}</Text>
              {business.address && <Text style={styles.businessMeta}>{business.address}</Text>}
              {business.email && <Text style={styles.businessMeta}>{business.email}</Text>}
            </View>
          </View>

          <View style={styles.metaBox}>
            <Text style={styles.invoiceTitle}>INVOICE</Text>
            <Text style={styles.invoiceNum}>#{invoice.number}</Text>
            {issue && <Text style={styles.invoiceDates}>Issue: {format(issue, 'dd/MM/yyyy')}</Text>}
            {due && <Text style={styles.invoiceDates}>Due: {format(due, 'dd/MM/yyyy')}</Text>}
          </View>
        </View>

        {/* Bill To and From sections */}
        <View style={styles.section}>
          <View style={styles.twoCol}>
            <View style={styles.billBox}>
              <Text style={styles.billTitle}>BILL TO</Text>
              <View style={styles.sectionDivider}>
                <Text style={styles.billContent}>{customer.name}</Text>
                {customer.address && <Text style={styles.billContent}>{customer.address}</Text>}
              </View>
            </View>

            <View style={styles.billBox}>
              <Text style={styles.billTitle}>FROM</Text>
              <View style={styles.sectionDivider}>
                <Text style={styles.billContent}>{business.name}</Text>
                {business.email && <Text style={styles.billContent}>{business.email}</Text>}
                {business.phone && <Text style={styles.billContent}>{business.phone}</Text>}
              </View>
            </View>
          </View>
        </View>

        {/* Items Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.colDesc}>Description</Text>
            <Text style={styles.colQty}>Qty</Text>
            <Text style={styles.colUnit}>Unit Price</Text>
            <Text style={styles.colTotal}>Amount</Text>
          </View>

          {invoice.items.map((it, i) => (
            <View style={styles.tableRow} key={i}>
              <Text style={styles.colDesc}>{it.description}</Text>
              <Text style={styles.colQty}>{Number(it.quantity).toFixed(2)}</Text>
              <Text style={styles.colUnit}>{Number(it.unitPrice).toFixed(2)}</Text>
              <Text style={styles.colTotal}>{fmt(it.lineTotal)}</Text>
            </View>
          ))}
        </View>

        {/* Totals Section */}
        <View style={styles.totalsContainer}>
          <View style={styles.totalsRow}><Text>Subtotal:</Text><Text>{fmt(invoice.subtotal)}</Text></View>
          <View style={styles.totalsRow}><Text>Tax:</Text><Text>{fmt(invoice.taxTotal)}</Text></View>
          <View style={[styles.totalsRow, styles.totalBold]}><Text>Total Due:</Text><Text>{fmt(invoice.grandTotal)} {invoice.currency}</Text></View>
          {invoice.amountPaid > 0 && (
            <>
              <View style={styles.totalsRow}><Text>Amount Paid:</Text><Text>{fmt(invoice.amountPaid)}</Text></View>
              <View style={[styles.totalsRow, styles.totalBold]}><Text>Balance Due:</Text><Text>{fmt(invoice.balanceDue)} {invoice.currency}</Text></View>
            </>
          )}
        </View>

        {/* Notes Section */}
        {invoice.notes && (
          <View style={styles.notes}>
            <Text style={styles.notesTitle}>Notes</Text>
            <Text>{invoice.notes}</Text>
          </View>
        )}
      </Page>
    </Document>
  );
}