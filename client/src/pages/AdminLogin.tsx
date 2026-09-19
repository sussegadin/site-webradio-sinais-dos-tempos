import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Lock, ShieldCheck } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";

export default function AdminLogin() {
  const { login } = useAuth();
  const [, navigate] = useLocation();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(password);
      navigate("/admin");
    } catch (err: any) {
      setError(err.message || "Não foi possível entrar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container page-main">
      <div className="locked-card" style={{ maxWidth: 420, margin: "0 auto" }}>
        <ShieldCheck size={36} />
        <h1>Entrar como administrador</h1>
        <p>Digite a senha de administração para acessar o painel.</p>
        <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%" }}>
          <div className="search-box">
            <Lock size={18} />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Senha de administrador"
              autoFocus
            />
          </div>
          {error && <p style={{ color: "#f87171", fontSize: 14 }}>{error}</p>}
          <button className="primary-button" type="submit" disabled={loading || !password}>
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
        <Link href="/" className="text-link" style={{ marginTop: 16 }}>
          Voltar para o site
        </Link>
      </div>
    </main>
  );
}
