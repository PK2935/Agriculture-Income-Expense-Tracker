import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc, collection, addDoc, deleteDoc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDsBUqCm-90utMyNEJTqjOQ8K8SRzbj8uI",
  authDomain: "agri-management-system.firebaseapp.com",
  databaseURL: "https://agri-management-system-default-rtdb.firebaseio.com",
  projectId: "agri-management-system",
  storageBucket: "agri-management-system.appspot.com",
  messagingSenderId: "688826818540",
  appId: "1:688826818540:web:707aaf4b3e0ad95fc6aac9",
  measurementId: "G-E0BQ9231ST"
};

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);

export async function signUp(email, password, displayName) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    await createInitialUserData(user.uid, email, displayName);
    return user;
  } catch (error) {
    console.error('Error creating the user:', error);
    throw error;
  }
}

async function createInitialUserData(userId, email, displayName) {
  const userRef = doc(db, 'users', userId);
  await setDoc(userRef, {
    email,
    displayName,
    createdAt: new Date(),
    income: {
      incomeTitle: '',
      incomeAmount: 0,
      incomeSource: '',
      totalIncome: 0,
      entries: [],
    },
    expense: {
      expenseHead: '',
      totalExpense: 0,
      entries: [],
    },
    transactions: [],
    supplyInventory: {
      items: [],
    },
  });
}

export async function updateUserIncomeData(userId, incomeData) {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    'income.incomeTitle': incomeData.incomeTitle,
    'income.incomeAmount': incomeData.incomeAmount,
    'income.incomeSource': incomeData.incomeSource,
    'income.totalIncome': incomeData.totalIncome,
    'income.entries': incomeData.entries,
  });
}

export async function updateUserExpenseData(userId, expenseData) {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    'expense.expenseHead': expenseData.expenseHead,
    'expense.totalExpense': expenseData.totalExpense,
    'expense.entries': expenseData.entries,
  });
}

export async function addTransaction(userId, transaction) {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    transactions: arrayUnion(transaction),
  });
}

export async function updateSupplyInventory(userId, newItem) {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    'supplyInventory.items': arrayUnion(newItem),
  });
}

export async function deleteEntryFromFirestore(userId, entryId, collectionName) {
  const userRef = doc(db, 'users', userId);
  const incomeCollectionRef = collection(userRef, collectionName);
  const entryRef = doc(incomeCollectionRef, entryId);
  await deleteDoc(entryRef);
}

export async function getUserIncomeData(userId) {
  const userRef = doc(db, 'users', userId);
  const userDoc = await getDoc(userRef);
  if (userDoc.exists()) {
    return userDoc.data().income;
  } else {
    throw new Error('User not found');
  }
}

export async function getUserExpenseData(userId) {
  const userRef = doc(db, 'users', userId);
  const userDoc = await getDoc(userRef);
  if (userDoc.exists()) {
    return userDoc.data().expense;
  } else {
    throw new Error('User not found');
  }
}

export async function getUserDisplayName(userId) {
  const userRef = doc(db, 'users', userId);
  const userDoc = await getDoc(userRef);
  if (userDoc.exists()) {
    return userDoc.data().displayName;
  } else {
    throw new Error('User not found');
  }
}

export async function getUserSupplyData(userId) {
  const userRef = doc(db, 'users', userId);
  const userDoc = await getDoc(userRef);
  if (userDoc.exists()) {
    return userDoc.data().supplyInventory;
  } else {
    throw new Error('User not found');
  }
}

export { firebaseApp, auth, db, doc, setDoc, updateDoc, getDoc, arrayUnion, onAuthStateChanged };