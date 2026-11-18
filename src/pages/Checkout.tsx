import { useState, useRef, type ChangeEvent, type FormEvent } from "react";
import { CheckCircle, ShoppingCart } from "lucide-react";
import { useAppContext } from "../context/AppContext";
import { rupiah } from "../data/products";
import { errorMessage } from "../data/lib/api";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 4 * 1024 * 1024;

const Checkout = () => {
  const { user, selectedCartItems, totalPrice, placeOrder, go } = useAppContext();
  const [shipping, setShipping] = useState({ name: user?.name ?? "", phone: "", address: "" });
  const [proof, setProof] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [proofError, setProofError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    e.target.value = "";
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Bukti pembayaran harus berupa gambar JPG, PNG, atau WEBP.");
      return;
    }
    if (file.size > MAX_SIZE) {
      setError("Ukuran bukti pembayaran maksimal 4 MB.");
      return;
    }
    setError("");
    setProof(file);
  };

  const submitOrder = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (selectedCartItems.length === 0 || submitting) return;

    setSubmitting(true);
    setError("");
    try {
      const result = await placeOrder(shipping, proof);
      setProofError(result.proofError);
      setProof(null);
      setSuccess(true);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <main className="page">
        <div className="success-state">
          <CheckCircle size={56} />
          <h2>Pesanan Berhasil Dibuat!</h2>
          <p>Terima kasih sudah berbelanja di Topeng Malangan.</p>
          {proofError && (
            <p className="auth-error">
              Pesanan tersimpan, tetapi bukti pembayaran gagal diunggah ({proofError}). Silakan unggah ulang di halaman Pesanan.
            </p>
          )}
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
          <label>Nama Lengkap<input required maxLength={100} value={shipping.name} onChange={(e) => setShipping({ ...shipping, name: e.target.value })} /></label>
          <label>No HP<input required maxLength={20} inputMode="tel" value={shipping.phone} onChange={(e) => setShipping({ ...shipping, phone: e.target.value })} /></label>
          <label>Alamat Lengkap<textarea required value={shipping.address} onChange={(e) => setShipping({ ...shipping, address: e.target.value })} /></label>

          <h3 className="payment-title">Metode Pembayaran</h3>
          <div className="payment-box">
            <p>Bank BCA<br />A.n Jajang Marijang<br />098765432123</p>
            <div className="upload-area">
              <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={handleFile} />
              <button type="button" className="upload-button" onClick={() => fileRef.current?.click()}>
                Upload Bukti Pembayaran
              </button>
              {proof && <small>{proof.name}</small>}
            </div>
          </div>

          {error && <p className="auth-error">{error}</p>}

          <button className="primary-button full" type="submit" disabled={submitting}>
            {submitting ? "Memproses pesanan..." : "Buat Pesanan"}
          </button>
        </form>

        <aside className="order-summary">
          <h3>Ringkasan Pesanan</h3>
          <div className="summary-items">
            {selectedCartItems.map((item) => (
              <div className="summary-item" key={item.id}>
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