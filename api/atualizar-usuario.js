const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

module.exports = async (req, res) => {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Responder OPTIONS (preflight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Permitir apenas PUT
  if (req.method !== "PUT") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  const { id, nome, username, tipo, permissoes } = req.body;

  // Validação
  if (!id) {
    return res.status(400).json({ error: "ID do usuário é obrigatório" });
  }

  if (!nome || !username || !tipo) {
    return res.status(400).json({ error: "Nome, username e tipo são obrigatórios" });
  }

  try {
    // Atualizar dados na tabela usuarios
    const { data, error } = await supabase
      .from("usuarios")
      .update({
        nome,
        username,
        tipo,
        permissoes
      })
      .eq('id', id)
      .select();

    if (error) {
      console.error("Erro ao atualizar:", error);
      throw error;
    }

    if (!data || data.length === 0) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    return res.status(200).json({ 
      ok: true, 
      message: "Usuário atualizado com sucesso",
      usuario: data[0]
    });

  } catch (err) {
    console.error("Erro ao atualizar usuário:", err);
    return res.status(400).json({ 
      error: err.message,
      details: "Erro ao atualizar usuário no Supabase"
    });
  }
};
