// Корзина браузерде сакталат; акыркы баа заказ учурунда СЕРВЕРДЕ эсептелет.
import { createContext, useContext, useMemo } from 'react';
import { useLocalStorage } from '../lib/hooks.js';
import site from '../site.js';

const CartCtx = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useLocalStorage(`cart:${site.slug}`, []);

  const value = useMemo(() => {
    const add = (x, kind = 'item') => setItems((list) => {
      const key = `${kind}:${x.id}`;
      if (list.some((i) => i.key === key)) return list.map((i) => (i.key === key ? { ...i, qty: Math.min(20, i.qty + 1) } : i));
      return [...list, { key, kind, id: x.id, title: x.title, price: x.price, currency: x.currency || site.currency, image: x.image || '', icon: x.icon || '', qty: 1 }];
    });
    const setQty = (key, qty) => setItems((list) => list.map((i) => (i.key === key ? { ...i, qty: Math.max(1, Math.min(20, qty)) } : i)));
    const remove = (key) => setItems((list) => list.filter((i) => i.key !== key));
    const clear = () => setItems([]);
    const count = items.reduce((s, i) => s + i.qty, 0);
    const totals = items.reduce((m, i) => ({ ...m, [i.currency]: (m[i.currency] || 0) + i.qty * i.price }), {});
    return { items, add, setQty, remove, clear, count, totals, mixed: Object.keys(totals).length > 1 };
  }, [items, setItems]);

  return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>;
}

export const useCart = () => useContext(CartCtx);
