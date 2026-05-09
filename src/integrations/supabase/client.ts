// Stub do cliente backend — o MVP atual usa Google Sheets/Apps Script.
// Mantido apenas para satisfazer imports legados em páginas não utilizadas
// no fluxo principal (Admin/Auth antigos). Não realiza chamadas reais.

type AnyFn = (...args: any[]) => any;

const noopQuery: any = {
  select: () => noopQuery,
  insert: () => noopQuery,
  upsert: async () => ({ data: null, error: null }),
  eq: () => noopQuery,
  single: async () => ({ data: null, error: null }),
};

export const supabase: any = {
  auth: {
    getSession: async () => ({ data: { session: null } }),
    onAuthStateChange: (_cb: AnyFn) => ({
      data: { subscription: { unsubscribe: () => {} } },
    }),
    signInWithPassword: async () => ({ error: new Error("Auth desativado") }),
    signUp: async () => ({ error: new Error("Auth desativado") }),
    signOut: async () => ({ error: null }),
  },
  from: () => noopQuery,
  storage: {
    from: () => ({
      upload: async () => ({ error: null }),
      getPublicUrl: () => ({ data: { publicUrl: "" } }),
    }),
  },
};
