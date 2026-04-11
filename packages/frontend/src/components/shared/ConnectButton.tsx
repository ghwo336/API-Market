"use client";

import { ConnectButton as RainbowConnectButton } from "@rainbow-me/rainbowkit";
import { useTheme } from "@/providers/ThemeProvider";

export default function ConnectButton() {
  const { theme } = useTheme();

  return (
    <RainbowConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        mounted,
      }) => {
        const ready = mounted;
        const connected = ready && account && chain;

        return (
          <div
            {...(!ready && {
              "aria-hidden": true,
              style: { opacity: 0, pointerEvents: "none", userSelect: "none" },
            })}
          >
            {!connected ? (
              <button
                onClick={openConnectModal}
                className="btn-primary"
                style={{ fontSize: "0.8125rem", padding: "0.4375rem 1rem" }}
              >
                Connect Wallet
              </button>
            ) : chain?.unsupported ? (
              <button
                onClick={openChainModal}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.375rem",
                  padding: "0.4375rem 1rem",
                  borderRadius: "8px",
                  fontSize: "0.8125rem",
                  fontWeight: 600,
                  background: "rgba(248,81,73,0.15)",
                  color: "var(--red)",
                  border: "1px solid rgba(248,81,73,0.35)",
                  cursor: "pointer",
                }}
              >
                Wrong Network
              </button>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                {/* Chain button */}
                <button
                  onClick={openChainModal}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.375rem",
                    padding: "0.4375rem 0.75rem",
                    borderRadius: "8px",
                    fontSize: "0.8125rem",
                    fontWeight: 500,
                    background: "var(--bg3)",
                    color: "var(--text2)",
                    border: "1px solid var(--border2)",
                    cursor: "pointer",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--border)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "var(--bg3)")}
                >
                  {chain?.hasIcon && chain.iconUrl && (
                    <img src={chain.iconUrl} alt={chain.name} style={{ width: 14, height: 14, borderRadius: "50%" }} />
                  )}
                  {chain?.name}
                </button>

                {/* Account button */}
                <button
                  onClick={openAccountModal}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "0.4375rem 0.875rem",
                    borderRadius: "8px",
                    fontSize: "0.8125rem",
                    fontWeight: 600,
                    background: theme === "dark"
                      ? "rgba(63,185,80,0.12)"
                      : "rgba(37,99,235,0.1)",
                    color: theme === "dark" ? "var(--green)" : "var(--accent)",
                    border: `1px solid ${theme === "dark" ? "rgba(63,185,80,0.3)" : "rgba(37,99,235,0.3)"}`,
                    cursor: "pointer",
                    transition: "background 0.15s",
                    fontFamily: "var(--font-mono)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = theme === "dark"
                      ? "rgba(63,185,80,0.2)"
                      : "rgba(37,99,235,0.18)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = theme === "dark"
                      ? "rgba(63,185,80,0.12)"
                      : "rgba(37,99,235,0.1)";
                  }}
                >
                  {/* Status dot */}
                  <span
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: "50%",
                      background: theme === "dark" ? "var(--green)" : "var(--accent)",
                      flexShrink: 0,
                    }}
                  />
                  {account.displayName}
                </button>
              </div>
            )}
          </div>
        );
      }}
    </RainbowConnectButton.Custom>
  );
}
