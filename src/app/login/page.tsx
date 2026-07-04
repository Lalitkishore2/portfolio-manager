"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Key, Eye, EyeOff, ShieldAlert, Loader2 } from "lucide-react";
import { toast, Toaster } from "sonner";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!password) {
      toast.error("Please enter your password");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      toast.success("Access authorized!");
      router.push("/");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Incorrect password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#09090b",
        fontFamily: "'Inter', sans-serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Decorative deconstructivist accents */}
      <div
        style={{
          position: "absolute",
          top: "-10%",
          left: "-10%",
          width: "40%",
          height: "40%",
          background: "linear-gradient(135deg, rgba(239, 68, 68, 0.05), transparent)",
          transform: "rotate(-15deg)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-10%",
          right: "-10%",
          width: "40%",
          height: "40%",
          background: "linear-gradient(135deg, transparent, rgba(59, 130, 246, 0.05))",
          transform: "rotate(15deg)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          width: "100%",
          maxWidth: 400,
          padding: 32,
          background: "rgba(24, 24, 27, 0.8)",
          backdropFilter: "blur(16px)",
          border: "1px solid rgba(255,255,255,0.05)",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5)",
          position: "relative",
          zIndex: 10,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 48,
                height: 48,
                background: "rgba(239, 68, 68, 0.1)",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                color: "#ef4444",
                marginBottom: 16,
              }}
            >
              <ShieldAlert size={22} />
            </div>
            <h1
              style={{
                fontSize: 20,
                fontWeight: 800,
                color: "#fafafa",
                letterSpacing: "-0.02em",
                margin: 0,
              }}
            >
              PORTFOLIO CONTROL
            </h1>
            <p
              style={{
                fontSize: 12,
                color: "#71717a",
                marginTop: 6,
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              RESTRICTED AREA // ACCESS CREDENTIALS
            </p>
          </div>

          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: 10,
                  fontWeight: 600,
                  color: "#a1a1aa",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  marginBottom: 8,
                }}
              >
                Access Password
              </label>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  background: "rgba(9, 9, 11, 0.5)",
                  border: "1px solid #27272a",
                  position: "relative",
                  transition: "border-color 200ms",
                }}
              >
                <div
                  style={{
                    padding: "0 12px",
                    color: "#52525b",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <Key size={14} />
                </div>
                <input
                  type={show ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter administrator password..."
                  autoFocus
                  style={{
                    flex: 1,
                    background: "transparent",
                    border: "none",
                    outline: "none",
                    padding: "12px 0",
                    fontSize: 13,
                    color: "#e4e4e7",
                    fontFamily: "'Inter', sans-serif",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShow(!show)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#52525b",
                    padding: "0 12px",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  {show ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "12px",
                background: "#ef4444",
                color: "#ffffff",
                border: "none",
                fontWeight: 600,
                fontSize: 13,
                cursor: loading ? "not-allowed" : "pointer",
                transition: "background-color 200ms",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              {loading ? (
                <>
                  <Loader2 size={14} style={{ animation: "spin 1s linear " }} className="animate-spin" />
                  Verifying...
                </>
              ) : (
                "Authorize Access"
              )}
            </button>
          </form>
        </div>
      </div>

      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: "#18181b",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "#fafafa",
            fontFamily: "'Inter', sans-serif",
            fontSize: 12,
          },
        }}
      />
    </div>
  );
}
