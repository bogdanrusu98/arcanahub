// "use client";
// // React context for Firebase Auth user + ID token fetch helper.

// import { createContext, useContext, useEffect, useMemo, useState } from "react";
// import { onAuthStateChanged, User, getIdToken } from "firebase/auth";
// import { auth } from "@/lib/firebase";

// type AuthCtx = {
//   user: User | null;
//   loading: boolean;
//   getToken: () => Promise<string | null>;
// };

// const Ctx = createContext<AuthCtx>({
//   user: null,
//   loading: true,
//   getToken: async () => null,
// });

// export function useAuth() {
//   return useContext(Ctx);
// }

// export default function AuthProvider({ children }: { children: React.ReactNode }) {
//   const [user, setUser] = useState<User | null>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     // Subscribe to Firebase Auth changes
//     const unsub = onAuthStateChanged(auth, async (u) => {
//       setUser(u ?? null);
//       setLoading(false);
//     });
//     return () => unsub();
//   }, []);

//   const getToken = async () => {
//     if (!auth.currentUser) return null;
//     return await getIdToken(auth.currentUser, true);
//   };

//   const value = useMemo(() => ({ user, loading, getToken }), [user, loading]);

//   return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
// }
