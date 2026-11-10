import { ShieldCheck, Truck, Award } from "lucide-react";
import { useAppContext } from "../context/AppContext";

const Home = () => {
  const { go, openDetail, products, isLoading } = useAppContext();

  // Ambil maksimal 4 produk pertama secara aman untuk beranda (mencegah error undefined)
  const homeProducts = products.slice(0, 4);

  return (
    <>
      <section className="hero">
        <div className="hero-content">
          <h1>
            Koleksi Topeng
            <br />
            Malangan
          </h1>
          <p>Kenali karakternya. Rasakan ceritanya. Miliki karyanya.</p>
          <button className="primary-button hero-button" onClick={() => go("produk")}>
            Belanja Sekarang
          </button>
        </div>
        <div className="hero-art">
          <img src="/images/beranda.topeng.png" alt="Koleksi Topeng Malangan" className="hero-mask-image" />
        </div>
      </section>

      <section className="benefits">
        <div className="benefit-item">
          <div className="benefit-icon"><ShieldCheck size={26} /></div>
          <span>
            <b>Topeng asli malangan</b>
            <small>Karya budaya khas malang</small>
          </span>
        </div>
        <div className="benefit-item">
          <div className="benefit-icon"><Truck size={26} /></div>
          <span>
            <b>Pengiriman Aman Dan Terkendali</b>
            <small>Dikemas dengan hati-hati</small>
          </span>
        </div>
        <div className="benefit-item">
          <div className="benefit-icon"><Award size={26} /></div>
          <span>
            <b>Kualitas Terjaga</b>
            <small>Dibuat oleh pengrajin lokal</small>
          </span>
        </div>
      </section>

      <section className="home-collection">
        {isLoading ? (
          <p style={{ textAlign: "center", width: "100%" }}>Memuat koleksi unggulan...</p>
        ) : (
          <div className="home-product-grid">
            {homeProducts.map((product) => (
              <button className="home-product-card" key={product.id} onClick={() => openDetail(product)}>
                <div className="home-product-image">
                  <img src={product.image} alt={product.name} />
                </div>
                <span>{product.name}</span>
              </button>
            ))}
          </div>
        )}
      </section>
    </>
  );
};

export default Home;