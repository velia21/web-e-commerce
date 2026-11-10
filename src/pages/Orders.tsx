import { useState } from "react";
import { Package } from "lucide-react";
import { useAppContext } from "../context/AppContext";
import { rupiah } from "../data/products";
import { type OrderFilter, type OrderStatus } from "../types";

const statusClass: Record<OrderStatus, string> = {
  Menunggu: "waiting",
  Diproses: "processing",
  Selesai: "done",
  Dibatalkan: "cancelled",
};

const Orders = () => {
  const { orders, go } = useAppContext();
  const [orderFilter, setOrderFilter] = useState<OrderFilter>("Semua");
  const [openOrder, setOpenOrder] = useState<number | null>(null);

  const filters: OrderFilter[] = ["Semua", "Diproses", "Selesai", "Dibatalkan"];
  const visibleOrders = orders.filter((order) => orderFilter === "Semua" || order.status === orderFilter);

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
            <button className="primary-button" onClick={() => go("produk")}>Belanja Sekarang</button>
          </div>
        ) : (
          <div className="orders-list">
            {visibleOrders.map((order, index) => (
              <div className="order-block" key={order.id}>
                <div className="order-row">
                  <span className="order-number">{index + 1}</span>
                  <div className="order-thumb"><img src={order.items[0].product.image} alt="" /></div>
                  <div className="order-info">
                    <small>{order.date}</small>
                    <b>{rupiah(order.total)}</b>
                  </div>
                  <span className={`status ${statusClass[order.status]}`}>{order.status}</span>
                  <button
                    className="detail-button"
                    onClick={() => setOpenOrder(openOrder === order.id ? null : order.id)}
                  >
                    Lihat Detail
                  </button>
                </div>

                {openOrder === order.id && (
                  <div className="order-detail">
                    {order.items.map((item) => (
                      <div className="order-item" key={item.product.id}>
                        <span>{item.product.name} × {item.quantity}</span>
                        <b>{rupiah(item.product.price * item.quantity)}</b>
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

export default Orders;