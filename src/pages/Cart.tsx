import { ShoppingCart, Plus, Minus } from "lucide-react";
import { useAppContext } from "../context/AppContext";
import { rupiah } from "../data/products";

const Cart = () => {
  const {
    cart,
    selectedCartIds,
    toggleSelectCartItem,
    toggleSelectAllCart,
    changeQuantity,
    go,
    openDetail,
    totalPrice,
    totalItems,
  } = useAppContext();

  if (cart.length === 0) {
    return (
      <main className="page cart-page">
        <div className="empty-state">
          <ShoppingCart size={44} />
          <h3>Keranjang masih kosong</h3>
          <p>Yuk, temukan topeng pilihanmu.</p>
          <button className="primary-button" onClick={() => go("produk")}>Mulai Belanja</button>
        </div>
      </main>
    );
  }

  const isAllSelected = cart.length > 0 && selectedCartIds.length === cart.length;

  return (
    <main className="page cart-page">
      <div className="cart-header-actions">
        <label className="cart-select-all">
          <input
            type="checkbox"
            checked={isAllSelected}
            onChange={toggleSelectAllCart}
          />
          <span>Pilih Semua ({cart.length} Barang)</span>
        </label>
      </div>

      <div className="cart-list">
        {cart.map((item, index) => {
          const isSelected = selectedCartIds.includes(item.product.id);
          return (
            <div className={`cart-row ${isSelected ? "selected" : ""}`} key={item.product.id}>
              <label className="cart-checkbox">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleSelectCartItem(item.product.id)}
                />
              </label>
              
              <span className="cart-number">{index + 1}</span>
              
              <div className="cart-thumb">
                <img src={item.product.image} alt={item.product.name} />
              </div>

              <div className="cart-product">
                <b>{item.product.name}</b>
                <span>{rupiah(item.product.price)}</span>
              </div>

              <div className="mini-qty">
                <button onClick={() => changeQuantity(item.product.id, 1)}><Plus size={12} strokeWidth={3} /></button>
                <b>{item.quantity}</b>
                <button onClick={() => changeQuantity(item.product.id, -1)}><Minus size={12} strokeWidth={3} /></button>
              </div>

              <button className="detail-button" onClick={() => openDetail(item.product)}>
                Lihat Detail
              </button>
            </div>
          );
        })}
      </div>

      <div className="cart-footer-sticky">
        <div className="cart-summary">
          <div>
            <small>Total Harga Barang Yang Dipilih:</small>
            <strong>{rupiah(totalPrice)}</strong>
          </div>
          <span className="cart-pill">{totalItems} Barang</span>
        </div>

        <button
          className="primary-button checkout-button"
          disabled={selectedCartIds.length === 0}
          onClick={() => go("checkout")}
        >
          Buat Pesanan
        </button>
      </div>
    </main>
  );
};

export default Cart;