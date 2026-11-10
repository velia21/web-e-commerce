import { useAppContext } from "../context/AppContext";
import { rupiah } from "../data/products";

const Catalog = () => {
  const { search, openDetail, loggedIn, go, products, isLoading } = useAppContext();

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(search.toLowerCase())
  );

  const displayProducts = loggedIn ? filteredProducts : filteredProducts.slice(0, 4);

  if (isLoading) {
    return (
      <main className="page catalog-page">
        <h2 className="page-title">Koleksi Topeng</h2>
        <p style={{ textAlign: "center" }}>Memuat katalog produk...</p>
      </main>
    );
  }

  return (
    <main className="page catalog-page">
      <h2 className="page-title">Koleksi Topeng</h2>

      <div className="product-grid">
        {displayProducts.map((product) => (
          <article className="product-card" key={product.id} onClick={() => openDetail(product)}>
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

      {!loggedIn && (
        <div style={{ textAlign: "center", marginTop: "40px", padding: "20px", background: "#f9f9f9", borderRadius: "8px" }}>
          <p style={{ marginBottom: "16px", color: "#555" }}>
            Login untuk melihat seluruh koleksi eksklusif kami dan mulai berbelanja.
          </p>
          <button className="primary-button" onClick={() => go("login")}>
            Masuk ke Akun Anda
          </button>
        </div>
      )}

      {filteredProducts.length === 0 && <p className="empty">Produk tidak ditemukan.</p>}
    </main>
  );
};

export default Catalog;