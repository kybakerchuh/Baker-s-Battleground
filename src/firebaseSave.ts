import { initializeApp } from 'firebase/app';
import {
  GoogleAuthProvider,
  User,
  getAuth,
  onAuthStateChanged,
  signInWithPopup,
  signOut
} from 'firebase/auth';
import {
  Timestamp,
  collection,
  doc,
  getDoc,
  getDocFromServer,
  getFirestore,
  onSnapshot,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  where
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write'
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map(provider => ({
          providerId: provider.providerId,
          email: provider.email
        })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

async function testConnection(): Promise<void> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}
void testConnection();

export interface UserSaveProfile {
  uid: string;
  displayName: string;
  photoURL?: string;
  totalCorrect: number;
  totalAttempted: number;
  gamesPlayed: number;
  victories: number;
  bestGameRate: number;
  lastGameCorrect: number;
  lastGameAttempted: number;
  lastGameRate: number;
  lastHeroId?: string;
  lastTopicId?: string;
  createdAt?: Timestamp | null;
  updatedAt?: Timestamp | null;
}

export interface GameRunRecord {
  id: string;
  uid: string;
  heroId: string;
  heroName: string;
  topicId: string;
  topicTitle: string;
  intensity: 'easy' | 'medium' | 'hard' | 'extreme';
  wave: number;
  victory: boolean;
  kills: number;
  correct: number;
  attempted: number;
  correctRate: number;
  playedAtMs: number;
}

export interface CloudSaveSnapshot {
  authReady: boolean;
  user: User | null;
  profile: UserSaveProfile | null;
  games: GameRunRecord[];
  syncStatus: 'signed_out' | 'syncing' | 'synced' | 'error';
  statusMessage: string;
}

function sanitizeDisplayName(user: User): string {
  const raw = (user.displayName || user.email?.split('@')[0] || 'Operative').trim();
  return (raw || 'Operative').slice(0, 100);
}

function sanitizePhotoUrl(user: User): string | undefined {
  if (!user.photoURL) return undefined;
  const trimmed = user.photoURL.trim();
  return trimmed.length > 0 && trimmed.length <= 500 ? trimmed : undefined;
}

function sanitizeIdField(val: string | undefined, fallback: string, maxLen = 40): string {
  const cleaned = (val || fallback).replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, maxLen);
  return cleaned || fallback;
}

export class FirebaseSaveManager {
  private state: CloudSaveSnapshot = {
    authReady: false,
    user: null,
    profile: null,
    games: [],
    syncStatus: 'signed_out',
    statusMessage: 'Sign in with Google to sync your lifetime accuracy & unlocks.'
  };

  private listeners = new Set<(snap: CloudSaveSnapshot) => void>();
  private unsubProfile: (() => void) | null = null;
  private unsubGames: (() => void) | null = null;
  private writeQueue: Promise<void> = Promise.resolve();

  constructor() {
    onAuthStateChanged(auth, user => {
      this.cleanupListeners();
      this.state = {
        ...this.state,
        authReady: true,
        user,
        profile: user ? this.state.profile : null,
        games: user ? this.state.games : [],
        syncStatus: user ? 'syncing' : 'signed_out',
        statusMessage: user
          ? `Loading cloud save for ${sanitizeDisplayName(user)}...`
          : 'Sign in with Google to sync your lifetime accuracy & unlocks.'
      };
      this.notify();

      if (user) {
        void this.ensureProfileAndSubscribe(user);
      }
    });
  }

  public subscribe(cb: (snap: CloudSaveSnapshot) => void): () => void {
    this.listeners.add(cb);
    cb(this.state);
    return () => {
      this.listeners.delete(cb);
    };
  }

  public getSnapshot(): CloudSaveSnapshot {
    return this.state;
  }

  private notify(): void {
    for (const cb of this.listeners) {
      cb(this.state);
    }
  }

  private cleanupListeners(): void {
    if (this.unsubProfile) {
      this.unsubProfile();
      this.unsubProfile = null;
    }
    if (this.unsubGames) {
      this.unsubGames();
      this.unsubGames = null;
    }
  }

