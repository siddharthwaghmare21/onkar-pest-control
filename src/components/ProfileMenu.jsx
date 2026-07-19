"use client";

import Link from "next/link";
import { LogIn, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { isAdminUser } from "@/lib/auth/roles";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { hasSupabasePublicEnv } from "@/lib/supabase/config";

export default function ProfileMenu({ onNavigate }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (!hasSupabasePublicEnv()) return;

    const supabase = createSupabaseBrowserClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user ?? null));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  async function signOutAndGo(path) {
    if (hasSupabasePublicEnv()) {
      const supabase = createSupabaseBrowserClient();
      await supabase.auth.signOut();
    }

    setOpen(false);
    onNavigate?.();
    router.refresh();
    router.push(path);
  }

  const name = user?.user_metadata?.full_name || user?.email || "Account";
  const initials = name.slice(0, 1).toUpperCase();
  const accountPath = isAdminUser(user) ? "/admin" : "/dashboard";

  if (!user) {
    return (
      <Link className="profile-login-link" href="/login" onClick={onNavigate}>
        <LogIn size={16} /> Login
      </Link>
    );
  }

  return (
    <div className="profile-menu">
      <button className="profile-trigger" onClick={() => setOpen(!open)} type="button" aria-expanded={open}>
        <span className="profile-avatar">{initials}</span>
        <span className="profile-name">{name}</span>
      </button>

      {open && (
        <div className="profile-dropdown">
          <div className="profile-summary">
            <UserRound size={18} />
            <span>
              <strong>{name}</strong>
              <small>{user.email}</small>
            </span>
          </div>
          <Link href={accountPath} onClick={() => { setOpen(false); onNavigate?.(); }}>Open Dashboard</Link>
          <button type="button" disabled>Update Profile - coming next</button>
          <button type="button" disabled>Delete Account - secure phase</button>
          <button type="button" onClick={() => signOutAndGo("/login")}>Login with another account</button>
          <button type="button" onClick={() => signOutAndGo("/register")}>Create new account</button>
        </div>
      )}
    </div>
  );
}
