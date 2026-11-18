import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { Package, RefreshCw, X, MapPin, User, CreditCard } from "lucide-react";
import { useAppContext } from "../context/AppContext";
import { rupiah } from "../data/products";
import { errorMessage } from "../data/lib/api";
import { type OrderFilter, type OrderStatus, type PaymentStatus, type Order } from "../types";

const statusClass: Record<OrderStatus, string> = {
  Menunggu: "waiting",
  Diproses: "processing",
  Dikirim: "processing",
  Selesai: "done",
  Dibatalkan: "cancelled",
};

const paymentLabel: Record<PaymentStatus, string> = {
  belum_bayar: "Belum dibayar",
  menunggu_verifikasi: "Menunggu verifikasi",
  lunas: "Lunas",
  ditolak: "Bukti ditolak, silakan unggah ulang",
};

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 4 * 1024 * 1024;

const Orders = () => {
  const { orders, ordersLoading, ordersError, refreshOrders, uploadProof, cancelOrder, go } = useAppContext();
  const [orderFilter, setOrderFilter] = useState<OrderFilter>("Semua");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const uploadTarget = useRef<number | null>(null);

  useEffect(() => {
    void refreshOrders();
  }, [refreshOrders]);

  const filters: OrderFilter[] = ["Semua", "Menunggu", "Diproses", "Dikirim", "Selesai", "Dibatalkan"];
  const visibleOrders = orders.filter((order) => orderFilter === "Semua" || order.status === orderFilter);

  const pickProof = (orderId: number) => {
    uploadTarget.current = orderId;
    fileRef.current?.click();
  };

  const handleFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    const orderId = uploadTarget.current;
    if (!file || orderId === null) return;

    if (!ALLOWED_TYPES.includes(file.type)) return setMessage("Bukti harus berupa gambar JPG, PNG, atau WEBP.");
    if (file.size > MAX_SIZE) return setMessage("Ukuran bukti maksimal 4 MB.");

    setBusyId(orderId);
    setMessage("");
    try {
      await uploadProof(orderId, file);
      setMessage("Bukti pembayaran berhasil diunggah. Menunggu verifikasi admin.");
      await refreshOrders();
    } catch (err) {
      setMessage(errorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  const handleCancel = async (orderId: number) => {
    if (!window.confirm("Batalkan pesanan ini?")) return;
    setBusyId(orderId);
    setMessage("");
    try {
      await cancelOrder(orderId);
      setMessage("Pesanan berhasil dibatalkan.");
      setSelectedOrder(null);
    } catch (err) {
      setMessage(errorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <main className="page">
      <div className="orders-card">
        <div className="orders-head">
          <h2>Pesanan Saya</h2>

          <button
            className="primary-button orders-refresh"
            onClick={() => void refreshOrders()}
            disabled={ordersLoading}
          >
            <RefreshCw size={14} className={ordersLoading ? "spin" : undefined} />
            {ordersLoading ? "Memperbarui..." : "Muat Ulang"}
          </button>
        </div>

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

        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={handleFile} />

        {message && <p className="auth-error">{message}</p>}
        {ordersError && <p className="auth-error">{ordersError}</p>}

        {ordersLoading && orders.length === 0 ? (
          <p style={{ textAlign: "center" }}>Memuat pesanan...</p>
        ) : visibleOrders.length === 0 ? (
          <div className="empty-state compact-empty">
            <Package size={42} />
            <h3>Belum ada pesanan</h3>
            <button className="primary-button" onClick={() => go("produk")}>Belanja Sekarang</button>
          </div>
        ) : (
          <div className="orders-list">
            {visibleOrders.map((order, index) => (
              <div className="order-block" key={order.id}>
                <div className="order-row">
                  <span className="order-number">{index + 1}</span>
                  <div className="order-thumb"><img src={order.items[0]?.product.image} alt="" /></div>
                  <div className="order-info">
                    <small>#{order.id} - {order.date}</small>
                    <b>{rupiah(order.total)}</b>
                  </div>
                  <span className={`status ${statusClass[order.status]}`}>{order.status}</span>
                  <button
                    className="detail-button"
                    onClick={() => setSelectedOrder(order)}
                  >
                    Lihat Detail
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* --- MODAL POPUP DETAIL PESANAN --- */}
        {selectedOrder && (() => {
          const canUpload = selectedOrder.status !== "Dibatalkan" && selectedOrder.paymentStatus !== "lunas";
          const canCancel = selectedOrder.status === "Menunggu" && selectedOrder.paymentStatus !== "lunas";
          const busy = busyId === selectedOrder.id;

          return (
            <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
              <div className="modal-card" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h3>Detail Pesanan #{selectedOrder.id}</h3>
                  <button className="modal-close-button" onClick={() => setSelectedOrder(null)} aria-label="Tutup detail pesanan">
                    <X size={20} />
                  </button>
                </div>

                <div className="modal-body">
                  <div className="modal-meta-row">
                    <span>Tanggal Pesanan</span>
                    <b>{selectedOrder.date}</b>
                  </div>
                  <div className="modal-meta-row">
                    <span>Status Pesanan</span>
                    <span className={`status ${statusClass[selectedOrder.status]}`}>{selectedOrder.status}</span>
                  </div>

                  <hr className="modal-divider" />

                  <div className="modal-section-title">Daftar Produk</div>
                  <div className="modal-product-list">
                    {selectedOrder.items.map((item, i) => (
                      <div key={`${item.product.id}-${i}`} className="modal-product">
                        <div className="modal-product-main">
                          <img className="modal-product-image" src={item.product.image} alt="" />
                          <div className="modal-product-info">
                            <b>{item.product.name}</b>
                            <small>{item.quantity}x @ {rupiah(item.price)}</small>
                          </div>
                        </div>
                        <b className="modal-product-price">{rupiah(item.price * item.quantity)}</b>
                      </div>
                    ))}
                  </div>

                  <div className="modal-total">
                    <b>Total Pembayaran</b>
                    <strong>{rupiah(selectedOrder.total)}</strong>
                  </div>

                  <hr className="modal-divider" />

                  <div className="modal-section-title">Informasi Pengiriman</div>
                  <div className="modal-info-box">
                    <div className="modal-info-row">
                      <User size={15} color="var(--brown)" />
                      <span>{selectedOrder.recipient} ({selectedOrder.phone})</span>
                    </div>
                    <div className="modal-info-row align-start">
                      <MapPin size={15} color="var(--brown)" />
                      <span>{selectedOrder.address}</span>
                    </div>
                  </div>

                  <div className="modal-section-title" style={{ marginTop: "8px" }}>Informasi Pembayaran</div>
                  <div className="modal-info-box">
                    <div className="modal-info-row">
                      <CreditCard size={15} color="var(--brown)" />
                      <span>{selectedOrder.payment}</span>
                    </div>
                    <div className="modal-info-row">
                      <span className="modal-info-note">Status Pembayaran:</span>
                      <b>{paymentLabel[selectedOrder.paymentStatus] ?? selectedOrder.paymentStatus}</b>
                    </div>
                    {selectedOrder.proofUrl && (
                      <div className="modal-info-row">
                        <a className="modal-link" href={selectedOrder.proofUrl} target="_blank" rel="noreferrer">
                          Lihat Bukti Pembayaran yang Diunggah
                        </a>
                      </div>
                    )}
                  </div>

                  {(canUpload || canCancel) && (
                    <div className="modal-actions">
                      {canUpload && (
                        <button
                          className="primary-button modal-action"
                          disabled={busy}
                          onClick={() => pickProof(selectedOrder.id)}
                        >
                          {selectedOrder.proofUrl ? "Ganti Bukti Pembayaran" : "Upload Bukti Pembayaran"}
                        </button>
                      )}
                      {canCancel && (
                        <button
                          className="detail-button modal-action modal-action-cancel"
                          disabled={busy}
                          onClick={() => handleCancel(selectedOrder.id)}
                        >
                          Batalkan Pesanan
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </main>
  );
};

export default Orders;