  public async signInWithGoogle(): Promise<void> {
    try {
      this.state = {
        ...this.state,
        syncStatus: 'syncing',
        statusMessage: 'Opening Google Sign-In...'
      };
      this.notify();
      await signInWithPopup(auth, googleProvider);
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code || '';
      let msg = 'Google Sign-In failed. Please try again.';
      if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
        msg = 'Sign-in cancelled. Click Sign In with Google whenever ready.';
      } else if (code === 'auth/unauthorized-domain') {
        msg =
          `Domain "${window.location.hostname}" is not authorized yet in Firebase Auth. Add it in Firebase Console → Authentication → Authorized domains.`;
      } else if (code === 'auth/popup-blocked') {
        msg = 'Popup blocked by browser. Allow popups for this site and click Sign In again.';
      }
      this.state = {
        ...this.state,
        syncStatus: 'error',
        statusMessage: msg
      };
      this.notify();
    }
  }

  public async signOutUser(): Promise<void> {
    this.cleanupListeners();
    await signOut(auth);
  }

  private async ensureProfileAndSubscribe(user: User): Promise<void> {
    const userPath = `users/${user.uid}`;
    const userRef = doc(db, 'users', user.uid);

    try {
      const existingSnap = await getDoc(userRef);
      if (!existingSnap.exists()) {
        const photo = sanitizePhotoUrl(user);
        const initialProfile: Record<string, unknown> = {
          uid: user.uid,
          displayName: sanitizeDisplayName(user),
          totalCorrect: 0,
          totalAttempted: 0,
          gamesPlayed: 0,
          victories: 0,
          bestGameRate: 0,
          lastGameCorrect: 0,
          lastGameAttempted: 0,
          lastGameRate: 0,
          lastHeroId: 'nova',
          lastTopicId: 'all',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };
        if (photo) initialProfile.photoURL = photo;
        await setDoc(userRef, initialProfile);
      }
    } catch (error) {
      this.state = {
        ...this.state,
        syncStatus: 'error',
        statusMessage: 'Could not initialize cloud save profile.'
      };
      this.notify();
      handleFirestoreError(error, OperationType.WRITE, userPath);
    }

    this.unsubProfile = onSnapshot(
      userRef,
      snap => {
        if (snap.exists()) {
          const data = snap.data() as UserSaveProfile;
          this.state = {
            ...this.state,
            profile: data,
            syncStatus: 'synced',
            statusMessage: 'Cloud Save Synced'
          };
          this.notify();
        }
      },
      error => {
        this.state = {
          ...this.state,
          syncStatus: 'error',
          statusMessage: 'Cloud Save read error.'
        };
        this.notify();
        handleFirestoreError(error, OperationType.GET, userPath);
      }
    );

    const gamesPath = `users/${user.uid}/games`;
    const gamesQ = query(collection(db, 'users', user.uid, 'games'), where('uid', '==', user.uid));
    this.unsubGames = onSnapshot(
      gamesQ,
      snap => {
        const list: GameRunRecord[] = snap.docs.map(d => {
          const raw = d.data() as {
            uid: string;
            heroId: string;
            heroName: string;
            topicId: string;
            topicTitle: string;
            intensity: 'easy' | 'medium' | 'hard' | 'extreme';
            wave: number;
            victory: boolean;
            kills: number;
            correct: number;
            attempted: number;
            correctRate: number;
            playedAt?: Timestamp | null;
          };
          const playedAtMs =
            raw.playedAt && typeof raw.playedAt.toMillis === 'function'
              ? raw.playedAt.toMillis()
              : Date.now();
          return {
            id: d.id,
            uid: raw.uid,
            heroId: raw.heroId,
            heroName: raw.heroName,
            topicId: raw.topicId,
            topicTitle: raw.topicTitle,
            intensity: raw.intensity,
            wave: raw.wave,
            victory: raw.victory,
            kills: raw.kills,
            correct: raw.correct,
            attempted: raw.attempted,
            correctRate: raw.correctRate,
            playedAtMs
          };
        });
        list.sort((a, b) => b.playedAtMs - a.playedAtMs);
        this.state = {
          ...this.state,
          games: list.slice(0, 50)
        };
        this.notify();
      },
      error => {
        handleFirestoreError(error, OperationType.LIST, gamesPath);
      }
    );
  }

  private enqueueWrite(task: () => Promise<void>): Promise<void> {
    const next = this.writeQueue.then(task, task);
    this.writeQueue = next.catch(() => {});
    return next;
  }

  public async savePreferences(heroId: string, topicId: string): Promise<void> {
    const user = auth.currentUser;
    if (!user) return;
    return this.enqueueWrite(async () => {
      const userPath = `users/${user.uid}`;
      const userRef = doc(db, 'users', user.uid);
      try {
        await runTransaction(db, async tx => {
          const snap = await tx.get(userRef);
          if (!snap.exists()) return;
          const photo = sanitizePhotoUrl(user);
          const payload: Record<string, unknown> = {
            displayName: sanitizeDisplayName(user),
            lastHeroId: sanitizeIdField(heroId, 'nova'),
            lastTopicId: sanitizeIdField(topicId, 'all'),
            updatedAt: serverTimestamp()
          };
          if (photo) payload.photoURL = photo;
          tx.update(userRef, payload);
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, userPath);
      }
    });
  }

  public async recordQuestionDelta(
    correctDelta: number,
    attemptedDelta: number,
    heroId: string,
    topicId: string
  ): Promise<void> {
    const user = auth.currentUser;
    if (!user || (correctDelta <= 0 && attemptedDelta <= 0)) return;
    const safeCorrect = Math.max(0, Math.floor(correctDelta));
    const safeAttempted = Math.max(safeCorrect, Math.floor(attemptedDelta));

    return this.enqueueWrite(async () => {
      const userPath = `users/${user.uid}`;
      const userRef = doc(db, 'users', user.uid);
      try {
        this.state = { ...this.state, syncStatus: 'syncing', statusMessage: 'Syncing answer...' };
        this.notify();
        await runTransaction(db, async tx => {
          const snap = await tx.get(userRef);
          const photo = sanitizePhotoUrl(user);
          if (!snap.exists()) {
            const createPayload: Record<string, unknown> = {
              uid: user.uid,
              displayName: sanitizeDisplayName(user),
              totalCorrect: safeCorrect,
              totalAttempted: safeAttempted,
              gamesPlayed: 0,
              victories: 0,
              bestGameRate: 0,
              lastGameCorrect: 0,
              lastGameAttempted: 0,
              lastGameRate: 0,
              lastHeroId: sanitizeIdField(heroId, 'nova'),
              lastTopicId: sanitizeIdField(topicId, 'all'),
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp()
            };
            if (photo) createPayload.photoURL = photo;
            tx.set(userRef, createPayload);
            return;
          }
          const cur = snap.data() as UserSaveProfile;
          const nextCorrect = cur.totalCorrect + safeCorrect;
          const nextAttempted = Math.max(nextCorrect, cur.totalAttempted + safeAttempted);
          const updatePayload: Record<string, unknown> = {
            displayName: sanitizeDisplayName(user),
            totalCorrect: nextCorrect,
            totalAttempted: nextAttempted,
            gamesPlayed: cur.gamesPlayed,
            victories: cur.victories,
            bestGameRate: cur.bestGameRate,
            lastGameCorrect: cur.lastGameCorrect,
            lastGameAttempted: cur.lastGameAttempted,
            lastGameRate: cur.lastGameRate,
            lastHeroId: sanitizeIdField(heroId, 'nova'),
            lastTopicId: sanitizeIdField(topicId, 'all'),
            updatedAt: serverTimestamp()
          };
          if (photo) updatePayload.photoURL = photo;
          tx.update(userRef, updatePayload);
        });
        this.state = { ...this.state, syncStatus: 'synced', statusMessage: 'Cloud Save Synced' };
        this.notify();
      } catch (error) {
        this.state = { ...this.state, syncStatus: 'error', statusMessage: 'Save sync error' };
        this.notify();
        handleFirestoreError(error, OperationType.UPDATE, userPath);
      }
    });
  }

  public async recordGameRun(params: {
    heroId: string;
    heroName: string;
    topicId: string;
    topicTitle: string;
    intensity: 'easy' | 'medium' | 'hard' | 'extreme';
    wave: number;
    victory: boolean;
    kills: number;
    gameCorrect: number;
    gameAttempted: number;
    unsyncedCorrectDelta: number;
    unsyncedAttemptedDelta: number;
  }): Promise<void> {
    const user = auth.currentUser;
    if (!user) return;

    const safeGameCorrect = Math.max(0, Math.floor(params.gameCorrect));
    const safeGameAttempted = Math.max(safeGameCorrect, Math.floor(params.gameAttempted));
    const safeUnsyncedCorrect = Math.max(0, Math.floor(params.unsyncedCorrectDelta));
    const safeUnsyncedAttempted = Math.max(
      safeUnsyncedCorrect,
      Math.floor(params.unsyncedAttemptedDelta)
    );
    const gameRate =
      safeGameAttempted > 0 ? Math.min(100, Math.round((safeGameCorrect / safeGameAttempted) * 100)) : 0;
    const gameId = `run_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    return this.enqueueWrite(async () => {
      const userPath = `users/${user.uid}`;
      const userRef = doc(db, 'users', user.uid);
      const gameRef = doc(db, 'users', user.uid, 'games', gameId);

      try {
        this.state = { ...this.state, syncStatus: 'syncing', statusMessage: 'Saving game record...' };
        this.notify();

        await runTransaction(db, async tx => {
          const snap = await tx.get(userRef);
          const photo = sanitizePhotoUrl(user);
          const cur: UserSaveProfile = snap.exists()
            ? (snap.data() as UserSaveProfile)
            : {
                uid: user.uid,
                displayName: sanitizeDisplayName(user),
                totalCorrect: 0,
                totalAttempted: 0,
                gamesPlayed: 0,
                victories: 0,
                bestGameRate: 0,
                lastGameCorrect: 0,
                lastGameAttempted: 0,
                lastGameRate: 0
              };

          const nextTotalCorrect = cur.totalCorrect + safeUnsyncedCorrect;
          const nextTotalAttempted = Math.max(
            nextTotalCorrect,
            cur.totalAttempted + safeUnsyncedAttempted
          );
          const nextGamesPlayed = cur.gamesPlayed + 1;
          const nextVictories = cur.victories + (params.victory ? 1 : 0);
          const nextBestRate = Math.min(100, Math.max(cur.bestGameRate, gameRate));

          if (!snap.exists()) {
            const createProfile: Record<string, unknown> = {
              uid: user.uid,
              displayName: sanitizeDisplayName(user),
              totalCorrect: nextTotalCorrect,
              totalAttempted: nextTotalAttempted,
              gamesPlayed: nextGamesPlayed,
              victories: nextVictories,
              bestGameRate: nextBestRate,
              lastGameCorrect: safeGameCorrect,
              lastGameAttempted: safeGameAttempted,
              lastGameRate: gameRate,
              lastHeroId: sanitizeIdField(params.heroId, 'nova'),
              lastTopicId: sanitizeIdField(params.topicId, 'all'),
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp()
            };
            if (photo) createProfile.photoURL = photo;
            tx.set(userRef, createProfile);
          } else {
            const updateProfile: Record<string, unknown> = {
              displayName: sanitizeDisplayName(user),
              totalCorrect: nextTotalCorrect,
              totalAttempted: nextTotalAttempted,
              gamesPlayed: nextGamesPlayed,
              victories: nextVictories,
              bestGameRate: nextBestRate,
              lastGameCorrect: safeGameCorrect,
              lastGameAttempted: safeGameAttempted,
              lastGameRate: gameRate,
              lastHeroId: sanitizeIdField(params.heroId, 'nova'),
              lastTopicId: sanitizeIdField(params.topicId, 'all'),
              updatedAt: serverTimestamp()
            };
            if (photo) updateProfile.photoURL = photo;
            tx.update(userRef, updateProfile);
          }

          tx.set(gameRef, {
            uid: user.uid,
            heroId: sanitizeIdField(params.heroId, 'nova'),
            heroName: (params.heroName || 'Operative').slice(0, 60),
            topicId: sanitizeIdField(params.topicId, 'all'),
            topicTitle: (params.topicTitle || 'All 11 OST Topics').slice(0, 80),
            intensity: params.intensity,
            wave: Math.min(10, Math.max(1, Math.floor(params.wave))),
            victory: !!params.victory,
            kills: Math.max(0, Math.floor(params.kills)),
            correct: safeGameCorrect,
            attempted: safeGameAttempted,
            correctRate: gameRate,
            playedAt: serverTimestamp()
          });
        });

        this.state = { ...this.state, syncStatus: 'synced', statusMessage: 'Cloud Save Synced' };
        this.notify();
      } catch (error) {
        this.state = { ...this.state, syncStatus: 'error', statusMessage: 'Game save error' };
        this.notify();
        handleFirestoreError(error, OperationType.WRITE, `${userPath}/games/${gameId}`);
      }
    });
  }
}

export const firebaseSave = new FirebaseSaveManager();
