"use client";

import { useEffect, useState } from "react";
import { Bell, BellOff, Check } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { JobAlertForm } from "./JobAlertForm";

interface Props {
  companyId:   string;
  companyName: string;
}

type AuthState = "loading" | "anonymous" | "authenticated";
type FollowState = "loading" | "following" | "not-following";

export function FollowCompanyButton({ companyId, companyName }: Props) {
  const [authState,   setAuthState]   = useState<AuthState>("loading");
  const [followState, setFollowState] = useState<FollowState>("loading");
  const [freq,        setFreq]        = useState<"DAILY" | "WEEKLY">("WEEKLY");
  const [userEmail,   setUserEmail]   = useState("");
  const [isEmployer,  setIsEmployer]  = useState(false);
  const [busy,        setBusy]        = useState(false);

  useEffect(() => {
    async function init() {
      const supabase = createSupabaseBrowserClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.user?.email) {
        setAuthState("anonymous");
        setFollowState("not-following");
        return;
      }

      const email = session.user.email;
      setUserEmail(email);
      setAuthState("authenticated");

      // Check employer status — employers cannot follow companies for alerts
      const empRes = await fetch("/api/employers/check-email", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email }),
      }).catch(() => null);
      if (empRes?.ok) {
        const empData = await empRes.json().catch(() => ({}));
        if (empData.exists) { setIsEmployer(true); return; }
      }

      const res = await fetch(
        `/api/candidates/alert?email=${encodeURIComponent(email)}&companyId=${encodeURIComponent(companyId)}`
      );
      if (res.ok) {
        const data = await res.json();
        setFollowState(data.subscribed ? "following" : "not-following");
        if (data.alertFrequency) setFreq(data.alertFrequency as "DAILY" | "WEEKLY");
      } else {
        setFollowState("not-following");
      }
    }
    init();
  }, [companyId]);

  async function handleFollow() {
    setBusy(true);
    await fetch("/api/candidates/alert", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ email: userEmail, companyId, alertFrequency: freq }),
    });
    setFollowState("following");
    setBusy(false);
  }

  async function handleUnfollow() {
    setBusy(true);
    await fetch("/api/candidates/alert", {
      method:  "DELETE",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ email: userEmail, companyId }),
    });
    setFollowState("not-following");
    setBusy(false);
  }

  async function handleFreqChange(newFreq: "DAILY" | "WEEKLY") {
    setFreq(newFreq);
    if (followState === "following") {
      await fetch("/api/candidates/alert", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email: userEmail, companyId, alertFrequency: newFreq }),
      });
    }
  }

  if (isEmployer) return null;

  if (authState === "loading" || (authState === "authenticated" && followState === "loading")) {
    return (
      <div style={{ height: 40, background: "var(--border)", borderRadius: 8, opacity: 0.5, animation: "pulse 1.5s ease-in-out infinite" }} />
    );
  }

  if (authState === "anonymous") {
    return <JobAlertForm companyName={companyName} companyId={companyId} />;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {followState === "following" ? (
        <>
          <button
            onClick={handleUnfollow}
            disabled={busy}
            className="btn btn-accent"
            style={{ width: "100%", justifyContent: "center" }}
          >
            <Check size={14} />
            Following {companyName}
          </button>
          <button
            onClick={handleUnfollow}
            disabled={busy}
            className="btn btn-ghost btn-sm"
            style={{ width: "100%", justifyContent: "center", color: "var(--text-muted)" }}
          >
            <BellOff size={12} /> Unfollow
          </button>
        </>
      ) : (
        <button
          onClick={handleFollow}
          disabled={busy}
          className="btn btn-primary"
          style={{ width: "100%", justifyContent: "center" }}
        >
          <Bell size={14} />
          {busy ? "Subscribing…" : `Follow ${companyName}`}
        </button>
      )}

      <div style={{ display: "flex", gap: 8 }}>
        {(["DAILY", "WEEKLY"] as const).map(f => (
          <button
            key={f}
            type="button"
            onClick={() => handleFreqChange(f)}
            className={`btn btn-sm${freq === f ? " btn-primary" : " btn-outline"}`}
            style={{ flex: 1, justifyContent: "center" }}
          >
            {f === "DAILY" ? "Daily" : "Weekly"}
          </button>
        ))}
      </div>

      {followState === "following" && (
        <p className="mono-s" style={{ color: "var(--text-subtle)", margin: 0, textAlign: "center" }}>
          ALERTS SENT TO {userEmail.toUpperCase()}
        </p>
      )}
    </div>
  );
}
