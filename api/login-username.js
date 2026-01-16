import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  const { username, senha } = req.body;

  try {
    // 1. Buscar o usuário pelo username
    const { data: userRow, error: userError } = await supabase
      .from("usuarios")
      .select("id")
      .eq("username", username)
      .single();

    if (userError || !userRow) {
      return res.status(401).json({ error: "Usuário não encontrado" });
    }

    // 2. Buscar o e-mail real no auth.users
    const { data: authUser, error: authError } =
      await supabase.auth.admin.getUserById(userRow.id);

    if (authError || !authUser?.user?.email) {
      return res.status(401).json({ error: "Usuário inválido" });
    }

    const email = authUser.user.email;

    // 3. Autenticar normalmente no Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    });

    if (error) {
      return res.status(401).json({ error: "Senha incorreta" });
    }

    return res.status(200).json({
      user: {
        id: data.user.id,
        email: data.user.email,
        username,
      },
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
