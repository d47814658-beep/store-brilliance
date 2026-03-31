import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface GCOStoreDB extends DBSchema {
  products: {
    key: string;
    value: any;
  };
  categories: {
    key: string;
    value: any;
  };
  pending_sales: {
    key: string;
    value: {
      id: string;
      invoice_number: string;
      store_id: string;
      vendeur_id: string;
      total_amount: number;
      cart: any[];
      created_at: string;
    };
  };
}

const DB_NAME = 'gco-store-db';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<GCOStoreDB>> | null = null;

export const initDB = () => {
  if (!dbPromise) {
    dbPromise = openDB<GCOStoreDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('products')) {
          db.createObjectStore('products', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('categories')) {
          db.createObjectStore('categories', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('pending_sales')) {
          db.createObjectStore('pending_sales', { keyPath: 'id' });
        }
      },
    });
  }
  return dbPromise;
};

// -- Cache Products --
export const cacheProductsLocally = async (products: any[]) => {
  const db = await initDB();
  const tx = db.transaction('products', 'readwrite');
  await tx.objectStore('products').clear();
  for (const product of products) {
    await tx.objectStore('products').put(product);
  }
  await tx.done;
};

export const getCachedProducts = async () => {
  const db = await initDB();
  return db.getAll('products');
};

export const updateCachedProductStock = async (productId: string, quantitySold: number) => {
  const db = await initDB();
  const tx = db.transaction('products', 'readwrite');
  const product = await tx.objectStore('products').get(productId);
  if (product) {
    product.stock -= quantitySold;
    await tx.objectStore('products').put(product);
  }
  await tx.done;
};

// -- Cache Categories --
export const cacheCategoriesLocally = async (categories: any[]) => {
  const db = await initDB();
  const tx = db.transaction('categories', 'readwrite');
  await tx.objectStore('categories').clear();
  for (const category of categories) {
    await tx.objectStore('categories').put(category);
  }
  await tx.done;
};

export const getCachedCategories = async () => {
  const db = await initDB();
  return db.getAll('categories');
};

// -- Pending Sales --
export const savePendingSale = async (sale: any) => {
  const db = await initDB();
  await db.put('pending_sales', sale);
};

export const getPendingSales = async () => {
  const db = await initDB();
  return db.getAll('pending_sales');
};

export const removePendingSale = async (id: string) => {
  const db = await initDB();
  await db.delete('pending_sales', id);
};
