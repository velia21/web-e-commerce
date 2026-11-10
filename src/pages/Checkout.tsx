import { useState, useRef, type FormEvent } from "react";
import { CheckCircle, ShoppingCart } from "lucide-react";
import { useAppContext } from "../context/AppContext";
import { rupiah } from "../data/products";
import { type Order } from "../types";

const Checkout = () => {
  const { cart, setCart, selectedCartItems, selectedCartIds, setOrders, totalPrice, go } = useAppContext();
  const [shipping, setShipping] = useState({ name: "", phone: "", address: "" });
  const [proofName, setProofName] = useState("");
  const [success, setSuccess] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
  };

  const submitOrder = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (selectedCartItems.length === 0) return;

    const order: Order = {
      id: Date.now(),
      date: formatDate(new Date()),
      items: selectedCartItems,
      total: totalPrice,
      status: "Menunggu",
      payment: "Transfer Bank BCA",
    };

    setOrders((old) => [order, ...old]);
    // Hapus hanya barang yang di-checkout
    setCart((old) => old.filter((item) => !selectedCartIds.includes(item.product.id)));
    setProofName("");
    setSuccess(true);
  };

  if (success) {
    return (
      <main className="page">
        <div className="success-state">
          <CheckCircle size={56} />
          <h2>Pesanan Berhasil Dibuat!</h2>
          <p>Terima kasih sudah berbelanja di Topeng Malangan.</p>
          <button className="primary-button" onClick={() => go("pesanan")}>Lihat Pesanan</button>
        </div>
      </main>
    );
  }

  if (selectedCartItems.length === 0) {
    return (
      <main className="page">
        <div className="empty-state">
          <ShoppingCart size={44} />
          <h3>Tidak ada barang yang dipilih untuk dipesan</h3>
          <button className="primary-button" onClick={() => go("keranjang")}>Kembali ke Keranjang</button>
        </div>
      </main>
    );
  }

  return (
    <main className="page">
      <div className="checkout-card">
        <form className="checkout-form" onSubmit={submitOrder}>
          <h3>Data Pengiriman</h3>
          <label>Nama Lengkap<input required value={shipping.name} onChange={(e) => setShipping({ ...shipping, name: e.target.value })} /></label>
          <label>No HP<input required inputMode="tel" value={shipping.phone} onChange={(e) => setShipping({ ...shipping, phone: e.target.value })} /></label>
          <label>Alamat Lengkap<textarea required value={shipping.address} onChange={(e) => setShipping({ ...shipping, address: e.target.value })} /></label>

          <h3 className="payment-title">Metode Pembayaran</h3>
          <div className="payment-box">
            <p>Bank BCA<br />A.n Jajang Marijang<br />098765432123</p>
            <div className="upload-area">
              <input ref={fileRef} type="file" accept="image/*,.pdf" hidden onChange={(e) => setProofName(e.target.files?.[0]?.name ?? "")} />
              <button type="button" className="upload-button" onClick={() => fileRef.current?.click()}>
                Upload Bukti Pembayaran
              </button>
              {proofName && <small>{proofName}</small>}
            </div>
          </div>
          <button className="primary-button full" type="submit">Buat Pesanan</button>
        </form>

        <aside className="order-summary">
          <h3>Ringkasan Pesanan</h3>
          <div className="summary-items">
            {selectedCartItems.map((item) => (
              <div className="summary-item" key={item.product.id}>
                <div className="summary-thumb"><img src={item.product.image} alt={item.product.name} /></div>
                <div className="summary-name">
                  <b>{item.product.name}</b>
                  <small>{item.quantity}x</small>
                </div>
                <b className="summary-price">{rupiah(item.product.price * item.quantity)}</b>
              </div>
            ))}
          </div>
          <div className="summary-subtotal"><span>Subtotal</span><b>{rupiah(totalPrice)}</b></div>
          <div className="summary-total"><span>Total</span><strong>{rupiah(totalPrice)}</strong></div>
        </aside>
      </div>
    </main>
  );
};

export default Checkout;    