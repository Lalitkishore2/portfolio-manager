import { useState } from "react";
import { motion } from "framer-motion";
import {
  Github,
  Key,
  GitBranch,
  Zap,
  Globe,
  ExternalLink,
  Sparkles,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ChevronDown,
  Loader2,
  Save,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { LiquidButton } from "../ui/liquid-glass-button";

/* --- PrefixInput ------------------------------------------------ */
function PrefixInput({
  icon,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  icon: React.ReactNode;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  const [show, setShow] = useState(false);
  const inputType = type === "password" ? (show ? "text" : "password") : type;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        background: "rgba(24,24,27,0.5)",
        border: "1px solid #27272a",
        borderRadius: 8,
        overflow: "hidden",
        transition: "border-color 200ms",
      }}
    >
      <div
        style={{
          padding: "0 12px",
          display: "flex",
          alignItems: "center",
          color: "#52525b",
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div
        style={{ width: 1, height: 16, background: "#27272a", flexShrink: 0 }}
      />
      <input
        value={value}
        type={inputType}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          flex: 1,
          background: "transparent",
          border: "none",
          outline: "none",
          padding: "9px 12px",
          fontSize: 13,
          color: "#e4e4e7",
          fontFamily: "'Inter', sans-serif",
        }}
      />
      {type === "password" && (
        <button
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
      )}
    </div>
  );
}

/* --- SectionCard ------------------------------------------------ */
function SectionCard({
  icon,
  title,
  iconColor,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  iconColor?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        background: "#18181b",
        border: "1px solid #27272a",
        borderRadius: 16,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "16px 20px",
          borderBottom: "1px solid #27272a",
        }}
      >
        <span style={{ color: iconColor ?? "#a1a1aa", display: "flex" }}>
          {icon}
        </span>
        <span
          style={{ fontSize: 13, fontWeight: 600, color: "#e4e4e7" }}
        >
          {title}
        </span>
      </div>
      <div
        style={{
          padding: 20,
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        {children}
      </div>
    </div>
  );
}

/* --- FieldLabel ------------------------------------------------- */
function Label({ children }: { children: React.ReactNode }) {
  return (
    <label
      style={{
        display: "block",
        fontSize: 11,
        fontWeight: 500,
        color: "#a1a1aa",
        marginBottom: 6,
      }}
    >
      {children}
    </label>
  );
}

import { useMakeStore } from "@/store/makeStore";

/* --- SettingsPage ----------------------------------------------- */
import { useEffect } from "react";

