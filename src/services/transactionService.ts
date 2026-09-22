import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { handleFirestoreError, OperationType } from '../firebase/errorHandler';
import { Transaction, TransactionType } from '../types';

export interface CreateTransactionDTO {
  type: TransactionType;
  amount: number;
  category: string;
  date: string;
  note?: string;
}

export interface UpdateTransactionDTO {
  type: TransactionType;
  amount: number;
  category: string;
  date: string;
  note?: string;
}

export function subscribeUserTransactions(
  userId: string,
  onUpdate: (transactions: Transaction[]) => void,
  onError?: (error: unknown) => void
): Unsubscribe {
  const collectionPath = `users/${userId}/transactions`;
  const collRef = collection(db, 'users', userId, 'transactions');

  return onSnapshot(
    collRef,
    (snapshot) => {
      const items: Transaction[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        items.push({
          id: docSnap.id,
          userId: data.userId || userId,
          type: data.type as TransactionType,
          amount: Number(data.amount) || 0,
          category: data.category || 'อื่นๆ',
          date: data.date || '',
          note: data.note || '',
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        });
      });

      // Sort in-memory: newest date first, then newest createdAt
      items.sort((a, b) => {
        const dateDiff = new Date(b.date).getTime() - new Date(a.date).getTime();
        if (dateDiff !== 0) return dateDiff;
        const timeA = typeof a.createdAt === 'object' && a.createdAt && 'toMillis' in a.createdAt
          ? (a.createdAt as { toMillis: () => number }).toMillis()
          : 0;
        const timeB = typeof b.createdAt === 'object' && b.createdAt && 'toMillis' in b.createdAt
          ? (b.createdAt as { toMillis: () => number }).toMillis()
          : 0;
        return timeB - timeA;
      });

      onUpdate(items);
    },
    (error) => {
      if (onError) {
        onError(error);
      }
      handleFirestoreError(error, OperationType.LIST, collectionPath);
    }
  );
}

export async function createTransaction(userId: string, dto: CreateTransactionDTO): Promise<string> {
  const path = `users/${userId}/transactions`;
  const collRef = collection(db, 'users', userId, 'transactions');
  const newDocRef = doc(collRef);

  try {
    const payload: Record<string, unknown> = {
      userId,
      type: dto.type,
      amount: Number(dto.amount),
      category: dto.category.trim(),
      date: dto.date,
      createdAt: serverTimestamp(),
    };
    if (dto.note && dto.note.trim().length > 0) {
      payload.note = dto.note.trim().slice(0, 255);
    }

    await setDoc(newDocRef, payload);
    return newDocRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `${path}/${newDocRef.id}`);
  }
}

export async function updateTransaction(
  userId: string,
  transactionId: string,
  dto: UpdateTransactionDTO
): Promise<void> {
  const path = `users/${userId}/transactions/${transactionId}`;
  const docRef = doc(db, 'users', userId, 'transactions', transactionId);

  try {
    const payload: Record<string, unknown> = {
      type: dto.type,
      amount: Number(dto.amount),
      category: dto.category.trim(),
      date: dto.date,
      updatedAt: serverTimestamp(),
    };
    if (dto.note !== undefined) {
      payload.note = dto.note.trim().slice(0, 255);
    }

    await updateDoc(docRef, payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteTransaction(userId: string, transactionId: string): Promise<void> {
  const path = `users/${userId}/transactions/${transactionId}`;
  const docRef = doc(db, 'users', userId, 'transactions', transactionId);

  try {
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}
