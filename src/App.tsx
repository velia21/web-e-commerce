import { useRef, useState, type FormEvent } from "react";
import {
  Search,
  UserRound,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Plus,
  Minus,
  ShieldCheck,
  Truck,
  Award,
  Menu,
  X,
  Star,
  ShoppingCart,
  Package,
  CheckCircle,
} from "lucide-react";
import "./App.css";

/* =========================================
   TIPE DATA
========================================= */

type Page =
  | "home"
  | "produk"
  | "detail"
  | "keranjang"
  | "checkout"
  | "pesanan"
  | "profil"
  | "login"
  | "register";

type Product = {
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

type CartItem = {
  product: Product;
  quantity: number;
};

type OrderStatus = "Menunggu" | "Diproses" | "Selesai" | "Dibatalkan";
type OrderFilter = "Semua" | "Diproses" | "Selesai" | "Dibatalkan";

type Order = {
  id: number;
  date: string;
  items: CartItem[];
  total: number;
  status: OrderStatus;
  payment: string;
};

/* =========================================
   DATA PRODUK (gambar dari /public/images)
   Urutan sama dengan halaman Koleksi Topeng di Figma
========================================= */

const products: Product[] = [
  {
    id: 1,
    name: "Topeng Panji",
    price: 150000,
    image: "/images/topeng-panji.png",
    summary:
      "Topeng Panji melambangkan sosok ksatria yang bijaksana, berani, dan penuh kesetiaan. Cocok untuk koleksi maupun pajangan.",
    description:
      "Topeng Panji merupakan salah satu topeng tradisional Malang yang melambangkan sifat ksatria dan halus, dan kebijaksanaan. Dibuat secara manual oleh pengrajin lokal dengan bahan kayu pilihan dan cat tradisional yang ramah lingkungan.",
    stock: 10,
    size: "20 cm x 15 cm",
    material: "Kayu, Cat Tradisional",
  },
  {
    id: 2,
    name: "Topeng Semar",
    price: 130000,
    image: "/images/topeng-semar.png",
    summary:
      "Topeng Semar menggambarkan tokoh punakawan yang bijak, sederhana, dan penuh humor. Cocok untuk koleksi maupun pajangan.",
    description:
      "Topeng Semar merupakan salah satu topeng tradisional Malang yang melambangkan kebijaksanaan dan kesederhanaan. Dibuat secara manual oleh pengrajin lokal dengan bahan kayu pilihan dan cat tradisional yang ramah lingkungan.",
    stock: 9,
    size: "20 cm x 16 cm",
    material: "Kayu, Cat Tradisional",
  },
  {
    id: 3,
    name: "Topeng Rangda",
    price: 200000,
    image: "/images/topeng-rangda.png",
    summary:
      "Topeng Rangda tampil dengan ekspresi kuat dan detail rambut yang megah. Cocok untuk koleksi maupun pajangan.",
    description:
      "Topeng Rangda merupakan topeng tradisional dengan karakter kuat dan penuh wibawa. Dibuat secara manual oleh pengrajin lokal dengan bahan kayu pilihan dan cat tradisional yang ramah lingkungan.",
    stock: 5,
    size: "28 cm x 22 cm",
    material: "Kayu, Cat Tradisional",
  },
  {
    id: 4,
    name: "Topeng Kreasi",
    price: 180000,
    image: "/images/topeng-kreasi.png",
    summary:
      "Topeng Kreasi memadukan warna merah, emas, dan hitam dengan hiasan rumbai yang khas. Cocok untuk koleksi maupun pajangan.",
    description:
      "Topeng Kreasi merupakan hasil kreasi pengrajin lokal yang memadukan gaya tradisional dengan sentuhan modern. Dibuat secara manual dengan bahan kayu pilihan dan cat tradisional yang ramah lingkungan.",
    stock: 7,
    size: "24 cm x 18 cm",
    material: "Kayu, Cat Tradisional",
  },
  {
    id: 5,
    name: "Topeng Gigsik",
    price: 160000,
    image: "/images/topeng-gigsik.png",
    summary:
      "Topeng Gigsik menampilkan wajah yang anggun dan lembut dengan mahkota berhias. Cocok untuk koleksi maupun pajangan.",
    description:
      "Topeng Gigsik merupakan salah satu topeng tradisional yang melambangkan keanggunan dan kelembutan. Dibuat secara manual oleh pengrajin lokal dengan bahan kayu pilihan dan cat tradisional yang ramah lingkungan.",
    stock: 8,
    size: "20 cm x 15 cm",
    material: "Kayu, Cat Tradisional",
  },
  {
    id: 6,
    name: "Topeng Kala",
    price: 140000,
    image: "/images/topeng-kala.png",
    summary:
      "Topeng Kala memiliki karakter garang dengan taring dan ukiran emas yang detail. Cocok untuk koleksi maupun pajangan.",
    description:
      "Topeng Kala merupakan topeng tradisional dengan karakter berani dan penuh semangat. Dibuat secara manual oleh pengrajin lokal dengan bahan kayu pilihan dan cat tradisional yang ramah lingkungan.",
    stock: 6,
    size: "22 cm x 18 cm",
    material: "Kayu, Cat Tradisional",
  },
  {
    id: 7,
    name: "Topeng Kresna",
    price: 170000,
    image: "/images/topeng-kresna.png",
    summary:
      "Topeng Kresna berwarna biru dengan mahkota emas yang melambangkan kebijaksanaan. Cocok untuk koleksi maupun pajangan.",
    description:
      "Topeng Kresna merupakan topeng tradisional yang melambangkan kebijaksanaan dan kepemimpinan. Dibuat secara manual oleh pengrajin lokal dengan bahan kayu pilihan dan cat tradisional yang ramah lingkungan.",
    stock: 6,
    size: "21 cm x 16 cm",
    material: "Kayu, Cat Tradisional",
  },
  {
    id: 8,
    name: "Topeng Dewa",
    price: 190000,
    image: "/images/topeng-dewa.png",
    summary:
      "Topeng Dewa dihiasi mahkota dan ornamen emas yang mencerminkan kemuliaan. Cocok untuk koleksi maupun pajangan.",
    description:
      "Topeng Dewa merupakan topeng tradisional dengan detail ukiran dan warna yang mencerminkan kemuliaan. Dibuat secara manual oleh pengrajin lokal dengan bahan kayu pilihan dan cat tradisional yang ramah lingkungan.",
    stock: 4,
    size: "25 cm x 19 cm",
    material: "Kayu, Cat Tradisional",
  },
];

// 4 kartu di Beranda (Figma: wajah putih wanita, merah, dan Semar)
const homeProducts: Product[] = [1, 5, 6, 2].map(
  (id) => products.find((p) => p.id === id) as Product
);

/* Contoh data pesanan seperti di Figma.
   Ganti dengan [] jika ingin mulai dari kosong. */
const sampleOrders: Order[] = [
  {
    id: 1,
    date: "12 Sep 2026",
    items: [{ product: products[0], quantity: 1 }],
    total: 150000,
    status: "Diproses",
    payment: "Transfer Bank BCA",
  },
  {
    id: 2,
    date: "10 Sep 2026",
    items: [{ product: products[1], quantity: 1 }],
    total: 130000,
    status: "Selesai",
    payment: "Transfer Bank BCA",
  },
  {
    id: 3,
    date: "5 Sep 2026",
    items: [{ product: products[2], quantity: 1 }],
    total: 200000,
    status: "Menunggu",
    payment: "Transfer Bank BCA",
  },
  {
    id: 4,
    date: "1 Sep 2026",
    items: [{ product: products[3], quantity: 1 }],
    total: 180000,
    status: "Dibatalkan",
    payment: "Transfer Bank BCA",
  },
];

const statusClass: Record<OrderStatus, string> = {
  Menunggu: "waiting",
  Diproses: "processing",
  Selesai: "done",
  Dibatalkan: "cancelled",
};

const rupiah = (number: number) => "Rp " + number.toLocaleString("id-ID");

const formatDate = (date: Date) =>
  date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

/* =========================================
   APLIKASI
========================================= */

function App() {
  const [page, setPage] = useState<Page>("home");
  const [selected, setSelected] = useState<Product>(products[0]);
  const [activeImage, setActiveImage] = useState<string>(products[0].image);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [authError, setAuthError] = useState("");

  const [user, setUser] = useState({
    name: "User",
    username: "User123",
    email: "User@gmail.com",
  });
  const [editing, setEditing] = useState(false);

  const [shipping, setShipping] = useState({
    name: "",
    phone: "",
    address: "",
  });
  const [proofName, setProofName] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const [orders, setOrders] = useState<Order[]>(sampleOrders);
  const [orderFilter, setOrderFilter] = useState<OrderFilter>("Semua");
  const [openOrder, setOpenOrder] = useState<number | null>(null);
  const [success, setSuccess] = useState(false);

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const go = (next: Page) => {
    setPage(next);
    setMobileMenu(false);
    setSuccess(false);
    setAuthError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const addToCart = (product: Product, amount = 1) => {
    setCart((old) => {
      const found = old.find((item) => item.product.id === product.id);

      if (found) {
        return old.map((item) =>
          item.product.id === product.id
            ? {
                ...item,
                quantity: Math.min(product.stock, item.quantity + amount),
              }
            : item
        );
      }

      return [...old, { product, quantity: Math.min(product.stock, amount) }];
    });
  };

  // Tombol "−" pada jumlah 1 akan menghapus barang dari keranjang
  const changeQuantity = (id: number, amount: number) => {
    setCart((old) =>
      old.flatMap((item) => {
        if (item.product.id !== id) return [item];
        const next = item.quantity + amount;
        if (next < 1) return [];
        return [{ ...item, quantity: Math.min(item.product.stock, next) }];
      })
    );
  };

  const openDetail = (product: Product) => {
    setSelected(product);
    setActiveImage(product.image);
    setQuantity(1);
    go("detail");
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(search.toLowerCase())
  );

  const nav: [string, Page][] = [
    ["Beranda", "home"],
    ["Produk", "produk"],
    ["Keranjang", "keranjang"],
    ["Pesanan", "pesanan"],
  ];

  // Menu yang disorot sesuai halaman
  const activeNav: Page =
    page === "detail"
      ? "produk"
      : page === "checkout"
      ? "keranjang"
      : page;

  /* NOTE: semua bagian di bawah ditulis sebagai fungsi biasa dan dipanggil
     seperti {renderHeader()} (bukan <Header />). Dengan begitu input tidak
     kehilangan fokus setiap kali mengetik. */

  /* =========================================
     HEADER / NAVBAR
  ========================================= */

  const renderHeader = () => (
    <header className="tm-header">
      <div className="tm-navigation">
        <button
          className="tm-logo"
          onClick={() => go("home")}
          aria-label="Beranda Topeng Malangan"
        >
          <img
            className="tm-logo-icon"
            src="/images/header.topeng.png"
            alt=""
          />
          <img
            className="tm-logo-text"
            src="/images/font.topeng.png"
            alt="Informasi Topeng Malangan"
          />
        </button>

        <button
          className="tm-mobile-toggle"
          onClick={() => setMobileMenu(!mobileMenu)}
          aria-label="Buka menu"
        >
          {mobileMenu ? <X size={22} /> : <Menu size={22} />}
        </button>

        <nav className={`tm-nav-links ${mobileMenu ? "open" : ""}`}>
          {nav.map(([label, target]) => (
            <button
              key={target}
              className={
                activeNav === target ? "tm-nav-link active" : "tm-nav-link"
              }
              onClick={() => go(target)}
            >
              {label}
            </button>
          ))}
        </nav>

        <div className="tm-actions">
          {page === "produk" ? (
            <label className="tm-search">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Cari topeng"
              />
              <Search size={22} />
            </label>
          ) : (
            <button
              className="tm-icon-button"
              onClick={() => go("produk")}
              title="Cari produk"
              aria-label="Cari produk"
            >
              <Search size={24} />
            </button>
          )}

          {!loggedIn && page !== "produk" ? (
            <>
              <button
                className="tm-auth-button"
                onClick={() => go("register")}
              >
                Daftar
              </button>
              <button className="tm-login-button" onClick={() => go("login")}>
                Log In
              </button>
            </>
          ) : (
            <button
              className={
                page === "profil"
                  ? "tm-icon-button tm-icon-active"
                  : "tm-icon-button"
              }
              onClick={() => go("profil")}
              title="Profil"
              aria-label="Profil"
            >
              <UserRound size={24} />
            </button>
          )}
        </div>
      </div>
    </header>
  );

  /* =========================================
     BERANDA
  ========================================= */

  const renderHome = () => (
    <>
      <section className="hero">
        <div className="hero-content">
          <h1>
            Koleksi Topeng
            <br />
            Malangan
          </h1>

          <p>Kenali karakternya. Rasakan ceritanya. Miliki karyanya.</p>

          <button
            className="primary-button hero-button"
            onClick={() => go("produk")}
          >
            Belanja Sekarang
          </button>
        </div>

        <div className="hero-art">
          <img
            src="/images/beranda.topeng.png"
            alt="Koleksi Topeng Malangan"
            className="hero-mask-image"
          />
        </div>
      </section>

      <section className="benefits">
        <div className="benefit-item">
          <div className="benefit-icon">
            <ShieldCheck size={26} />
          </div>
          <span>
            <b>Topeng asli malangan</b>
            <small>Karya budaya khas malang</small>
          </span>
        </div>

        <div className="benefit-item">
          <div className="benefit-icon">
            <Truck size={26} />
          </div>
          <span>
            <b>Pengiriman Aman Dan Terkendali</b>
            <small>Dikemas dengan hati-hati</small>
          </span>
        </div>

        <div className="benefit-item">
          <div className="benefit-icon">
            <Award size={26} />
          </div>
          <span>
            <b>Kualitas Terjaga</b>
            <small>Dibuat oleh pengrajin lokal</small>
          </span>
        </div>
      </section>

      <section className="home-collection">
        <div className="home-product-grid">
          {homeProducts.map((product) => (
            <button
              className="home-product-card"
              key={product.id}
              onClick={() => openDetail(product)}
            >
              <div className="home-product-image">
                <img src={product.image} alt={product.name} />
              </div>
              <span>{product.name}</span>
            </button>
          ))}
        </div>
      </section>
    </>
  );

  /* =========================================
     KOLEKSI TOPENG (KATALOG)
     Pencarian ada di navbar (sesuai Figma)
  ========================================= */

  const renderCatalog = () => (
    <main className="page catalog-page">
      <h2 className="page-title">Koleksi Topeng</h2>

      <div className="product-grid">
        {filteredProducts.map((product) => (
          <article
            className="product-card"
            key={product.id}
            onClick={() => openDetail(product)}
          >
            <div className="product-image">
              <img src={product.image} alt={product.name} />
            </div>

            <div className="product-info">
              <b className="product-name">{product.name}</b>
              <span className="product-price">{rupiah(product.price)}</span>
            </div>
          </article>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <p className="empty">Produk tidak ditemukan.</p>
      )}
    </main>
  );

  /* =========================================
     DETAIL TOPENG
  ========================================= */

  const renderDetail = () => {
    const gallery = [
      selected.image,
      ...products
        .filter((p) => p.id !== selected.id)
        .slice(0, 2)
        .map((p) => p.image),
    ];

    return (
      <main className="page">
        <div className="detail-card">
          <div className="detail-layout">
            <div className="detail-gallery">
              <img
                className="detail-main-image"
                src={activeImage}
                alt={selected.name}
              />

              <div className="detail-thumbs">
                {gallery.map((image, index) => (
                  <button
                    key={image}
                    className={
                      activeImage === image ? "thumb active" : "thumb"
                    }
                    onClick={() => setActiveImage(image)}
                    aria-label={`Gambar ${index + 1}`}
                  >
                    <img src={image} alt="" />
                  </button>
                ))}
              </div>
            </div>

            <div className="detail-content">
              <h1>{selected.name}</h1>

              <div className="rating">
                {[0, 1, 2, 3, 4].map((i) => (
                  <Star key={i} size={15} fill="currentColor" />
                ))}
                <span>(4.9 / 45 ulasan)</span>
              </div>

              <div className="detail-price">{rupiah(selected.price)}</div>

              <p className="detail-summary">{selected.summary}</p>

              <div className="detail-spec">
                <div className="spec-row">
                  <i className="spec-dot" />
                  <span>Kategori</span>
                  <b>: {selected.name}</b>
                </div>
                <div className="spec-row">
                  <i className="spec-dot" />
                  <span>Stok</span>
                  <b>: {selected.stock}</b>
                </div>
                <div className="spec-row">
                  <i className="spec-dot" />
                  <span>Ukuran</span>
                  <b>: {selected.size}</b>
                </div>
                <div className="spec-row">
                  <i className="spec-dot" />
                  <span>Bahan</span>
                  <b>: {selected.material}</b>
                </div>
              </div>

              <div className="buy-row">
                <div className="quantity-control">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    aria-label="Kurangi"
                  >
                    <Minus size={14} />
                  </button>

                  <b>{quantity}</b>

                  <button
                    onClick={() =>
                      setQuantity(Math.min(selected.stock, quantity + 1))
                    }
                    aria-label="Tambah"
                  >
                    <Plus size={14} />
                  </button>
                </div>

                <button
                  className="add-cart"
                  onClick={() => {
                    addToCart(selected, quantity);
                    go("keranjang");
                  }}
                >
                  Tambah ke Keranjang
                </button>
              </div>
            </div>
          </div>

          <div className="description-box">
            <h3>Deskripsi</h3>
            <p>{selected.description}</p>
          </div>
        </div>
      </main>
    );
  };

  /* =========================================
     KERANJANG
  ========================================= */

  const renderCart = () => (
    <main className="page cart-page">
      {cart.length === 0 ? (
        <div className="empty-state">
          <ShoppingCart size={44} />
          <h3>Keranjang masih kosong</h3>
          <p>Yuk, temukan topeng pilihanmu.</p>
          <button className="primary-button" onClick={() => go("produk")}>
            Mulai Belanja
          </button>
        </div>
      ) : (
        <>
          <div className="cart-list">
            {cart.map((item, index) => (
              <div className="cart-row" key={item.product.id}>
                <span className="cart-number">{index + 1}</span>

                <div className="cart-thumb">
                  <img src={item.product.image} alt={item.product.name} />
                </div>

                <div className="cart-product">
                  <b>{item.product.name}</b>
                  <span>{rupiah(item.product.price)}</span>
                </div>

                <div className="mini-qty">
                  <button
                    onClick={() => changeQuantity(item.product.id, 1)}
                    aria-label="Tambah"
                  >
                    <Plus size={12} strokeWidth={3} />
                  </button>
                  <b>{item.quantity}</b>
                  <button
                    onClick={() => changeQuantity(item.product.id, -1)}
                    aria-label="Kurangi"
                  >
                    <Minus size={12} strokeWidth={3} />
                  </button>
                </div>

                <button
                  className="detail-button"
                  onClick={() => openDetail(item.product)}
                >
                  Lihat Detail
                </button>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <div>
              <small>Total Harga Barang Yang Dipilih:</small>
              <strong>{rupiah(totalPrice)}</strong>
            </div>
            <span className="cart-pill">{totalItems} Barang</span>
          </div>

          <button
            className="primary-button checkout-button"
            onClick={() => go("checkout")}
          >
            Buat Pesanan
          </button>
        </>
      )}
    </main>
  );

  /* =========================================
     CHECKOUT
  ========================================= */

  const submitOrder = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (cart.length === 0) return;

    const order: Order = {
      id: Date.now(),
      date: formatDate(new Date()),
      items: cart,
      total: totalPrice,
      status: "Menunggu",
      payment: "Transfer Bank BCA",
    };

    setOrders((old) => [order, ...old]);
    setCart([]);
    setProofName("");
    setSuccess(true);
  };

  const renderCheckout = () => (
    <main className="page">
      {success ? (
        <div className="success-state">
          <CheckCircle size={56} />
          <h2>Pesanan Berhasil Dibuat!</h2>
          <p>Terima kasih sudah berbelanja di Topeng Malangan.</p>
          <button className="primary-button" onClick={() => go("pesanan")}>
            Lihat Pesanan
          </button>
        </div>
      ) : cart.length === 0 ? (
        <div className="empty-state">
          <ShoppingCart size={44} />
          <h3>Belum ada barang untuk dipesan</h3>
          <p>Tambahkan topeng ke keranjang terlebih dahulu.</p>
          <button className="primary-button" onClick={() => go("produk")}>
            Mulai Belanja
          </button>
        </div>
      ) : (
        <div className="checkout-card">
          <form className="checkout-form" onSubmit={submitOrder}>
            <h3>Data Pengiriman</h3>

            <label>
              Nama Lengkap
              <input
                required
                value={shipping.name}
                onChange={(e) =>
                  setShipping({ ...shipping, name: e.target.value })
                }
              />
            </label>

            <label>
              No HP
              <input
                required
                inputMode="tel"
                value={shipping.phone}
                onChange={(e) =>
                  setShipping({ ...shipping, phone: e.target.value })
                }
              />
            </label>

            <label>
              Alamat Lengkap
              <textarea
                required
                value={shipping.address}
                onChange={(e) =>
                  setShipping({ ...shipping, address: e.target.value })
                }
              />
            </label>

            <h3 className="payment-title">Metode Pembayaran</h3>

            <div className="payment-box">
              <p>
                Bank BCA
                <br />
                A.n Jajang Marijang
                <br />
                098765432123
              </p>

              <div className="upload-area">
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*,.pdf"
                  hidden
                  onChange={(e) =>
                    setProofName(e.target.files?.[0]?.name ?? "")
                  }
                />
                <button
                  type="button"
                  className="upload-button"
                  onClick={() => fileRef.current?.click()}
                >
                  Upload Bukti Pembayaran
                </button>
                {proofName && <small>{proofName}</small>}
              </div>
            </div>

            <button className="primary-button full" type="submit">
              Buat Pesanan
            </button>
          </form>

          <aside className="order-summary">
            <h3>Ringkasan Pesanan</h3>

            <div className="summary-items">
              {cart.map((item) => (
                <div className="summary-item" key={item.product.id}>
                  <div className="summary-thumb">
                    <img src={item.product.image} alt={item.product.name} />
                  </div>
                  <div className="summary-name">
                    <b>{item.product.name}</b>
                    <small>{item.quantity}x</small>
                  </div>
                  <b className="summary-price">
                    {rupiah(item.product.price * item.quantity)}
                  </b>
                </div>
              ))}
            </div>

            <div className="summary-subtotal">
              <span>Subtotal</span>
              <b>{rupiah(totalPrice)}</b>
            </div>

            <div className="summary-total">
              <span>Total</span>
              <strong>{rupiah(totalPrice)}</strong>
            </div>
          </aside>
        </div>
      )}
    </main>
  );

  /* =========================================
     PESANAN SAYA
  ========================================= */

  const renderOrders = () => {
    const filters: OrderFilter[] = [
      "Semua",
      "Diproses",
      "Selesai",
      "Dibatalkan",
    ];
    const visibleOrders = orders.filter(
      (order) => orderFilter === "Semua" || order.status === orderFilter
    );

    return (
      <main className="page">
        <div className="orders-card">
          <h2>Pesanan Saya</h2>

          <div className="order-tabs">
            {filters.map((item) => (
              <button
                key={item}
                className={orderFilter === item ? "order-tab active" : "order-tab"}
                onClick={() => setOrderFilter(item)}
              >
                {item}
              </button>
            ))}
          </div>

          {visibleOrders.length === 0 ? (
            <div className="empty-state compact-empty">
              <Package size={42} />
              <h3>Belum ada pesanan</h3>
              <button className="primary-button" onClick={() => go("produk")}>
                Belanja Sekarang
              </button>
            </div>
          ) : (
            <div className="orders-list">
              {visibleOrders.map((order, index) => (
                <div className="order-block" key={order.id}>
                  <div className="order-row">
                    <span className="order-number">{index + 1}</span>

                    <div className="order-thumb">
                      <img
                        src={order.items[0].product.image}
                        alt={order.items[0].product.name}
                      />
                    </div>

                    <div className="order-info">
                      <small>{order.date}</small>
                      <b>{rupiah(order.total)}</b>
                    </div>

                    <span className={`status ${statusClass[order.status]}`}>
                      {order.status}
                    </span>

                    <button
                      className="detail-button"
                      onClick={() =>
                        setOpenOrder(openOrder === order.id ? null : order.id)
                      }
                    >
                      Lihat Detail
                    </button>
                  </div>

                  {openOrder === order.id && (
                    <div className="order-detail">
                      {order.items.map((item) => (
                        <div className="order-item" key={item.product.id}>
                          <span>
                            {item.product.name} × {item.quantity}
                          </span>
                          <b>
                            {rupiah(item.product.price * item.quantity)}
                          </b>
                        </div>
                      ))}
                      <small>Pembayaran: {order.payment}</small>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    );
  };

  /* =========================================
     PROFIL USER
  ========================================= */

  const renderProfile = () => (
    <main className="page profile-page">
      <h2 className="page-title">Profil Saya</h2>

      <div className="profile-head">
        <div className="avatar" />

        <div className="profile-id">
          <b>{user.name}</b>
          <small>{user.email}</small>
        </div>

        <button
          className="primary-button profile-edit"
          onClick={() => setEditing(!editing)}
        >
          {editing ? "Simpan Profil" : "Edit Profil"}
        </button>
      </div>

      <div className="profile-fields">
        <label>
          Nama Lengkap
          <input
            value={user.name}
            readOnly={!editing}
            onChange={(e) => setUser({ ...user, name: e.target.value })}
          />
        </label>

        <label>
          Username
          <input
            value={user.username}
            readOnly={!editing}
            onChange={(e) => setUser({ ...user, username: e.target.value })}
          />
        </label>

        <label>
          Email
          <input
            type="email"
            value={user.email}
            readOnly={!editing}
            onChange={(e) => setUser({ ...user, email: e.target.value })}
          />
        </label>
      </div>
    </main>
  );

  /* =========================================
     LOGIN DAN REGISTER
  ========================================= */

  const handleAuth = (e: FormEvent<HTMLFormElement>, register: boolean) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);

    if (register && data.get("password") !== data.get("confirm")) {
      setAuthError("Konfirmasi password tidak sama.");
      return;
    }

    if (register) {
      go("login");
    } else {
      setLoggedIn(true);
      go("home");
    }
  };

  const renderAuth = (register: boolean) => (
    <main className="auth-page">
      <form
        className="auth-card"
        onSubmit={(e) => handleAuth(e, register)}
      >
        <h2>{register ? "Daftar Akun" : "Masuk ke Akun Anda"}</h2>

        <p className="auth-sub">
          {register
            ? "Buat akun untuk menikmati semua fitur kami."
            : "Silakan login untuk melanjutkan transaksi."}
        </p>

        {register && (
          <>
            <div className="auth-field">
              <UserRound className="lead" size={18} />
              <input name="fullname" required placeholder="Nama Lengkap" />
            </div>
            <div className="auth-field">
              <UserRound className="lead" size={18} />
              <input name="username" required placeholder="Username" />
            </div>
            <div className="auth-field">
              <Mail className="lead" size={18} />
              <input
                name="email"
                required
                type="email"
                placeholder="Email"
              />
            </div>
          </>
        )}

        {!register && (
          <div className="auth-field">
            <UserRound className="lead" size={18} />
            <input
              name="account"
              required
              type="text"
              placeholder="Email atau Username"
            />
          </div>
        )}

        <div className="auth-field">
          <Lock className="lead" size={18} />
          <input
            name="password"
            required
            type={!register && showPassword ? "text" : "password"}
            placeholder="Password"
          />
          {!register && (
            <button
              type="button"
              className="eye-button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label="Tampilkan password"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          )}
        </div>

        {register && (
          <div className="auth-field">
            <Lock className="lead" size={18} />
            <input
              name="confirm"
              required
              type="password"
              placeholder="Konfirmasi Password"
            />
          </div>
        )}

        {authError && <p className="auth-error">{authError}</p>}

        <button className="primary-button full auth-submit" type="submit">
          {register ? "Daftar" : "Masuk"}
        </button>

        <p className="auth-switch">
          {register ? "Sudah punya akun?" : "Belum punya akun?"}{" "}
          <button
            type="button"
            onClick={() => go(register ? "login" : "register")}
          >
            {register ? "Masuk di sini" : "Daftar di sini"}
          </button>
        </p>
      </form>
    </main>
  );

  /* =========================================
     RENDER HALAMAN
  ========================================= */

  const authPage = page === "login" || page === "register";

  return (
    <div className="app">
      {!authPage && renderHeader()}

      {page === "home" && renderHome()}
      {page === "produk" && renderCatalog()}
      {page === "detail" && renderDetail()}
      {page === "keranjang" && renderCart()}
      {page === "checkout" && renderCheckout()}
      {page === "pesanan" && renderOrders()}
      {page === "profil" && renderProfile()}
      {page === "login" && renderAuth(false)}
      {page === "register" && renderAuth(true)}
    </div>
  );
}

export default App;
