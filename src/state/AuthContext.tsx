// src/state/AuthContext.tsx
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import { supabase } from "../supabaseClient";
import type { Session, User } from "@supabase/supabase-js";

export type Profile = {
  id: string;
  full_name: string | null;
  school: string | null;
  grade: string | null;
  // 需要再加欄位自己補
};

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;

  /** 需要時手動刷新 profile（例如 ProfileSetup 成功後） */
  refreshProfile: () => Promise<void>;

  /** 登出（避免幽靈登入） */
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue>({
  session: null,
  user: null,
  profile: null,
  loading: true,
  refreshProfile: async () => {},
  signOut: async () => {},
});

async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, school, grade")
    .eq("id", userId)
    .maybeSingle(); // ✅ 關鍵：找不到不會 406

  if (error) {
    console.error("[AuthContext.fetchProfile] error:", error);
    return null;
  }

  return data ?? null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const hydrate = useCallback(async (sess: Session | null) => {
    setLoading(true);

    try {
      setSession(sess);
      setUser(sess?.user ?? null);

      if (sess?.user?.id) {
        const p = await fetchProfile(sess.user.id);
        setProfile(p);
      } else {
        setProfile(null);
      }
    } catch (e) {
      console.error("[AuthContext.hydrate] exception:", e);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    const uid = session?.user?.id;
    if (!uid) {
      setProfile(null);
      return;
    }
    const p = await fetchProfile(uid);
    setProfile(p);
  }, [session?.user?.id]);

  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.error("[AuthContext.signOut] error:", e);
    } finally {
      // ✅ 保險：不管 SDK 成功與否，狀態先清乾淨
      setSession(null);
      setUser(null);
      setProfile(null);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    // 1) 初次拿 session
    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!isMounted) return;
        hydrate(data.session ?? null);
      })
      .catch((e) => {
        console.error("[AuthContext.getSession] error:", e);
        if (isMounted) setLoading(false);
      });

    // 2) 監聽後續登入/登出
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, sess) => {
      if (!isMounted) return;
      hydrate(sess ?? null);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [hydrate]);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user,
      profile,
      loading,
      refreshProfile,
      signOut,
    }),
    [session, user, profile, loading, refreshProfile, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
