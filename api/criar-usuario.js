const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  const { nome, username, email, senha, tipo, permissoes } = req.body;

  try {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password: senha,
      email_confirm: true,
    });

    if (error) throw error;

    const userId = data.user.id;

    const { error: insertError } = await supabase
      .from("usuarios")
      .insert({
        id: userId,
        username,
        nome,
        tipo,
        permissoes,
      });

    if (insertError) throw insertError;

    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};