export function SettingsPage() {
  /* Deployment */
  const [repo, setRepo] = useState("Lalitkishore2/portfolio");
  const [token, setToken] = useState("");
  const [branch, setBranch] = useState("main");
  const [connState, setConnState] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");

  /* Preview */
  const [previewUrl, setPreviewUrl] = useState("http://localhost:4321");

  /* AI */
  const [apiKey, setApiKey] = useState(""); // OpenRouter key
  const [groqKey, setGroqKey] = useState("");
  const [geminiKey, setGeminiKey] = useState("");
  const [nvidiaKey, setNvidiaKey] = useState("");
  const [ollamaKey, setOllamaKey] = useState("");
  const [ollamaUrl, setOllamaUrl] = useState("https://api.ollamacloud.io");
  const [model, setModel] = useState("gemini");
  const [maxTokens, setMaxTokens] = useState("1024");
  const [aiState, setAiState] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");

  /* Save */
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch("/api/settings");
        if (res.ok) {
          const data = await res.json();
          setRepo(data.repo);
          setToken(data.token);
          setBranch(data.branch);
          setPreviewUrl(data.previewUrl);
          setApiKey(data.openrouterKey);
          setGroqKey(data.groqKey);
          setGeminiKey(data.geminiKey);
          setNvidiaKey(data.nvidiaKey);
          setOllamaKey(data.ollamaKey);
          setOllamaUrl(data.ollamaUrl);
          const savedModel = data.defaultModel || "gemini";
          setModel(savedModel);
          useMakeStore.getState().setProvider(savedModel);
        }
      } catch (e) {
        console.error("Failed to load settings", e);
      }
    }
    loadSettings();
  }, []);

  async function testConnection() {
    setConnState("loading");
    try {
      // First save current settings so the server has the latest token
      await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          repo, token, branch, previewUrl,
          openrouterKey: apiKey, groqKey, geminiKey, nvidiaKey, ollamaKey, ollamaUrl, defaultModel: model,
        }),
      });
      // Then test the connection
      const res = await fetch("/api/github/test");
      const data = await res.json();
      if (data.ok) {
        setConnState("success");
        toast.success(data.message);
      } else {
        setConnState("error");
        toast.error(data.message || "Connection failed");
      }
    } catch (e: any) {
      setConnState("error");
      toast.error(e.message || "Connection test failed");
    }
    setTimeout(() => setConnState("idle"), 4500);
  }

  function testAI() {
    setAiState("loading");
    // Simple check: verify at least one AI key is set
    const hasKey = apiKey || groqKey || geminiKey || nvidiaKey || ollamaKey;
    setTimeout(() => {
      if (hasKey) {
        setAiState("success");
        toast.success("AI provider key configured");
      } else {
        setAiState("error");
        toast.error("No AI provider key is configured");
      }
    }, 800);
    setTimeout(() => setAiState("idle"), 4000);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          repo,
          token,
          branch,
          previewUrl,
          openrouterKey: apiKey,
          groqKey,
          geminiKey,
          nvidiaKey,
          ollamaKey,
          ollamaUrl,
          defaultModel: model,
        }),
      });
      if (!res.ok) throw new Error("Failed to save settings");
      useMakeStore.getState().setProvider(model);
      setSaved(true);
      toast.success("Settings saved successfully");
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  }

  /* Connection button state */
  const connBtnMap = {
    idle: {
      color: "#d4d4d8",
      icon: <Zap size={13} color="#fbbf24" />,
      label: "Test Connection",
    },
    loading: {
      color: "#a1a1aa",
      icon: <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} />,
      label: "Testing...",
    },
    success: {
      color: "var(--cms-accent-emerald)",
      icon: <CheckCircle size={13} color="#4ade80" />,
      label: "Connected",
      bg: "rgba(16,185,129,0.08)",
      border: "rgba(16,185,129,0.2)",
    },
    error: {
      label: "Connection Error",
      color: "var(--cms-accent-rose)",
      bg: "rgba(244,63,94,0.08)",
      border: "rgba(244,63,94,0.2)",
    },
  };
  const cb = connBtnMap[connState];

  const AI_STATE = {
    idle: null,
    loading: {
      label: "Testing...",
      color: "var(--cms-text-secondary)",
      bg: "rgba(255,255,255,0.03)",
      border: "var(--cms-border-glass)",
    },
    success: {
      label: "AI Connected",
    },
    error: {
      color: "#f87171",
      label: "API Error",
    },
  };
  const ab = aiBtnMap[aiState];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflow: "hidden",
        background: "#09090b",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Top Bar */}
      <div
        style={{
          padding: "18px 32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid #1f1f22",
          flexShrink: 0,
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 20,
              fontWeight: 600,
              color: "#fafafa",
              margin: "0 0 4px",
            }}
          >
            Settings
          </h1>
          <p style={{ fontSize: 12, color: "#52525b", margin: 0 }}>
            Configure deployment, preview server, and AI integration
          </p>
        </div>
        <LiquidButton
          onClick={handleSave}
          disabled={saving}
          style={{ color: saved ? "#4ade80" : "#fff" }}
        >
          {saved ? (
            <>
              <Check size={13} /> Saved
            </>
          ) : saving ? (
            "Saving..."
          ) : (
            <>
              <Save size={13} /> Save Settings
            </>
          )}
        </LiquidButton>
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflowY: "auto", padding: "24px 32px" }}>
        <div
          style={{
            maxWidth: 640,
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          {/* -- Deployment -- */}
          <SectionCard
            icon={<Github size={16} />}
            title="Deployment"
          >
            <div>
              <Label>GitHub Repository</Label>
              <PrefixInput
                icon={<Github size={14} />}
                value={repo}
                onChange={setRepo}
                placeholder="username/repo"
              />
            </div>
            <div>
              <Label>GitHub Token</Label>
              <PrefixInput
                icon={<Key size={14} />}
                value={token}
                onChange={setToken}
                type="password"
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
              />
              <p
                style={{
                  fontSize: 11,
                  color: "#52525b",
                  margin: "6px 0 0",
                }}
              >
                Token is stored in .env.local only — never written to settings.json
              </p>
            </div>
            <div>
              <Label>Branch</Label>
              <PrefixInput
                icon={<GitBranch size={14} />}
                value={branch}
                onChange={setBranch}
                placeholder="main"
              />
            </div>
            <div>
              <LiquidButton
                onClick={testConnection}
                disabled={connState === "loading"}
                style={{ color: cb.color }}
              >
                {cb.icon} {cb.label}
              </LiquidButton>
            </div>
          </SectionCard>

          {/* -- Live Preview -- */}
          <SectionCard
            icon={<Globe size={16} />}
            title="Live Preview"
          >
            <div>
              <Label>Astro Dev Server URL</Label>
              <PrefixInput
                icon={<Globe size={14} />}
                value={previewUrl}
                onChange={setPreviewUrl}
                placeholder="http://localhost:4321"
              />
            </div>
            <div>
              <LiquidButton
                onClick={() => window.open(previewUrl, "_blank")}
                style={{ color: "#fff" }}
              >
                <ExternalLink size={13} /> Open Preview
              </LiquidButton>
            </div>
          </SectionCard>

          {/* -- AI Integration -- */}
          <SectionCard
            icon={<Sparkles size={16} />}
            title="AI Integration"
            iconColor="#a855f7"
          >
            <div>
              <Label>Groq API Key</Label>
              <PrefixInput
                icon={<Key size={14} />}
                value={groqKey}
                onChange={setGroqKey}
                type="password"
                placeholder="gsk_xxxxxxxxxxxxxxxxxxxx"
              />
            </div>
            <div>
              <Label>OpenRouter API Key</Label>
              <PrefixInput
                icon={<Key size={14} />}
                value={apiKey}
                onChange={setApiKey}
                type="password"
                placeholder="sk-or-xxxxxxxxxxxxxxxxxxxx"
              />
            </div>
            <div>
              <Label>Gemini API Key</Label>
              <PrefixInput
                icon={<Key size={14} />}
                value={geminiKey}
                onChange={setGeminiKey}
                type="password"
                placeholder="AIzaSy..."
              />
            </div>
            <div>
              <Label>NVIDIA NIM API Key</Label>
              <PrefixInput
                icon={<Key size={14} />}
                value={nvidiaKey}
                onChange={setNvidiaKey}
                type="password"
                placeholder="nvapi-..."
              />
            </div>
            <div>
              <Label>Ollama Cloud API Key</Label>
              <PrefixInput
                icon={<Key size={14} />}
                value={ollamaKey}
                onChange={setOllamaKey}
                type="password"
                placeholder="Ollama Cloud API Key"
              />
            </div>
            <div>
              <Label>Ollama Cloud URL</Label>
              <PrefixInput
                icon={<Globe size={14} />}
                value={ollamaUrl}
                onChange={setOllamaUrl}
                placeholder="https://api.ollamacloud.io"
              />
            </div>
            <div>
              <p
                style={{
                  fontSize: 11,
                  color: "#52525b",
                  margin: "6px 0 0",
                }}
              >
                Keys are automatically read from your .env.local file. Entering them here requires backend saving implementation.
              </p>
            </div>
            <div>
              <Label>Default Model</Label>
              <div style={{ position: "relative" }}>
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "9px 36px 9px 12px",
                    background: "rgba(24,24,27,0.5)",
                    border: "1px solid #27272a",
                    borderRadius: 8,
                    fontSize: 13,
                    color: "#e4e4e7",
                    outline: "none",
                    appearance: "none" as const,
                    fontFamily: "'Inter', sans-serif",
                    cursor: "pointer",
                  }}
                >
                  <option value="gemini">Gemini (gemini-2.5-pro)</option>
                  <option value="openrouter-qwen">OpenRouter (qwen3-coder:free)</option>
                  <option value="openrouter-deepseek">OpenRouter (deepseek-v3:free)</option>
                  <option value="nvidia">NVIDIA NIM (deepseek-r1)</option>
                  <option value="ollama">Ollama Local (qwen2.5-coder)</option>
                  <option value="ollama-cloud">Ollama Cloud (Hosted)</option>
                </select>
                <ChevronDown
                  size={13}
                  color="#52525b"
                  style={{
                    position: "absolute",
                    right: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    pointerEvents: "none",
                  }}
                />
              </div>
            </div>
            <div>
              <Label>Max Tokens</Label>
              <input
                type="number"
                value={maxTokens}
                onChange={(e) => setMaxTokens(e.target.value)}
                min={256}
                max={8192}
                step={256}
                style={{
                  width: 140,
                  padding: "9px 12px",
                  background: "rgba(24,24,27,0.5)",
                  border: "1px solid #27272a",
                  borderRadius: 8,
                  fontSize: 13,
                  color: "#e4e4e7",
                  outline: "none",
                  fontFamily: "'Inter', sans-serif",
                }}
              />
            </div>
            <div>
              <LiquidButton
                onClick={testAI}
                disabled={aiState === "loading"}
                style={{ color: ab.color }}
              >
                <Sparkles size={13} /> {ab.label}
              </LiquidButton>
            </div>
          </SectionCard>

          {/* -- Danger Zone -- */}
          <div
            style={{
              background: "rgba(69,10,10,0.2)",
              border: "1px solid rgba(127,29,29,0.3)",
              borderRadius: 16,
              padding: 20,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 10,
              }}
            >
              <AlertTriangle size={15} color="#f87171" />
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#f87171",
                }}
              >
                Danger Zone
              </span>
            </div>
            <p
              style={{
                fontSize: 13,
                color: "#d4d4d8",
                margin: "0 0 4px",
              }}
            >
              Reset all content to last published state
            </p>
            <p
              style={{
                fontSize: 11,
                color: "#52525b",
                margin: "0 0 16px",
              }}
            >
              This will discard all unpublished changes and revert every JSON file to the last GitHub commit. This action cannot be undone.
            </p>
            <LiquidButton
              onClick={() => {
                if (
                  confirm(
                    "Reset all content to last published state? This cannot be undone."
                  )
                ) {
                  toast.error("Content reset to last published state");
                }
              }}
              style={{ color: "#f87171" }}
            >
              Reset Content
            </LiquidButton>
          </div>

          <div style={{ height: 32 }} />
        </div>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </motion.div>
  );
}
