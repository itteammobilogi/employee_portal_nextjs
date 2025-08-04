import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Image,
  Link,
} from "@react-pdf/renderer";

// Styles
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 12,
    backgroundColor: "#f9f9f9",
    color: "#1f1f1f",
    fontFamily: "Helvetica",
  },
  header: {
    alignItems: "center",
    marginBottom: 20,
  },
  logo: {
    width: 100,
    height: 30,
    marginBottom: 10,
  },
  companyName: {
    fontSize: 14,
    fontWeight: "bold",
  },
  companyAddress: {
    fontSize: 10,
    textAlign: "center",
    color: "#555",
  },
  monthHeading: {
    fontSize: 11,
    marginTop: 6,
    color: "#333",
  },
  sectionCard: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    padding: 14,
    marginBottom: 12,
    border: "1px solid #e0e0e0",
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "bold",
    marginBottom: 8,
    borderBottom: "1px solid #dcdcdc",
    paddingBottom: 4,
    color: "#004d00",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 2,
  },
  label: {
    fontSize: 10,
  },
  value: {
    fontSize: 10,
    fontWeight: 500,
  },
  boldRow: {
    marginTop: 6,
    borderTop: "1px solid #dcdcdc",
    paddingTop: 6,
    fontWeight: "bold",
  },
  netPay: {
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "right",
    color: "#007f00",
    marginTop: 10,
  },
  footer: {
    fontSize: 9,
    textAlign: "center",
    marginTop: 24,
    color: "#777",
  },
  link: {
    color: "#007acc",
    textDecoration: "none",
  },
});

const PayrollSlipPDF = ({ payroll }) => (
  <Document>
    <Page style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <Image style={styles.logo} src="/image.png" />
        <Text style={styles.companyName}>Mobilogi Technologies Pvt Ltd</Text>
        <Text style={styles.companyAddress}>
          11th Floor, Office No A-1106, Ozone Business Centre,
        </Text>
        <Text style={styles.companyAddress}>
          Saboo Siddique Maternity Home Compound, Nagpada, Mumbai - 400008
        </Text>
        <Text style={styles.monthHeading}>
          Payslip for the Month of {payroll.salary_month}
        </Text>
      </View>

      {/* Employee Details */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Employee Details</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Name</Text>
          <Text style={styles.value}>
            {payroll.first_name} {payroll.last_name}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>{payroll.email}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Phone</Text>
          <Text style={styles.value}>{payroll.phone}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Designation</Text>
          <Text style={styles.value}>{payroll.designation}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Date of Joining</Text>
          <Text style={styles.value}>{payroll.date_of_joining}</Text>
        </View>
      </View>

      {/* Earnings */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Earnings</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Basic</Text>
          <Text style={styles.value}>₹{payroll.basic}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>HRA</Text>
          <Text style={styles.value}>₹{payroll.hra}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Bonus</Text>
          <Text style={styles.value}>₹{payroll.bonus}</Text>
        </View>
        <View style={[styles.row, styles.boldRow]}>
          <Text style={styles.label}>Gross</Text>
          <Text style={styles.value}>₹{payroll.gross_pay}</Text>
        </View>
      </View>

      {/* Deductions */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Deductions</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Tax</Text>
          <Text style={styles.value}>₹{payroll.tax}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>PF</Text>
          <Text style={styles.value}>₹{payroll.pf}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Other Deductions</Text>
          <Text style={styles.value}>₹{payroll.other_deductions}</Text>
        </View>
        <View style={[styles.row, styles.boldRow]}>
          <Text style={styles.label}>Total</Text>
          <Text style={styles.value}>₹{payroll.deduction}</Text>
        </View>
      </View>

      {/* Net Pay */}
      <Text style={styles.netPay}>Net Pay: ₹{payroll.net_pay}</Text>

      {/* Footer */}
      <Text style={styles.footer}>
        Powered by{" "}
        <Link src="https://mobilogi.com" style={styles.link}>
          mobilogi.com
        </Link>
      </Text>
    </Page>
  </Document>
);

export default PayrollSlipPDF;
