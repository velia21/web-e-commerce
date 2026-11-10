import { useState } from "react";
import { Search, UserRound, Menu, X } from "lucide-react";
import { useAppContext } from "../context/AppContext";
import { type Page } from "../types";

const Header = () => {
  const { page, go, loggedIn, search, setSearch } = useAppContext();
  const [mobileMenu, setMobileMenu] = useState(false);

  const nav: [string, Page][] = [
    ["Beranda", "home"],
    ["Produk", "produk"],
    ["Keranjang", "keranjang"],
    ["Pesanan", "pesanan"],
  ];

  const activeNav: Page = page === "detail" ? "produk" : page === "checkout" ? "keranjang" : page;

  const handleNav = (target: Page) => {
    go(target);
    setMobileMenu(false);
  };

  return (
    <header className="tm-header">
      <div className="tm-navigation">
        <button className="tm-logo" onClick={() => handleNav("home")}>
          <img className="tm-logo-icon" src="/images/header.topeng.png" alt="" />
          <img className="tm-logo-text" src="/images/font.topeng.png" alt="Informasi Topeng Malangan" />
        </button>

        <button className="tm-mobile-toggle" onClick={() => setMobileMenu(!mobileMenu)}>
          {mobileMenu ? <X size={22} /> : <Menu size={22} />}
        </button>

        <nav className={`tm-nav-links ${mobileMenu ? "open" : ""}`}>
          {nav.map(([label, target]) => {
            //if (!loggedIn && (target === "keranjang" || target === "pesanan")) return null;
            return (
              <button
                key={target}
                className={activeNav === target ? "tm-nav-link active" : "tm-nav-link"}
                onClick={() => handleNav(target)}
              >
                {label}
              </button>
            );
          })}
        </nav>

        <div className="tm-actions">
          {page === "produk" ? (
            <label className="tm-search">
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari..." />
              <Search size={22} />
            </label>
          ) : (
            <button className="tm-icon-button" onClick={() => handleNav("produk")}>
              <Search size={24} />
            </button>
          )}

          {!loggedIn && page !== "produk" ? (
            <>
              <button className="tm-auth-button" onClick={() => handleNav("register")}>Daftar</button>
              <button className="tm-login-button" onClick={() => handleNav("login")}>Log In</button>
            </>
          ) : (
            <button
              className={`tm-icon-button ${page === "profil" ? "tm-icon-active" : ""}`}
              onClick={() => handleNav("profil")}
            >
              <UserRound size={24} />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;