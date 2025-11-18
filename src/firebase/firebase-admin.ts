import * as admin from "firebase-admin"

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  })
}

const firestore = admin.firestore()
const auth = admin.auth()
const db = admin.firestore()

export { admin, firestore, auth, db }
