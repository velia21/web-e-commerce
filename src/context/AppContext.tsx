import React, { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { type Page, type Product, type CartItem, type Order } from "../types";
import { fallbackProducts } from "../data/products";

interface AppContextType {
  page: Page;
  go: (next: Page) => void;
  loggedIn: boolean;
  setLoggedIn: (val: boolean) => void;
  authError: string;
  setAuthError: (val: string) => void;
  search: string;
  setSearch: (val: string) => void;
  
  products: Product[];
  isLoading: boolean;
  
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  selectedCartIds: number[];
  toggleSelectCartItem: (id: number) => void;
  toggleSelectAllCart: () => void;
  selectedCartItems: CartItem[];
  addToCart: (product: Product, amount: number) => void;
  changeQuantity: (id: number, amount: number) => void;
  
  totalItems: number;
  totalPrice: number;
  
  selected: Product | null;
  openDetail: (product: Product) => void;
  
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [page, setPage] = useState<Page>("home");
  const [loggedIn, setLoggedIn] = useState(false);
  const [authError, setAuthError] = useState("");
  const [search, setSearch] = useState("");
  
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selected, setSelected] = useState<Product | null>(null);
  
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCartIds, setSelectedCartIds] = useState<number[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/products");
        if (!response.ok) throw new Error("API error");
        const result = await response.json();
        const data = result.data || result;
        setProducts(data);
        if (data.length > 0) setSelected(data[0]);
      } catch (error) {
        console.warn("API Laravel gagal diakses. Menggunakan fallback data dummy.", error);
        setProducts(fallbackProducts);
        setSelected(fallbackProducts[0]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Otomatis pilih item baru saat ditambahkan ke keranjang
  const addToCart = (product: Product, amount = 1) => {
    setCart((old) => {
      const found = old.find((item) => item.product.id === product.id);
      if (found) {
        return old.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: Math.min(product.stock, item.quantity + amount) }
            : item
        );
      }
      return [...old, { product, quantity: Math.min(product.stock, amount) }];
    });

    setSelectedCartIds((prev) => 
      prev.includes(product.id) ? prev : [...prev, product.id]
    );
  };

  const toggleSelectCartItem = (id: number) => {
    setSelectedCartIds((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
    );
  };

  const toggleSelectAllCart = () => {
    if (selectedCartIds.length === cart.length) {
      setSelectedCartIds([]);
    } else {
      setSelectedCartIds(cart.map((item) => item.product.id));
    }
  };

  const changeQuantity = (id: number, amount: number) => {
    setCart((old) =>
      old.flatMap((item) => {
        if (item.product.id !== id) return [item];
        const next = item.quantity + amount;
        if (next < 1) {
          setSelectedCartIds((prev) => prev.filter((itemId) => itemId !== id));
          return [];
        }
        return [{ ...item, quantity: Math.min(item.product.stock, next) }];
      })
    );
  };

  // Hanya barang yang di-centang yang dihitung
  const selectedCartItems = cart.filter((item) => selectedCartIds.includes(item.product.id));
  const totalItems = selectedCartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = selectedCartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const go = (next: Page) => {
    const protectedPages: Page[] = ["keranjang", "checkout", "pesanan", "profil"];
    if (!loggedIn && protectedPages.includes(next)) {
      setAuthError("Silakan login untuk mengakses fitur ini.");
      setPage("login");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setPage(next);
    setAuthError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openDetail = (product: Product) => {
    setSelected(product);
    go("detail");
  };

  return (
    <AppContext.Provider value={{
      page, go, loggedIn, setLoggedIn, authError, setAuthError,
      search, setSearch, products, isLoading, cart, setCart, 
      selectedCartIds, toggleSelectCartItem, toggleSelectAllCart, selectedCartItems,
      addToCart, changeQuantity, totalItems, totalPrice, 
      selected, openDetail, orders, setOrders
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useAppContext must be used within an AppProvider");
  return context;
};