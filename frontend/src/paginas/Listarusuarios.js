// backend/routes/listar-usuarios.js
// Cole este código no seu backend (Node.js/Express)

const express = require('express');
const router = express.Router();

// GET /api/usuarios - Lista todos os usuários
router.get('/usuarios', async (req, res) => {
  try {
    // Substitua pela sua conexão com o banco de dados
    // Exemplo com Prisma:
    // const usuarios = await prisma.usuario.findMany({
    //   select: {
    //     id: true,
    //     nome: true,
    //     username: true,
    //     email: true,
    //     tipo: true,
    //     permissoes: true,
    //     criadoEm: true,
    //     ativo: true
    //   }
    // });

    // Exemplo com MySQL:
    // const [usuarios] = await connection.query(
    //   'SELECT id, nome, username, email, tipo, permissoes, criado_em, ativo FROM usuarios'
    // );

    // Exemplo com MongoDB:
    // const usuarios = await Usuario.find({}, {
    //   senha: 0 // Não retornar a senha
    // });

    // TEMPORÁRIO - Remova isso e use sua consulta real
    const usuarios = [
      {
        id: 1,
        nome: "Admin Sistema",
        username: "admin",
        email: "admin@sistema.com",
        tipo: "ADM",
        permissoes: {
          consultar: true,
          cadastrar: true,
          editar: true,
          excluir: true
        },
        criadoEm: new Date(),
        ativo: true
      }
    ];

    res.json({
      success: true,
      usuarios: usuarios
    });

  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao listar usuários'
    });
  }
});

// GET /api/usuarios/:id - Busca um usuário específico
router.get('/usuarios/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Substitua pela sua consulta real
    // const usuario = await prisma.usuario.findUnique({
    //   where: { id: parseInt(id) },
    //   select: {
    //     id: true,
    //     nome: true,
    //     username: true,
    //     email: true,
    //     tipo: true,
    //     permissoes: true,
    //     criadoEm: true,
    //     ativo: true
    //   }
    // });

    // if (!usuario) {
    //   return res.status(404).json({
    //     success: false,
    //     error: 'Usuário não encontrado'
    //   });
    // }

    res.json({
      success: true,
      usuario: usuario
    });

  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar usuário'
    });
  }
});

// PUT /api/usuarios/:id - Atualiza um usuário
router.put('/usuarios/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, username, email, tipo, permissoes, senha } = req.body;

    // Validações
    if (!nome || !username || !email || !tipo) {
      return res.status(400).json({
        success: false,
        error: 'Campos obrigatórios faltando'
      });
    }

    // Preparar dados para atualização
    const dadosAtualizacao = {
      nome,
      username,
      email,
      tipo,
      permissoes
    };

    // Se senha foi fornecida, criptografar
    if (senha && senha.trim() !== '') {
      const bcrypt = require('bcrypt');
      dadosAtualizacao.senha = await bcrypt.hash(senha, 10);
    }

    // Substitua pela sua atualização real
    // const usuarioAtualizado = await prisma.usuario.update({
    //   where: { id: parseInt(id) },
    //   data: dadosAtualizacao,
    //   select: {
    //     id: true,
    //     nome: true,
    //     username: true,
    //     email: true,
    //     tipo: true,
    //     permissoes: true
    //   }
    // });

    res.json({
      success: true,
      message: 'Usuário atualizado com sucesso',
      usuario: usuarioAtualizado
    });

  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao atualizar usuário'
    });
  }
});

// DELETE /api/usuarios/:id - Deleta um usuário
router.delete('/usuarios/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Substitua pela sua exclusão real
    // await prisma.usuario.delete({
    //   where: { id: parseInt(id) }
    // });

    // OU desativar ao invés de deletar:
    // await prisma.usuario.update({
    //   where: { id: parseInt(id) },
    //   data: { ativo: false }
    // });

    res.json({
      success: true,
      message: 'Usuário excluído com sucesso'
    });

  } catch (error) {
    console.error('Erro ao excluir usuário:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao excluir usuário'
    });
  }
});

module.exports = router;
