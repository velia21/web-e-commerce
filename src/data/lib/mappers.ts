import type { CartItem, Order, OrderStatus, PaymentStatus, Product, User } from "../../types";

/* ---------- Bentuk respons dari Laravel ---------- */



export type ApiProduk = {
  produk_id: number;
  produk_nama: string;
  produk_harga: string | number;
  produk_stok: number;
  produk_gambar_url?: string | null;
  // Kolom opsional. Belum ada di database; kalau nanti ditambahkan, otomatis terbaca.
  produk_ringkasan?: string | null;
  produk_deskripsi?: string | null;
  produk_ukuran?: string | null;
  produk_bahan?: string | null;
};

export type ApiPelanggan = {
  pelanggan_id: number;
  nama: string;
  username: string;
  email: string;
};

export type ApiDetailPesanan = {
  detail_pesanan_id: number;
  produk_id: number;
  detail_jumlah: number;
  detail_harga: string | number;
  produk: ApiProduk | null;
};

export type ApiPesanan = {
  pesanan_id: number;
  pesanan_tanggal: string;
  pesanan_nama_penerima: string;
  pesanan_no_hp: string;
  pesanan_alamat_pengiriman: string;
  pesanan_total: string | number;
  pesanan_metode_pembayaran: string;
  pesanan_bukti_url: string | null;
  pesanan_status: string;
  pesanan_status_pembayaran: string;
  details: ApiDetailPesanan[];
};

export type ApiKeranjangResponse = {
  keranjang: {
    items: {
      detail_keranjang_id: number;
      produk_id: number;
      jumlah: number;
      produk: ApiProduk;
    }[];
  };
  total: string;
};

/* ---------- Mapper ---------- */

// Gambar cadangan bila produk belum punya foto di server (cocokkan lewat kata kunci nama).
const localImages: [string, string][] = [
  ["panji", "/images/topeng-panji.png"],
  ["semar", "/images/topeng-semar.png"],
  ["rangda", "/images/topeng-rangda.png"],
  ["kreasi", "/images/topeng-kreasi.png"],
  ["gigsik", "/images/topeng-gigsik.png"],
  ["kala", "/images/topeng-kala.png"],
  ["klana", "/images/topeng-kala.png"],
  ["dewa", "/images/topeng-dewa.png"],
  ["kresna", "/images/topeng-kresna.png"],
];

const resolveImage = (name: string, url?: string | null): string => {
  if (url) return url;
  const key = name.toLowerCase();
  return localImages.find(([word]) => key.includes(word))?.[1] ?? "/images/beranda.topeng.png";
};

export const mapProduct = (p: ApiProduk): Product => ({
  id: p.produk_id,
  name: p.produk_nama,
  price: Number(p.produk_harga),
  image: resolveImage(p.produk_nama, p.produk_gambar_url),
  summary: p.produk_ringkasan || "Topeng Malangan karya pengrajin lokal.",
  description:
    p.produk_deskripsi ||
    "Karya budaya khas Malang yang dibuat secara manual oleh pengrajin lokal.",
  stock: p.produk_stok,
  size: p.produk_ukuran || "-",
  material: p.produk_bahan || "-",
});

export const mapUser = (p: ApiPelanggan): User => ({
  id: p.pelanggan_id,
  name: p.nama,
  username: p.username,
  email: p.email,
});

export const mapCart = (res: ApiKeranjangResponse): CartItem[] =>
  res.keranjang.items.map((i) => ({
    id: i.detail_keranjang_id,
    product: mapProduct(i.produk),
    quantity: i.jumlah,
  }));

const statusMap: Record<string, OrderStatus> = {
  menunggu: "Menunggu",
  diproses: "Diproses",
  dikirim: "Dikirim",
  selesai: "Selesai",
  dibatalkan: "Dibatalkan",
};

export const mapOrder = (o: ApiPesanan): Order => ({
  id: o.pesanan_id,
  date: new Date(o.pesanan_tanggal).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }),
  items: o.details.map((d) => ({
    product: d.produk
      ? mapProduct(d.produk)
      : mapProduct({
          produk_id: d.produk_id,
          produk_nama: "Produk tidak tersedia",
          produk_harga: d.detail_harga,
          produk_stok: 0,
        }),
    quantity: d.detail_jumlah,
    price: Number(d.detail_harga),
  })),
  total: Number(o.pesanan_total),
  status: statusMap[o.pesanan_status] ?? "Menunggu",
  payment: o.pesanan_metode_pembayaran,
  paymentStatus: o.pesanan_status_pembayaran as PaymentStatus,
  proofUrl: o.pesanan_bukti_url,
  recipient: o.pesanan_nama_penerima,
  phone: o.pesanan_no_hp,
  address: o.pesanan_alamat_pengiriman,
});
