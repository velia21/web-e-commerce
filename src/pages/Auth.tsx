import { useState, type FormEvent } from "react";
import { UserRound, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useAppContext } from "../context/AppContext";

const Auth = ({ isRegister }: { isRegister: boolean }) => {
  const { setLoggedIn, go, authError, setAuthError } = useAppContext();
  const [showPassword, setShowPassword] = useState(false);

  const handleAuth = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);

    if (isRegister && data.get("password") !== data.get("confirm")) {
      setAuthError("Konfirmasi password tidak sama.");
      return;
    }

    if (isRegister) {
      setAuthError("");
      go("login");
    } else {
      setAuthError("");
      setLoggedIn(true);
      go("home");
    }
  };

  return (
    <main className="auth-page">
      <form className="auth-card" onSubmit={handleAuth}>
        <h2>{isRegister ? "Daftar Akun" : "Masuk ke Akun Anda"}</h2>
        <p className="auth-sub">
          {isRegister ? "Buat akun untuk menikmati semua fitur kami." : "Silakan login untuk melanjutkan transaksi."}
        </p>

        {isRegister && (
          <>
            <div className="auth-field"><UserRound className="lead" size={18} /><input name="fullname" required placeholder="Nama Lengkap" /></div>
            <div className="auth-field"><UserRound className="lead" size={18} /><input name="username" required placeholder="Username" /></div>
            <div className="auth-field"><Mail className="lead" size={18} /><input name="email" required type="email" placeholder="Email" /></div>
          </>
        )}

        {!isRegister && (
          <div className="auth-field"><UserRound className="lead" size={18} /><input name="account" required type="text" placeholder="Email atau Username" /></div>
        )}

        <div className="auth-field">
          <Lock className="lead" size={18} />
          <input name="password" required type={!isRegister && showPassword ? "text" : "password"} placeholder="Password" />
          {!isRegister && (
            <button type="button" className="eye-button" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          )}
        </div>

        {isRegister && (
          <div className="auth-field"><Lock className="lead" size={18} /><input name="confirm" required type="password" placeholder="Konfirmasi Password" /></div>
        )}

        {authError && <p className="auth-error">{authError}</p>}

        <button className="primary-button full auth-submit" type="submit">
          {isRegister ? "Daftar" : "Masuk"}
        </button>

        <p className="auth-switch">
          {isRegister ? "Sudah punya akun?" : "Belum punya akun?"}{" "}
          <button type="button" onClick={() => go(isRegister ? "login" : "register")}>
            {isRegister ? "Masuk di sini" : "Daftar di sini"}
          </button>
        </p>
      </form>
    </main>
  );
};

export default Auth;