import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { type Page, type Product, type CartItem, type Order, type User } from "../types";
import { api, errorMessage, getToken, setToken, setUnauthorizedHandler } from "../data/lib/api";
import {
  mapCart,
  mapOrder,
  mapProduct,
  mapUser,
  type ApiKeranjangResponse,
  type ApiPelanggan,
  type ApiPesanan,
  type ApiProduk,
} from "../data/lib/mappers";

type Paginated<T> = { data: T[]; current_page: number; last_page: number };

export type ActionResult = { ok: boolean; message: string; needLogin?: boolean };
export type ShippingForm = { name: string; phone: string; address: string };
export type RegisterInput = {
  nama: string;
  username: string;
  email: string;
  password: string;
  password_confirmation: string;
};

interface AppContextType {
  page: Page;
  go: (next: Page) => void;

  // Auth
  loggedIn: boolean;
  user: User | null;
  authReady: boolean;
  authError: string;
  setAuthError: (val: string) => void;
  login: (loginId: string, password: string) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (input: { nama: string; username: string; email: string }) => Promise<void>;

  search: string;
  setSearch: (val: string) => void;

  // Produk
  products: Product[];
  isLoading: boolean;
  loadError: string;
  reloadProducts: () => void;
  selected: Product | null;
  openDetail: (product: Product) => void;

  // Keranjang
  cart: CartItem[];
  selectedCartIds: number[];
  toggleSelectCartItem: (id: number) => void;
  toggleSelectAllCart: () => void;
  selectedCartItems: CartItem[];
  addToCart: (product: Product, amount: number) => Promise<ActionResult>;
  changeQuantity: (productId: number, delta: number) => Promise<ActionResult>;
  totalItems: number;
  totalPrice: number;

  // Pesanan
  orders: Order[];
  ordersLoading: boolean;
  ordersError: string;
  refreshOrders: () => Promise<void>;
  placeOrder: (shipping: ShippingForm, proof: File | null) => Promise<{ proofError: string }>;
  uploadProof: (orderId: number, file: File) => Promise<void>;
  cancelOrder: (orderId: number) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Ambil semua halaman dari endpoint yang di-paginate Laravel.
async function fetchAll<T>(path: string, maxPages = 20): Promise<T[]> {
  const rows: T[] = [];
  const sep = path.includes("?") ? "&" : "?";
  let page = 1;
  let last: number;
  do {
    const res = await api<Paginated<T>>(`${path}${sep}page=${page}`);
    rows.push(...res.data);
    last = res.last_page;
    page += 1;
  } while (page <= last && page <= maxPages);
  return rows;
}

export const AppProvider = ({ children }: { children: ReactNode }) => {
  // 1. Inisialisasi halaman berdasarkan URL path saat pertama kali dibuka/di-refresh
  const getInitialPage = (): Page => {
    const path = window.location.pathname.replace("/", "").toLowerCase();
    if (!path || path === "") return "home";
    return path as Page;
  };

  const [page, setPage] = useState<Page>(getInitialPage());
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [authError, setAuthError] = useState("");
  const [search, setSearch] = useState("");

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [selected, setSelected] = useState<Product | null>(null);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCartIds, setSelectedCartIds] = useState<number[]>([]);

  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState("");

  const loggedIn = user !== null;

  /* ---------------- Navigasi & URL Sync ---------------- */

