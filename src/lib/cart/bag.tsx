"use client";

import { getProduct, type Product } from "@/lib/data/products";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

const KEY = "aurafit-bag-v1";

export type BagLine = {
  product: Product;
  quantity: number;
};

type Stored = { productId: string; quantity: number };

type BagContextValue = {
  ready: boolean;
  lines: BagLine[];
  count: number;
  total: number;
  justAdded: string | null;
  add: (productId: string) => void;
  setQuantity: (productId: string, quantity: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
};

const BagContext = createContext<BagContextValue | null>(null);

function readStored(): Stored[] {
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as Stored[]) : [];
    return parsed.filter(
      (item) =>
        typeof item.productId === "string" &&
        Number.isInteger(item.quantity) &&
        item.quantity > 0 &&
        item.quantity <= 20 &&
        getProduct(item.productId),
    );
  } catch {
    return [];
  }
}

export function BagProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Stored[]>([]);
  const [ready, setReady] = useState(false);
  const [justAdded, setJustAdded] = useState<string | null>(null);
  const addedTimer = useRef(0);

  useEffect(() => {
    setItems(readStored());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    window.localStorage.setItem(KEY, JSON.stringify(items));
  }, [items, ready]);

  const add = useCallback((productId: string) => {
    if (!getProduct(productId)) return;
    setItems((current) => {
      const found = current.find((item) => item.productId === productId);
      if (!found) return [...current, { productId, quantity: 1 }];
      return current.map((item) =>
        item.productId === productId
          ? { ...item, quantity: Math.min(20, item.quantity + 1) }
          : item,
      );
    });
    setJustAdded(productId);
    window.clearTimeout(addedTimer.current);
    addedTimer.current = window.setTimeout(() => setJustAdded(null), 3200);
  }, []);

  const setQuantity = useCallback((productId: string, quantity: number) => {
    setItems((current) =>
      quantity < 1
        ? current.filter((item) => item.productId !== productId)
        : current.map((item) =>
            item.productId === productId
              ? { ...item, quantity: Math.min(20, quantity) }
              : item,
          ),
    );
  }, []);

  const remove = useCallback((productId: string) => {
    setItems((current) => current.filter((item) => item.productId !== productId));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const lines = useMemo(
    () =>
      items.flatMap((item) => {
        const product = getProduct(item.productId);
        return product ? [{ product, quantity: item.quantity }] : [];
      }),
    [items],
  );

  const value = useMemo<BagContextValue>(
    () => ({
      ready,
      lines,
      count: lines.reduce((sum, line) => sum + line.quantity, 0),
      total: lines.reduce((sum, line) => sum + line.product.price * line.quantity, 0),
      justAdded,
      add,
      setQuantity,
      remove,
      clear,
    }),
    [add, clear, justAdded, lines, ready, remove, setQuantity],
  );

  return <BagContext.Provider value={value}>{children}</BagContext.Provider>;
}

export function useBag() {
  const bag = useContext(BagContext);
  if (!bag) throw new Error("Bag is only available inside the shop");
  return bag;
}
