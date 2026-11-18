import { useState, type FormEvent } from "react";
import { UserRound, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useAppContext } from "../context/AppContext";
import { errorMessage } from "../data/lib/api";

const Auth = ({ isRegister }: { isRegister: boolean }) => {
  const { login, register, go, authError, setAuthError } = useAppContext();

  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleAuth = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const data = new FormData(e.currentTarget);
    const get = (key: string) => String(data.get(key) ?? "").trim();
    const password = String(data.get("password") ?? "");

    // Validasi konfirmasi password
    if (isRegister && password !== String(data.get("confirm") ?? "")) {
      setAuthError("Konfirmasi password tidak sama.");
      return;
    }

    // Validasi minimal password
    if (isRegister && password.length < 8) {
      setAuthError("Password minimal 8 karakter.");
      return;
    }

    setSubmitting(true);
    setAuthError("");

    try {
      if (isRegister) {
        // PROSES REGISTER
        await register({
          nama: get("fullname"),
          username: get("username"),
          email: get("email"),
          password,
          password_confirmation: password,
        });

        setAuthError("");
        go("login");

      } else {
        // PROSES LOGIN
        await login(get("account"), password);
        go("home");
      }

    } catch (err) {
      setAuthError(errorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="auth-page">
      <form className="auth-card" onSubmit={handleAuth}>
        <h2>{isRegister ? "Daftar Akun" : "Masuk ke Akun Anda"}</h2>

        <p className="auth-sub">
          {isRegister
            ? "Buat akun untuk menikmati semua fitur kami."
            : "Silakan login untuk melanjutkan transaksi."}
        </p>

        {isRegister && (
          <>
            <div className="auth-field">
              <UserRound className="lead" size={18} />
              <input
                name="fullname"
                required
                maxLength={100}
                placeholder="Nama Lengkap"
              />
            </div>

            <div className="auth-field">
              <UserRound className="lead" size={18} />
              <input
                name="username"
                required
                maxLength={50}
                placeholder="Username"
              />
            </div>

            <div className="auth-field">
              <Mail className="lead" size={18} />
              <input
                name="email"
                required
                type="email"
                maxLength={150}
                placeholder="Email"
              />
            </div>
          </>
        )}

        {!isRegister && (
          <div className="auth-field">
            <UserRound className="lead" size={18} />
            <input
              name="account"
              required
              type="text"
              placeholder="Email atau Username"
            />
          </div>
        )}

        <div className="auth-field">
          <Lock className="lead" size={18} />

          <input
            name="password"
            required
            type={!isRegister && showPassword ? "text" : "password"}
            placeholder="Password"
          />

          {!isRegister && (
            <button
              type="button"
              className="eye-button"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          )}
        </div>

        {isRegister && (
          <div className="auth-field">
            <Lock className="lead" size={18} />
            <input
              name="confirm"
              required
              type="password"
              placeholder="Konfirmasi Password"
            />
          </div>
        )}

        {authError && (
          <p className="auth-error">{authError}</p>
        )}

        <button
          className="primary-button full auth-submit"
          type="submit"
          disabled={submitting}
        >
          {submitting
            ? "Memproses..."
            : isRegister
              ? "Daftar"
              : "Masuk"}
        </button>

        <p className="auth-switch">
          {isRegister ? "Sudah punya akun?" : "Belum punya akun?"}{" "}

          <button
            type="button"
            onClick={() => go(isRegister ? "login" : "register")}
          >
            {isRegister ? "Masuk di sini" : "Daftar di sini"}
          </button>
        </p>
      </form>
    </main>
  );
};

export default Auth;