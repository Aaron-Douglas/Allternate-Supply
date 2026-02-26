import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { CURRENCY } from '@/lib/currency';

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 11, fontFamily: 'Helvetica' },
  header: { textAlign: 'center', marginBottom: 20 },
  shopName: { fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  shopInfo: { fontSize: 9, color: '#666' },
  title: { fontSize: 16, fontWeight: 'bold', textAlign: 'center', marginBottom: 16 },
  divider: { borderBottomWidth: 1, borderBottomColor: '#ccc', marginVertical: 10 },
  section: { marginBottom: 12 },
  sectionTitle: { fontSize: 12, fontWeight: 'bold', marginBottom: 6, color: '#333' },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 },
  label: { color: '#666', width: '40%' },
  value: { fontWeight: 'bold', width: '60%', textAlign: 'right' },
  footer: { marginTop: 20, textAlign: 'center', fontSize: 10, color: '#999' },
  policyText: { fontSize: 8, color: '#888', marginTop: 4 },
});

type ReceiptData = {
  receiptNumber: string;
  date: string;
  item: {
    sku: string;
    title: string;
    category: string;
    specs: Record<string, unknown>;
    cosmeticGrade: string | null;
    functionalGrade: string | null;
  };
  sale: {
    buyerName: string | null;
    buyerPhone: string | null;
    salePrice: number;
    paymentMethod: string | null;
    fulfillmentType: string | null;
  };
  warranty: string | null;
  returns: string | null;
  shopName: string;
  shopAddress: string;
  shopPhone: string;
};

export function ReceiptPDF({ data }: { data: ReceiptData }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.shopName}>{data.shopName}</Text>
          <Text style={styles.shopInfo}>{data.shopAddress}</Text>
          <Text style={styles.shopInfo}>{data.shopPhone}</Text>
        </View>

        <Text style={styles.title}>RECEIPT</Text>

        <View style={styles.row}>
          <Text style={styles.label}>Receipt #:</Text>
          <Text style={styles.value}>{data.receiptNumber}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Date:</Text>
          <Text style={styles.value}>{data.date}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ITEM DETAILS</Text>
          <View style={styles.row}>
            <Text style={styles.label}>SKU:</Text>
            <Text style={styles.value}>{data.item.sku}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Title:</Text>
            <Text style={styles.value}>{data.item.title}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Category:</Text>
            <Text style={styles.value}>{data.item.category}</Text>
          </View>
          {data.item.cosmeticGrade && (
            <View style={styles.row}>
              <Text style={styles.label}>Condition:</Text>
              <Text style={styles.value}>
                Grade {data.item.cosmeticGrade} (Cosmetic) / Grade {data.item.functionalGrade || 'N/A'} (Functional)
              </Text>
            </View>
          )}
        </View>

        <View style={styles.divider} />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SALE DETAILS</Text>
          {data.sale.buyerName && (
            <View style={styles.row}>
              <Text style={styles.label}>Buyer:</Text>
              <Text style={styles.value}>{data.sale.buyerName}</Text>
            </View>
          )}
          {data.sale.buyerPhone && (
            <View style={styles.row}>
              <Text style={styles.label}>Phone:</Text>
              <Text style={styles.value}>{data.sale.buyerPhone}</Text>
            </View>
          )}
          <View style={styles.row}>
            <Text style={styles.label}>Sale Price:</Text>
            <Text style={styles.value}>{CURRENCY} {data.sale.salePrice.toLocaleString()}</Text>
          </View>
          {data.sale.paymentMethod && (
            <View style={styles.row}>
              <Text style={styles.label}>Payment:</Text>
              <Text style={styles.value}>{data.sale.paymentMethod.replace('_', ' ')}</Text>
            </View>
          )}
          {data.sale.fulfillmentType && (
            <View style={styles.row}>
              <Text style={styles.label}>Fulfillment:</Text>
              <Text style={styles.value}>{data.sale.fulfillmentType}</Text>
            </View>
          )}
        </View>

        <View style={styles.divider} />

        {(data.warranty || data.returns) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>POLICIES</Text>
            {data.warranty && (
              <>
                <Text style={{ fontSize: 9, fontWeight: 'bold', marginBottom: 2 }}>Warranty:</Text>
                <Text style={styles.policyText}>{data.warranty.replace(/<[^>]*>/g, '')}</Text>
              </>
            )}
            {data.returns && (
              <>
                <Text style={{ fontSize: 9, fontWeight: 'bold', marginTop: 6, marginBottom: 2 }}>Returns:</Text>
                <Text style={styles.policyText}>{data.returns.replace(/<[^>]*>/g, '')}</Text>
              </>
            )}
          </View>
        )}

        <View style={styles.footer}>
          <Text>Thank you for your purchase!</Text>
          <Text style={{ marginTop: 4 }}>{data.shopName} | {data.shopPhone}</Text>
        </View>
      </Page>
    </Document>
  );
}
