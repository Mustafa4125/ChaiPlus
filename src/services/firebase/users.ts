import { collection, deleteDoc, doc, getDoc, getDocs, query, setDoc, updateDoc, where, type DocumentData } from 'firebase/firestore';
import { createUserWithEmailAndPassword, getAuth as getIsolatedAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { deleteApp, initializeApp } from 'firebase/app';
import { firebaseConfig, getFirebaseAuth, getFirebaseDb } from '@/services/firebase/firebase';
import type { User } from '@/types';

export type AppUserRole = User['role'];

export interface FirebaseUserProfile {
  uid: string;
  username: string;
  email: string;
  name: string;
  phone: string;
  avatar: string;
  role: AppUserRole;
  businessId?: string;
  isActive?: boolean;
}

const normalizeUsername = (value: string) => value.trim().toLowerCase();

// Guards against Firebase calls that never resolve/reject (bad network, blocked domain, etc.) so the UI never hangs forever.
const withTimeout = <T>(promise: Promise<T>, ms = 8000, message = 'İşlem zaman aşımına uğradı. Lütfen tekrar deneyin.'): Promise<T> => {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error(message)), ms);
  });
  return Promise.race([promise, timeoutPromise]);
};

// Tags a failure with which step produced it, so the toast message pinpoints the exact failing Firebase call.
const withStep = async <T>(step: string, promise: Promise<T>): Promise<T> => {
  try {
    return await promise;
  } catch (err) {
    const code = (err as { code?: string })?.code;
    const msg = err instanceof Error ? err.message : String(err);
    throw new Error(`[${step}] ${code ?? ''} ${msg}`.trim());
  }
};

export const DEFAULT_ADMIN_USERNAME = 'admin';
export const DEFAULT_ADMIN_PASSWORD = 'admin123';

const getLocalAdminProfile = (): FirebaseUserProfile => ({
  uid: 'local-admin',
  username: DEFAULT_ADMIN_USERNAME,
  email: 'admin@local.chaiplus',
  name: 'Admin',
  phone: '',
  avatar: '',
  role: 'admin',
  isActive: true,
});

export const resolveUserByUsername = async (username: string): Promise<FirebaseUserProfile | null> => {
  const db = getFirebaseDb();
  const normalized = normalizeUsername(username);
  if (!normalized) return null;

  if (!db) {
    return normalized === DEFAULT_ADMIN_USERNAME ? getLocalAdminProfile() : null;
  }

  const q = query(collection(db, 'users'), where('username', '==', normalized));
  const snapshot = await getDocs(q);

  if (snapshot.empty) return null;

  const docSnapshot = snapshot.docs[0];
  const data = docSnapshot.data() as DocumentData;

  return {
    uid: docSnapshot.id,
    username: String(data.username ?? normalized),
    email: String(data.email ?? ''),
    name: String(data.name ?? 'Kullanıcı'),
    phone: String(data.phone ?? ''),
    avatar: String(data.avatar ?? ''),
    role: (data.role === 'admin' || data.role === 'esnaf' || data.role === 'customer' ? data.role : 'esnaf') as AppUserRole,
    businessId: data.businessId ? String(data.businessId) : undefined,
    isActive: data.isActive !== false,
  };
};

// Public doc, readable while signed out, so login can resolve an email without querying the protected `users` collection first.
const setUsernameEmailLookup = async (username: string, email: string, uid: string) => {
  const db = getFirebaseDb();
  if (!db) return;
  await setDoc(doc(db, 'usernameEmails', normalizeUsername(username)), { email, uid });
};

const deleteUsernameEmailLookup = async (username: string) => {
  const db = getFirebaseDb();
  if (!db) return;
  await deleteDoc(doc(db, 'usernameEmails', normalizeUsername(username)));
};

const resolveEmailByUsername = async (username: string): Promise<string | null> => {
  const db = getFirebaseDb();
  const normalized = normalizeUsername(username);
  if (!db || !normalized) return null;

  const snapshot = await getDoc(doc(db, 'usernameEmails', normalized));
  if (!snapshot.exists()) return null;

  const email = (snapshot.data() as DocumentData).email;
  return typeof email === 'string' && email ? email : null;
};

export const getUserProfileByUid = async (uid: string): Promise<FirebaseUserProfile | null> => {
  const db = getFirebaseDb();
  if (!db) {
    return uid === 'local-admin' ? getLocalAdminProfile() : null;
  }

  const docSnapshot = await getDoc(doc(db, 'users', uid));
  if (!docSnapshot.exists()) return null;

  const data = docSnapshot.data() as DocumentData;

  return {
    uid: docSnapshot.id,
    username: String(data.username ?? ''),
    email: String(data.email ?? ''),
    name: String(data.name ?? 'Kullanıcı'),
    phone: String(data.phone ?? ''),
    avatar: String(data.avatar ?? ''),
    role: (data.role === 'admin' || data.role === 'esnaf' || data.role === 'customer' ? data.role : 'esnaf') as AppUserRole,
    businessId: data.businessId ? String(data.businessId) : undefined,
    isActive: data.isActive !== false,
  };
};

