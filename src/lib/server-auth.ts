import { admin, firestore } from '@/firebase/firebase-admin';

export type DecodedIdToken = admin.auth.DecodedIdToken;

export async function verifyFirebaseToken(authorizationHeader: string | null): Promise<DecodedIdToken> {
  if (!authorizationHeader) throw new Error('Missing Authorization header');
  const parts = authorizationHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') throw new Error('Invalid Authorization header');
  const idToken = parts[1];

  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    return decoded;
  } catch (err) {
    throw new Error('Invalid or expired token');
  }
}

export async function ensureAdmin(authorizationHeader: string | null): Promise<DecodedIdToken> {
  const decoded = await verifyFirebaseToken(authorizationHeader);
  const role = (decoded as any).role || (decoded as any).roles || null;
  const isAdminClaim = (decoded as any).admin === true || (decoded as any).isAdmin === true;

  if (isAdminClaim || role === 'admin' || role === 'manager') return decoded;

  // Fallback: check users collection for role
  try {
    const userDoc = await firestore.collection('users').doc(decoded.uid).get();
    if (userDoc.exists) {
      const data = userDoc.data() as any;
      if (data?.role === 'admin' || data?.role === 'manager') return decoded;
    }
  } catch (e) {
    // ignore and fallthrough
  }

  throw new Error('Insufficient permissions');
}
