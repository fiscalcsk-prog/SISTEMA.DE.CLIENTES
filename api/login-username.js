const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  const { username, senha } = req.body;

  try {
    const { data: userRow, error: userError } = await supabase
      .from("usuarios")
      .select("id")
      .eq("username", username)
      .single();

    if (userError || !userRow) {
      return res.status(401).json({ error: "Usuário não encontrado" });
    }

    const { data: authUser, error: authError } =
      await supabase.auth.admin.getUserById(userRow.id);

    if (authError || !authUser?.user?.email) {
      return res.status(401).json({ error: "Usuário inválido" });
    }

    const email = authUser.user.email;

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
};
