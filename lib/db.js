import { supabaseAdmin } from "./supabaseAdmin"

export const db = {
  /** ===================
   *  🔐 AUTH
   *  =================== */
async registerUser({ name, email, password, company, phone, role }) {
  try {
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name, role, company, phone },
    });

    if (error) throw error;
    const user = data.user;

    // Cria também um registro adicional em "users"
    await supabaseAdmin.from("users").insert([
      {
        id: user.id,
        name,
        email,
        company,
        phone,
        role,
        created_at: new Date().toISOString(),
      },
    ]);

    return { data: user, error: null };
  } catch (error) {
    return { data: null, error };
  }
},

async loginUser({ email, password }) {
  try {
    if (!email || !password) throw new Error("Email e senha são obrigatórios");

    // Faz o login diretamente no Supabase Auth
    const { data, error } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    if (!data.user) throw new Error("Usuário não encontrado");

    // Busca dados adicionais do usuário (ex: tabela users)
    const { data: profile } = await supabaseAdmin
      .from("users")
      .select("id, name, company, phone, role")
      .eq("email", email)
      .maybeSingle();

    return {
      data: {
        id: data.user.id,
        email: data.user.email,
        name: profile?.name || data.user.user_metadata?.name,
        company: profile?.company || null,
        phone: profile?.phone || null,
        role: profile?.role || "user",
        access_token: data.session?.access_token,
      },
      error: null,
    };
  } catch (error) {
    return { data: null, error };
  }
},

  /** ===================
   *  👥 LEADS
   *  =================== */
  async getLeads() {
    try {
      const { data, error } = await supabaseAdmin
        .from("leads")
        .select("*")
        .order("created_at", { ascending: false })
      return { data, error }
    } catch (error) {
      return { data: null, error }
    }
  },

  async upsertLead(lead) {
    try {
      const { data, error } = await supabaseAdmin
        .from("leads")
        .upsert([lead])
        .select("*")
        .single()
      return { data, error }
    } catch (error) {
      return { data: null, error }
    }
  },

  async deleteLead(id) {
    try {
      const { error } = await supabaseAdmin.from("leads").delete().eq("id", id)
      return { error }
    } catch (error) {
      return { error }
    }
  },

  /** ===================
   *  🏢 COMPANIES
   *  =================== */
  async getCompanies() {
    try {
      const { data, error } = await supabaseAdmin
        .from("companies")
        .select("*")
        .order("name", { ascending: true })
      return { data, error }
    } catch (error) {
      return { data: null, error }
    }
  },

  async upsertCompany(company) {
    try {
      const { data, error } = await supabaseAdmin
        .from("companies")
        .upsert([company])
        .select("*")
        .single()
      return { data, error }
    } catch (error) {
      return { data: null, error }
    }
  }
}