export const mapFirebaseProfileToAppUser = (profile: FirebaseUserProfile): User => ({
  id: profile.uid,
  username: profile.username,
  name: profile.name,
  email: profile.email,
  phone: profile.phone,
  avatar: profile.avatar,
  role: profile.role,
  businessId: profile.businessId,
});

export const updateUserAccountByAdmin = async ({
  uid,
  username,
  name,
  email,
  phone,
  role,
  businessId,
  isActive,
}: {
  uid: string;
  username?: string;
  name?: string;
  email?: string;
  phone?: string;
  role?: AppUserRole;
  businessId?: string;
  isActive?: boolean;
}) => {
  const db = getFirebaseDb();
  if (!db) {
    throw new Error('Firebase Firestore henüz yapılandırılmadı.');
  }

  const userRef = doc(db, 'users', uid);
  const current = await getDoc(userRef);
  if (!current.exists()) {
    throw new Error('Müşteri bulunamadı.');
  }

  const currentData = current.data() as DocumentData;
  const previousUsername = normalizeUsername(String(currentData.username ?? ''));
  const nextUsername = (username ?? String(currentData.username ?? '')).trim().toLowerCase();
  const nextName = (name ?? String(currentData.name ?? '')).trim();
  const nextEmail = (email ?? String(currentData.email ?? '')).trim() || `${nextUsername || uid}@chaiplus.local`;
  const nextPhone = phone ?? String(currentData.phone ?? '');
  const nextRole = role ?? ((currentData.role === 'admin' || currentData.role === 'esnaf' || currentData.role === 'customer') ? currentData.role : 'customer');

  await updateDoc(userRef, {
    username: nextUsername,
    name: nextName || nextUsername || 'Müşteri',
    email: nextEmail,
    phone: nextPhone,
    role: nextRole,
    businessId: businessId ?? currentData.businessId ?? '',
    isActive: isActive ?? currentData.isActive !== false,
    updatedAt: new Date().toISOString(),
  });

  if (previousUsername && previousUsername !== normalizeUsername(nextUsername)) {
    await deleteUsernameEmailLookup(previousUsername);
  }
  await setUsernameEmailLookup(nextUsername, nextEmail, uid);

  return getUserProfileByUid(uid);
};

export const getAllUsersProfiles = async (): Promise<FirebaseUserProfile[]> => {
  const db = getFirebaseDb();
  if (!db) return [];

  const snapshot = await getDocs(collection(db, 'users'));
  return snapshot.docs.map((docSnapshot) => {
    const data = docSnapshot.data() as DocumentData;
    return {
      uid: docSnapshot.id,
      username: String(data.username ?? ''),
      email: String(data.email ?? ''),
      name: String(data.name ?? 'Kullanıcı'),
      phone: String(data.phone ?? ''),
      avatar: String(data.avatar ?? ''),
      role: (data.role === 'admin' || data.role === 'esnaf' || data.role === 'customer' ? data.role : 'esnaf') as AppUserRole,
      businessId: data.businessId ? String(data.businessId) : undefined,
      isActive: data.isActive !== false,
    };
  });
};

export const fallbackProfileFromEmail = (email: string, uid: string): FirebaseUserProfile => {
  const cleaned = email.trim();
  const username = cleaned.split('@')[0] || 'esnaf';

  return {
    uid,
    username,
    email: cleaned,
    name: cleaned.split('@')[0] || 'Esnaf',
    phone: '',
    avatar: '',
    role: cleaned.toLowerCase().includes('admin') ? 'admin' : 'esnaf',
    isActive: true,
  };
};

export const ensureDefaultAdminAccount = async (): Promise<FirebaseUserProfile | null> => {
  const auth = getFirebaseAuth();
  const db = getFirebaseDb();

  if (!auth || !db) return null;

  let uid: string;
  let resolvedEmail = 'admin@chaiplus.local';

  // Sign in first — avoids unauthenticated Firestore reads. Only sign-in errors are handled here;
  // errors from the Firestore calls below must NOT be misclassified as "account doesn't exist yet".
  try {
    const credential = await withTimeout(signInWithEmailAndPassword(auth, 'admin@chaiplus.local', DEFAULT_ADMIN_PASSWORD));
    uid = credential.user.uid;
  } catch (signInError: unknown) {
    const code = (signInError as { code?: string }).code ?? '';
    const notFound = code.includes('user-not-found') || code.includes('invalid-credential') || code.includes('INVALID_LOGIN_CREDENTIALS') || code.includes('wrong-password');
    if (!notFound) throw signInError;

    const credential = await withStep('admin:createAuth', withTimeout(createUserWithEmailAndPassword(auth, 'admin@chaiplus.local', DEFAULT_ADMIN_PASSWORD)));
    uid = credential.user.uid;
    resolvedEmail = credential.user.email ?? resolvedEmail;
  }

  const existing = await withStep('admin:getUserDoc', withTimeout(getDoc(doc(db, 'users', uid))));
  if (!existing.exists()) {
    await withStep('admin:createUserDoc', withTimeout(setDoc(doc(db, 'users', uid), {
      username: DEFAULT_ADMIN_USERNAME, email: resolvedEmail, name: 'Admin',
      phone: '', avatar: '', role: 'admin', businessId: '', isActive: true,
      createdAt: new Date().toISOString(),
    })));
  }
  await withStep('admin:usernameLookup', withTimeout(setUsernameEmailLookup(DEFAULT_ADMIN_USERNAME, resolvedEmail, uid)));

  return { uid, username: DEFAULT_ADMIN_USERNAME, email: resolvedEmail, name: 'Admin', phone: '', avatar: '', role: 'admin', isActive: true };
};

