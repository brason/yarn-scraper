import * as admin from "firebase-admin";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://yarn-for-more.firebaseio.com",
});

const db = admin.firestore();

(async () => {
  const yarns = await db
    .collection("yarns")
    .where("hasPrices", "==", true)
    .get();

  console.log(yarns.docs.map((doc) => doc.id).length);
})();
