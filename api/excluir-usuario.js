const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

module.exports = async (req, res) => {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Responder OPTIONS (preflight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Permitir apenas DELETE
  if (req.method !== "DELETE") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  const { id } = req.body;

  // Validação
  if (!id) {
    return res.status(400).json({ error: "ID do usuário é obrigatório" });
  }

  try {
    // Primeiro, deletar da tabela usuarios
    const { error: deleteUsuarioError } = await supabase
      .from("usuarios")
      .delete()
      .eq('id', id);

    if (deleteUsuarioError) {
      console.error("Erro ao deletar da tabela usuarios:", deleteUsuarioError);
      throw deleteUsuarioError;
    }

    // Depois, deletar da autenticação do Supabase
    const { error: deleteAuthError } = await supabase.auth.admin.deleteUser(id);

    if (deleteAuthError) {
      console.error("Erro ao deletar da autenticação:", deleteAuthError);
      // Não lançar erro aqui, pois o usuário já foi deletado da tabela
      console.log("Usuário removido da tabela, mas houve erro ao remover da autenticação");
    }

    return res.status(200).json({ 
      ok: true, 
      message: "Usuário excluído com sucesso"
    });

  } catch (err) {
    console.error("Erro ao excluir usuário:", err);
    return res.status(400).json({ 
      error: err.message,
      details: "Erro ao excluir usuário do Supabase"
    });
  }
};
