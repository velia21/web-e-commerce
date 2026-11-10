export type Page =
  | "home"
  | "produk"
  | "detail"
  | "keranjang"
  | "checkout"
  | "pesanan"
  | "profil"
  | "login"
  | "register";

export type Product = {
  id: number;
  name: string;
  price: number;
  image: string;
  summary: string;
  description: string;
  stock: number;
  size: string;
  material: string;
};

export type CartItem = {
  product: Product;
  quantity: number;
};

export type OrderStatus = "Menunggu" | "Diproses" | "Selesai" | "Dibatalkan";
export type OrderFilter = "Semua" | "Diproses" | "Selesai" | "Dibatalkan";

export type Order = {
  id: number;
  date: string;
  items: CartItem[];
  total: number;
  status: OrderStatus;
  payment: string;
};