  const go = useCallback((next: Page) => {
    const protectedPages: Page[] = ["keranjang", "checkout", "pesanan", "profil"];
    if (!loggedIn && protectedPages.includes(next)) {
      setAuthError("Silakan login untuk mengakses fitur ini.");
      setPage("login");
      window.history.pushState({ page: "login" }, "", "/login");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    
    setPage(next);
    setAuthError("");

    const newPath = next === "home" ? "/" : `/${next}`;
    window.history.pushState({ page: next }, "", newPath);

    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [loggedIn]);

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.replace("/", "").toLowerCase();
      if (!path || path === "") {
        setPage("home");
      } else {
        setPage(path as Page);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  /* ---------------- Produk ---------------- */

  const loadProducts = useCallback(async () => {
    try {
      const rows = await fetchAll<ApiProduk>("/produk?per_page=100");
      const list = rows.map(mapProduct);
      setProducts(list);
      setSelected((prev) => (prev ? list.find((p) => p.id === prev.id) ?? prev : list[0] ?? null));
      setLoadError("");
    } catch (e) {
      setLoadError(errorMessage(e));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  const reloadProducts = () => {
    setIsLoading(true);
    void loadProducts();
  };

  /* ---------------- Keranjang ---------------- */

  const applyCart = useCallback(
    (payload: ApiKeranjangResponse, opts: { selectAll?: boolean; select?: number } = {}) => {
      const items = mapCart(payload);
      setCart(items);
      setSelectedCartIds((prev) => {
        const ids = items.map((i) => i.product.id);
        if (opts.selectAll) return ids;
        const kept = prev.filter((id) => ids.includes(id));
        if (opts.select !== undefined && ids.includes(opts.select) && !kept.includes(opts.select)) {
          kept.push(opts.select);
        }
        return kept;
      });
    },
    []
  );

  const loadCart = useCallback(
    async (selectAll = false) => {
      const payload = await api<ApiKeranjangResponse>("/keranjang");
      applyCart(payload, { selectAll });
    },
    [applyCart]
  );

  /* ---------------- Pesanan ---------------- */

  const refreshOrders = useCallback(async () => {
    setOrdersLoading(true);
    try {
      const rows = await fetchAll<ApiPesanan>("/pesanan");
      setOrders(rows.map(mapOrder));
      setOrdersError("");
    } catch (e) {
      setOrdersError(errorMessage(e));
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  /* ---------------- Sesi / Auth ---------------- */

  const clearSession = useCallback(() => {
    setToken(null);
    setUser(null);
    setCart([]);
    setSelectedCartIds([]);
    setOrders([]);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      clearSession();
      setAuthError("Sesi Anda berakhir. Silakan login kembali.");
      setPage("login");
      window.history.pushState({ page: "login" }, "", "/login");
    });
    return () => setUnauthorizedHandler(null);
  }, [clearSession]);

  useEffect(() => {
    let active = true;

    const restore = async () => {
      if (!getToken()) {
        setAuthReady(true);
        return;
      }
      try {
        const me = await api<{ pelanggan: ApiPelanggan }>("/me", { silent401: true });
        if (!active) return;
        setUser(mapUser(me.pelanggan));
        await Promise.allSettled([loadCart(true), refreshOrders()]);
      } catch {
        if (active) clearSession();
      } finally {
        if (active) setAuthReady(true);
      }
    };

    void restore();
    return () => {
      active = false;
    };
  }, [loadCart, refreshOrders, clearSession]);

  const startSession = async (token: string, pelanggan: ApiPelanggan) => {
    setToken(token);
    setUser(mapUser(pelanggan));
    await Promise.allSettled([loadCart(true), refreshOrders()]);
  };

  const login = async (loginId: string, password: string) => {
    const res = await api<{ token: string; pelanggan: ApiPelanggan }>("/login", {
      method: "POST",
      body: { login: loginId, password },
    });
    await startSession(res.token, res.pelanggan);
  };

  const register = async (input: RegisterInput) => {
    const res = await api<{ token: string; pelanggan: ApiPelanggan }>("/register", {
      method: "POST",
      body: input,
    });
    await startSession(res.token, res.pelanggan);
  };

  const logout = async () => {
    try {
      await api("/logout", { method: "POST", silent401: true });
    } catch {
      /* token kedaluwarsa */
    }
    clearSession();
    go("home");
  };

  const updateProfile = async (input: { nama: string; username: string; email: string }) => {
    const res = await api<{ pelanggan: ApiPelanggan }>("/me", { method: "PUT", body: input });
    setUser(mapUser(res.pelanggan));
  };

  /* ---------------- Aksi keranjang ---------------- */

  const addToCart = async (product: Product, amount = 1): Promise<ActionResult> => {
    if (!user) {
      setAuthError("Silakan login untuk menambahkan produk ke keranjang.");
      go("login");
      return { ok: false, message: "", needLogin: true };
    }
    try {
      const payload = await api<ApiKeranjangResponse>("/keranjang/item", {
        method: "POST",
        body: { produk_id: product.id, jumlah: amount },
      });
      applyCart(payload, { select: product.id });
      return { ok: true, message: "" };
    } catch (e) {
      return { ok: false, message: errorMessage(e) };
    }
  };

  const changeQuantity = async (productId: number, delta: number): Promise<ActionResult> => {
    const item = cart.find((i) => i.product.id === productId);
    if (!item) return { ok: false, message: "Item tidak ditemukan di keranjang." };

    const next = item.quantity + delta;
    try {
      const payload =
        next < 1
          ? await api<ApiKeranjangResponse>(`/keranjang/item/${item.id}`, { method: "DELETE" })
          : await api<ApiKeranjangResponse>(`/keranjang/item/${item.id}`, {
              method: "PUT",
              body: { jumlah: next },
            });
      applyCart(payload);
      return { ok: true, message: "" };
    } catch (e) {
      return { ok: false, message: errorMessage(e) };
    }
  };

  const toggleSelectCartItem = (id: number) => {
    setSelectedCartIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const toggleSelectAllCart = () => {
    setSelectedCartIds(selectedCartIds.length === cart.length ? [] : cart.map((i) => i.product.id));
  };

  const selectedCartItems = cart.filter((i) => selectedCartIds.includes(i.product.id));
  const totalItems = selectedCartItems.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = selectedCartItems.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

  /* ---------------- Aksi pesanan ---------------- */

  const placeOrder = async (shipping: ShippingForm, proof: File | null) => {
    const checkoutItems = selectedCartItems;

    const res = await api<any>("/pesanan", {
      method: "POST",
      body: {
        pesanan_nama_penerima: shipping.name,
        pesanan_no_hp: shipping.phone,
        pesanan_alamat_pengiriman: shipping.address,
        pesanan_metode_pembayaran: "Transfer Bank BCA",
        items: checkoutItems.map((i) => ({ produk_id: i.product.id, jumlah: i.quantity })),
      },
    });

    const orderId = res?.pesanan_id ?? res?.id ?? res?.data?.pesanan_id ?? res?.data?.id;

    let proofError = "";
    if (proof && orderId) {
      try {
        const fd = new FormData();
        fd.append("bukti", proof);
        await api(`/pesanan/${orderId}/bukti`, { method: "POST", formData: fd });
      } catch (e) {
        proofError = errorMessage(e);
      }
    } else if (proof && !orderId) {
      proofError = "ID pesanan tidak ditemukan.";
    }

    await Promise.allSettled(
      checkoutItems.map((i) => api(`/keranjang/item/${i.id}`, { method: "DELETE" }))
    );

    await Promise.allSettled([loadCart(), refreshOrders(), loadProducts()]);
    return { proofError };
  };

  const uploadProof = async (orderId: number, file: File) => {
    const fd = new FormData();
    fd.append("bukti", file);
    const res = await api<any>(`/pesanan/${orderId}/bukti`, {
      method: "POST",
      formData: fd,
    });
    const updatedData = res?.data ?? res;
    setOrders((prev) => prev.map((o) => (o.id === orderId ? mapOrder(updatedData) : o)));
  };

  const cancelOrder = async (orderId: number) => {
    const res = await api<{ data: ApiPesanan }>(`/pesanan/${orderId}/batal`, { method: "POST" });
    setOrders((prev) => prev.map((o) => (o.id === orderId ? mapOrder(res.data) : o)));
    void loadProducts();
  };

  const openDetail = (product: Product) => {
    setSelected(product);
    go("detail");
  };

  return (
    <AppContext.Provider
      value={{
        page, go,
        loggedIn, user, authReady, authError, setAuthError, login, register, logout, updateProfile,
        search, setSearch,
        products, isLoading, loadError, reloadProducts, selected, openDetail,
        cart, selectedCartIds, toggleSelectCartItem, toggleSelectAllCart, selectedCartItems,
        addToCart, changeQuantity, totalItems, totalPrice,
        orders, ordersLoading, ordersError, refreshOrders, placeOrder, uploadProof, cancelOrder,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useAppContext must be used within an AppProvider");
  return context;
};