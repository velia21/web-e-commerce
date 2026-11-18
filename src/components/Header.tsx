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

        <button
          className="tm-mobile-toggle"
          onClick={() => setMobileMenu(!mobileMenu)}
          aria-label={mobileMenu ? "Tutup menu" : "Buka menu"}
          aria-expanded={mobileMenu}
        >
          {mobileMenu ? <X size={22} /> : <Menu size={22} />}
        </button>

        <div className={`tm-menu ${mobileMenu ? "open" : ""}`}>
          <nav className="tm-nav-links">
            {nav.map(([label, target]) => {
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
            ) : page !== "profil" ? (
              <button className="tm-icon-button" onClick={() => handleNav("produk")} aria-label="Cari produk">
                <Search size={24} />
              </button>
            ) : null}

            {!loggedIn ? (
              <div className="tm-auth-group">
                <button className="tm-auth-button" onClick={() => handleNav("register")}>Daftar</button>
                <button className="tm-login-button" onClick={() => handleNav("login")}>Log In</button>
              </div>
            ) : (
              <button
                className={`tm-icon-button ${page === "profil" ? "tm-icon-active" : ""}`}
                onClick={() => handleNav("profil")}
                aria-label="Profil"
              >
                <UserRound size={24} />
              </button>
            )}
          </div>
        </div>

        <div className="tm-mobile-actions">
          <button
            className={`tm-icon-button ${page === "profil" ? "tm-icon-active" : ""}`}
            onClick={() => handleNav(loggedIn ? "profil" : "login")}
            aria-label={loggedIn ? "Profil" : "Masuk"}
          >
            <UserRound size={24} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
