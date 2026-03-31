import React from 'react';
import {
  Document, Page, Text, View, StyleSheet, Font,
} from '@react-pdf/renderer';

Font.register({
  family: 'Helvetica',
  src: undefined as any, // built-in
});

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: '#1B2A4A',
    backgroundColor: '#ffffff',
  },
  header: {
    marginBottom: 30,
    borderBottomWidth: 2,
    borderBottomColor: '#D4A853',
    paddingBottom: 20,
  },
  storeName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1B2A4A',
    marginBottom: 4,
  },
  invoiceTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#D4A853',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  infoBlock: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 8,
    color: '#8B95A5',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 3,
  },
  infoValue: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  table: {
    marginTop: 10,
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#1B2A4A',
    color: '#ffffff',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 4,
  },
  tableHeaderText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 9,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EAEDF2',
  },
  tableRowAlt: {
    backgroundColor: '#F8F9FB',
  },
  colProduct: { flex: 3 },
  colQty: { flex: 1, textAlign: 'center' },
  colPrice: { flex: 2, textAlign: 'right' },
  colTotal: { flex: 2, textAlign: 'right' },
  totalSection: {
    marginTop: 10,
    alignItems: 'flex-end',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingVertical: 4,
    width: 250,
  },
  totalLabel: {
    flex: 1,
    fontSize: 10,
    color: '#8B95A5',
  },
  totalValue: {
    flex: 1,
    fontSize: 10,
    textAlign: 'right',
    fontWeight: 'bold',
  },
  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingVertical: 10,
    paddingHorizontal: 12,
    width: 250,
    backgroundColor: '#D4A853',
    borderRadius: 4,
    marginTop: 6,
  },
  grandTotalLabel: {
    flex: 1,
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1B2A4A',
  },
  grandTotalValue: {
    flex: 1,
    fontSize: 13,
    textAlign: 'right',
    fontWeight: 'bold',
    color: '#1B2A4A',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    borderTopWidth: 1,
    borderTopColor: '#EAEDF2',
    paddingTop: 12,
    textAlign: 'center',
  },
  footerText: {
    fontSize: 8,
    color: '#8B95A5',
    textAlign: 'center',
  },
  footerBrand: {
    fontSize: 9,
    color: '#D4A853',
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 4,
  },
});

const formatCFA = (amount: number): string => {
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount) + ' FCFA';
};

export interface InvoiceItem {
  name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface InvoiceData {
  invoiceNumber: string;
  storeName: string;
  vendeurName: string;
  date: string;
  items: InvoiceItem[];
  totalAmount: number;
  status?: string;
}

const InvoicePDF: React.FC<{ data: InvoiceData }> = ({ data }) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.storeName}>{data.storeName}</Text>
          <Text style={styles.invoiceTitle}>Facture</Text>
        </View>

        {/* Invoice info */}
        <View style={styles.infoRow}>
          <View style={styles.infoBlock}>
            <Text style={styles.infoLabel}>Numéro de facture</Text>
            <Text style={styles.infoValue}>{data.invoiceNumber}</Text>
          </View>
          <View style={styles.infoBlock}>
            <Text style={styles.infoLabel}>Vendeur</Text>
            <Text style={styles.infoValue}>{data.vendeurName}</Text>
          </View>
          <View style={styles.infoBlock}>
            <Text style={styles.infoLabel}>Date &amp; Heure</Text>
            <Text style={styles.infoValue}>{data.date}</Text>
          </View>
        </View>

        {data.status === 'cancelled' && (
          <View style={{ backgroundColor: '#FEE2E2', padding: 8, borderRadius: 4, marginBottom: 16 }}>
            <Text style={{ color: '#DC2626', fontWeight: 'bold', textAlign: 'center', fontSize: 12 }}>
              FACTURE ANNULÉE
            </Text>
          </View>
        )}

        {/* Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, styles.colProduct]}>Article</Text>
            <Text style={[styles.tableHeaderText, styles.colQty]}>Qté</Text>
            <Text style={[styles.tableHeaderText, styles.colPrice]}>Prix unitaire</Text>
            <Text style={[styles.tableHeaderText, styles.colTotal]}>Total</Text>
          </View>
          {data.items.map((item, index) => (
            <View
              key={index}
              style={[styles.tableRow, index % 2 === 1 ? styles.tableRowAlt : {}]}
            >
              <Text style={styles.colProduct}>{item.name}</Text>
              <Text style={styles.colQty}>{item.quantity}</Text>
              <Text style={styles.colPrice}>{formatCFA(item.unit_price)}</Text>
              <Text style={styles.colTotal}>{formatCFA(item.total_price)}</Text>
            </View>
          ))}
        </View>

        {/* Total */}
        <View style={styles.totalSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Sous-total</Text>
            <Text style={styles.totalValue}>{formatCFA(data.totalAmount)}</Text>
          </View>
          <View style={styles.grandTotalRow}>
            <Text style={styles.grandTotalLabel}>Total</Text>
            <Text style={styles.grandTotalValue}>{formatCFA(data.totalAmount)}</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Merci pour votre achat • {data.storeName}
          </Text>
          <Text style={styles.footerBrand}>
            Logiciel de gestion interne — ON AGENCY
          </Text>
        </View>
      </Page>
    </Document>
  );
};

export default InvoicePDF;
