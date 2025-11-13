import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { format } from 'date-fns';

export interface ReceiptProps {
  receipt: {
    number: string;
    payment: {
      id?: string;
      amount: number;
      invoice: {
        number: string;
        currency: string;
        business: {
          name: string;
          address?: string;
          logo?: string;
        };
        customer: {
          name: string;
          address?: string;
        };
      };
    };
    issuedAt?: string;
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
    marginBottom: 24
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
    marginBottom: 4
  },
  businessInfo: {
    flex: 1
  },
  businessName: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2
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
  receiptTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 1
  },
  receiptNum: {
    fontSize: 11,
    color: '#666'
  },
  receiptDate: {
    fontSize: 9,
    color: '#555',
    marginTop: 6
  },
  section: {
    marginBottom: 16
  },
  twoCol: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  infoBox: {
    flex: 1
  },
  infoLabel: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 4
  },
  infoValue: {
    fontSize: 10,
    marginBottom: 2
  },
  separator: {
    borderTop: '1pt solid #ddd',
    marginVertical: 12,
    paddingTop: 8
  },
  amountBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f5f5f5',
    padding: 12,
    marginVertical: 8
  },
  amountLabel: {
    fontSize: 12,
    fontWeight: '700'
  },
  amountValue: {
    fontSize: 14,
    fontWeight: '700'
  },
  notes: {
    fontSize: 9,
    marginTop: 12,
    paddingTop: 8,
    borderTop: '0.5pt solid #e8e8e8',
    color: '#666'
  }
});

export function ReceiptPDF({ receipt }: ReceiptProps) {
  const { payment } = receipt;
  const invoice = payment?.invoice;
  const business = invoice?.business;
  const customer = invoice?.customer;
  const issuedDate = receipt.issuedAt ? new Date(receipt.issuedAt) : undefined;

  const fmt = (v: number) => Number.isFinite(v) ? v.toFixed(2) : '0.00';

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header: Logo/Business + Receipt Meta */}
        <View style={styles.header}>
          <View style={styles.brand}>
            {business?.logo ? (
              <Image src={business.logo} style={styles.logo} />
            ) : null}
            <View style={styles.businessInfo}>
              <Text style={styles.businessName}>{business?.name}</Text>
              {business?.address && <Text style={styles.businessMeta}>{business.address}</Text>}
            </View>
          </View>

          <View style={styles.metaBox}>
            <Text style={styles.receiptTitle}>RECEIPT</Text>
            <Text style={styles.receiptNum}>#{receipt.number}</Text>
            {issuedDate && <Text style={styles.receiptDate}>{format(issuedDate, 'dd/MM/yyyy HH:mm')}</Text>}
          </View>
        </View>

        {/* Receipt Details */}
        <View style={styles.section}>
          <View style={styles.twoCol}>
            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>From</Text>
              <Text style={styles.infoValue}>{business?.name}</Text>
              {business?.address && <Text style={styles.infoValue}>{business.address}</Text>}
            </View>
            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>Received From</Text>
              <Text style={styles.infoValue}>{customer?.name}</Text>
              {customer?.address && <Text style={styles.infoValue}>{customer.address}</Text>}
            </View>
          </View>
        </View>

        <View style={styles.separator}>
          <View style={styles.twoCol}>
            <View>
              <Text style={styles.infoLabel}>Invoice #</Text>
              <Text style={styles.infoValue}>{invoice?.number}</Text>
            </View>
            <View style={{ textAlign: 'right' }}>
              <Text style={styles.infoLabel}>Payment Date</Text>
              <Text style={styles.infoValue}>{issuedDate ? format(issuedDate, 'dd/MM/yyyy') : '—'}</Text>
            </View>
          </View>
        </View>

        {/* Amount Highlighted */}
        <View style={styles.amountBox}>
          <Text style={styles.amountLabel}>Amount Received</Text>
          <Text style={styles.amountValue}>{fmt(payment?.amount || 0)} {invoice?.currency}</Text>
        </View>

        {/* Footer Note */}
        <View style={styles.notes}>
          <Text>Thank you for your payment. Please keep this receipt for your records.</Text>
        </View>
      </Page>
    </Document>
  );
}