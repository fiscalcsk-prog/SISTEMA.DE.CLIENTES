const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

module.exports = async (req, res) => {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Responder OPTIONS (preflight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Permitir apenas GET
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  try {
    // Buscar todos os usuários da tabela 'usuarios'
    const { data, error } = await supabase
      .from("usuarios")
      .select("id, username, nome, tipo, permissoes")
      .order("nome", { ascending: true });

    if (error) {
      console.error("Erro Supabase:", error);
      throw error;
    }

    console.log("Usuários encontrados:", data?.length || 0);
    
    // ✅ RETORNAR NO FORMATO ESPERADO PELO FRONTEND
    return res.status(200).json({
      success: true,
      usuarios: data || []
    });
    
  } catch (err) {
    console.error("Erro ao listar usuários:", err);
    return res.status(500).json({ 
      success: false,
      error: err.message,
      usuarios: []
    });
  }
};