export const authenticateWithUsernameAndPassword = async (username: string, password: string): Promise<User> => {
  const normalizedUsername = normalizeUsername(username);
  const auth = getFirebaseAuth();

  // Local bypass only when Firebase is NOT configured
  if (!auth) {
    if (normalizedUsername === DEFAULT_ADMIN_USERNAME && password === DEFAULT_ADMIN_PASSWORD) {
      return mapFirebaseProfileToAppUser(getLocalAdminProfile());
    }
    throw new Error('Firebase Authentication henüz yapılandırılmadı. Lütfen Firebase ortam değişkenlerini ekleyin.');
  }

  if (normalizedUsername === DEFAULT_ADMIN_USERNAME) {
    if (password !== DEFAULT_ADMIN_PASSWORD) {
      throw new Error('Kullanıcı adı veya şifre hatalı.');
    }
    // Already signed in and verified above — reuse this result directly instead of signing in again.
    const adminProfile = await ensureDefaultAdminAccount();
    if (!adminProfile) {
      throw new Error('Admin hesabı hazırlanamadı. Lütfen tekrar deneyin.');
    }
    return mapFirebaseProfileToAppUser(adminProfile);
  }

  // Resolve the email via the public lookup doc — the `users` collection itself requires auth to read.
  const email = await withStep('login:resolveEmail', withTimeout(resolveEmailByUsername(normalizedUsername)));
  if (!email) {
    throw new Error('Bu kullanıcı adıyla kayıtlı hesap bulunamadı.');
  }

  const credential = await withStep(
    'login:signIn',
    withTimeout(signInWithEmailAndPassword(auth, email, password), 8000, 'Firebase giriş süresi doldu. Lütfen tekrar deneyin.'),
  );
  const freshProfile =
    (await withStep('login:getProfile', withTimeout(getUserProfileByUid(credential.user.uid)))) ??
    fallbackProfileFromEmail(credential.user.email ?? email, credential.user.uid);

  if (freshProfile.isActive === false) {
    throw new Error('Bu hesap pasif durumda.');
  }

  return mapFirebaseProfileToAppUser(freshProfile);
};

// Creates a Firebase Auth user in a secondary app instance to preserve the admin's active session
const createAuthUserInIsolation = async (email: string, password: string): Promise<{ uid: string; email: string }> => {
  const tempApp = initializeApp(firebaseConfig, `chaiplus-tmp-${Date.now()}`);
  const tempAuth = getIsolatedAuth(tempApp);
  try {
    const credential = await createUserWithEmailAndPassword(tempAuth, email, password);
    return { uid: credential.user.uid, email: credential.user.email ?? email };
  } finally {
    await deleteApp(tempApp);
  }
};

export const createUserAccountByAdmin = async ({
  username,
  password,
  name,
  role,
  email,
  businessId,
}: {
  username: string;
  password: string;
  name: string;
  role: 'admin' | 'esnaf' | 'customer';
  email?: string;
  businessId?: string;
}) => {
  const db = getFirebaseDb();

  if (!db) {
    throw new Error('Firebase Firestore henüz yapılandırılmadı.');
  }

  const normalizedUsername = username.trim();
  if (!normalizedUsername || !password.trim()) {
    throw new Error('Kullanıcı adı ve şifre zorunludur.');
  }

  const normalizedEmail = (email ?? `${normalizedUsername}@chaiplus.local`).trim();
  const existingProfile = await resolveUserByUsername(normalizedUsername);
  if (existingProfile) {
    throw new Error('Bu kullanıcı adı zaten kullanılıyor.');
  }

  const { uid, email: createdEmail } = await createAuthUserInIsolation(normalizedEmail, password);
  const profile: FirebaseUserProfile = {
    uid,
    username: normalizedUsername.toLowerCase(),
    email: createdEmail,
    name: name.trim() || normalizedUsername,
    phone: '',
    avatar: '',
    role,
    businessId,
    isActive: true,
  };

  await setDoc(doc(db, 'users', uid), {
    username: profile.username,
    email: profile.email,
    name: profile.name,
    phone: profile.phone,
    avatar: profile.avatar,
    role: profile.role,
    businessId: profile.businessId ?? '',
    isActive: profile.isActive,
    createdAt: new Date().toISOString(),
  });

  await setUsernameEmailLookup(profile.username, profile.email, uid);

  return mapFirebaseProfileToAppUser(profile);
};
