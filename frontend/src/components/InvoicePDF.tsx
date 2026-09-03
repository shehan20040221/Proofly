'use client';

import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 12 },
  title: { fontSize: 20, marginBottom: 20 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  label: { color: '#666' },
  total: { marginTop: 20, fontSize: 16, fontWeight: 'bold' },
  divider: { borderBottom: 1, borderColor: '#ccc', marginVertical: 10 },
});

interface InvoiceItem {
  description: string;
  amount: number;
}

export default function InvoicePDF({
  projectTitle,
  items,
  total,
}: {
  projectTitle: string;
  items: InvoiceItem[];
  total: number;
}) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Invoice — {projectTitle}</Text>

        <View style={styles.divider} />

        {items.map((item, i) => (
          <View key={i} style={styles.row}>
            <Text>{item.description}</Text>
            <Text>${Number(item.amount).toFixed(2)}</Text>
          </View>
        ))}

        <View style={styles.divider} />

        <View style={styles.row}>
          <Text style={styles.total}>Total</Text>
          <Text style={styles.total}>${Number(total).toFixed(2)}</Text>
        </View>
      </Page>
    </Document>
  );
}