import {
  Image,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1.2,
    borderBottomColor: "#cbd5e1",
    paddingBottom: 6,
    flexDirection: "row",
    alignItems: "center",
    minHeight: 72,
  },

  logoArea: {
    width: 92,
    alignItems: "center",
    justifyContent: "center",
  },

  logo: {
    width: 68,
    height: 68,
    objectFit: "contain",
  },

  textArea: {
    flex: 1,
    alignItems: "center",
    paddingRight: 92,
  },

  title: {
    color: "#ef1b24",
    fontFamily: "Helvetica-Bold",
    fontSize: 30,
    lineHeight: 1,
},

address: {
    marginTop: 5,
    color: "#30349a",
    fontFamily: "Helvetica-Bold",
    fontSize: 11.5,
    letterSpacing: 0.5,
},

contact: {
    marginTop: 4,
    color: "#30349a",
    fontFamily: "Helvetica",
    fontSize: 10,
},
});

export default function ReportPdfHeader({
  logoDataUrl,
}: {
  logoDataUrl: string | null;
}) {
  return (
    <View style={styles.container}>
      <View style={styles.logoArea}>
        {logoDataUrl ? (
          <Image
            src={logoDataUrl}
            style={styles.logo}
          />
        ) : null}
      </View>

      <View style={styles.textArea}>
        <Text style={styles.title}>
          Life Care Lab
        </Text>

        <Text style={styles.address}>
          OPP. NADRA OFFICE, STADIUM ROAD, DASKA
        </Text>

        <Text style={styles.contact}>
          Mobile: 03123710892 Email:
          lifecarelab560@gmail.com
        </Text>
      </View>
    </View>
  );
}