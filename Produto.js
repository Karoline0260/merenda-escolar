/**
 * ============================================================
 * PRODUTO.GS
 * ============================================================
 */

function listarProdutos(token) {

    token =
      normalizarToken(token);
  
    verificarPermissao(
      token,
      "GESTAO"
    );
  
    return (
      getData("PRODUTOS") || []
    );
  }
  
  
  function cadastrarProduto(
    token,
    produto
  ) {
  
    if (
      token &&
      typeof token === "object" &&
      !Array.isArray(token)
    ) {
  
      var dados = token;
  
      produto =
        dados.produto ||
        dados.dados ||
        {};
  
      token =
        normalizarToken(dados);
    }
  
    token =
      normalizarToken(token);
  
    verificarPermissao(
      token,
      "GESTAO"
    );
  
    if (
      !produto ||
      typeof produto !== "object" ||
      Array.isArray(produto)
    ) {
  
      throw new Error(
        "Dados do produto não informados."
      );
    }
  
    var nome =
      String(
        produto.nome || ""
      ).trim();
  
    var descricao =
      String(
        produto.descricao || ""
      ).trim();
  
    if (!nome) {
  
      throw new Error(
        "O nome do produto é obrigatório."
      );
    }
  
    var novoProduto = {
  
      id_produto:
        gerarId("PROD"),
  
      nome:
        nome,
  
      descricao:
        descricao,
  
      ativo:
        "SIM",
  
      data_cadastro:
        new Date()
    };
  
    insertData(
      "PRODUTOS",
      novoProduto
    );
  
    return {
  
      sucesso: true,
  
      mensagem:
        "Produto cadastrado com sucesso.",
  
      produto:
        novoProduto
    };
  }
  
  
  function atualizarProduto(
    token,
    idProduto,
    produto
  ) {
  
    if (
      token &&
      typeof token === "object" &&
      !Array.isArray(token)
    ) {
  
      var dados = token;
  
      idProduto =
        dados.idProduto ||
        dados.id_produto;
  
      produto =
        dados.produto ||
        dados.dados ||
        {};
  
      token =
        normalizarToken(dados);
    }
  
    token =
      normalizarToken(token);
  
    verificarPermissao(
      token,
      "GESTAO"
    );
  
    if (!idProduto) {
  
      throw new Error(
        "ID do produto não informado."
      );
    }
  
    if (
      !produto ||
      typeof produto !== "object"
    ) {
  
      throw new Error(
        "Dados do produto não informados."
      );
    }
  
    var nome =
      String(
        produto.nome || ""
      ).trim();
  
    var descricao =
      String(
        produto.descricao || ""
      ).trim();
  
    var ativo =
      produto.ativo === undefined ||
      produto.ativo === null ||
      String(produto.ativo).trim() === ""
        ? "SIM"
        : String(produto.ativo)
            .trim()
            .toUpperCase();
  
    if (!nome) {
  
      throw new Error(
        "O nome do produto é obrigatório."
      );
    }
  
    if (
      ["SIM", "NAO"].indexOf(ativo) === -1
    ) {
  
      throw new Error(
        "O campo ativo deve ser SIM ou NAO."
      );
    }
  
    updateData(
      "PRODUTOS",
      "id_produto",
      idProduto,
      {
  
        nome:
          nome,
  
        descricao:
          descricao,
  
        ativo:
          ativo
      }
    );
  
    return {
  
      sucesso: true,
  
      mensagem:
        "Produto atualizado com sucesso."
    };
  }
  
  
  function excluirProduto(
    token,
    idProduto
  ) {
  
    if (
      token &&
      typeof token === "object" &&
      !Array.isArray(token)
    ) {
  
      var dados = token;
  
      idProduto =
        dados.idProduto ||
        dados.id_produto;
  
      token =
        normalizarToken(dados);
    }
  
    token =
      normalizarToken(token);
  
    verificarPermissao(
      token,
      "GESTAO"
    );
  
    if (!idProduto) {
  
      throw new Error(
        "ID do produto não informado."
      );
    }
  
    var relacionamentos =
      getData("REFEICAO_PRODUTO") || [];
  
    var produtoEmUso =
      relacionamentos.some(
        function(item) {
  
          return (
            item &&
            String(item.id_produto || "") ===
            String(idProduto)
          );
        }
      );
  
    if (produtoEmUso) {
  
      throw new Error(
        "Este produto está vinculado a uma refeição e não pode ser excluído."
      );
    }
  
    deleteData(
      "PRODUTOS",
      "id_produto",
      idProduto
    );
  
    return {
  
      sucesso: true,
  
      mensagem:
        "Produto excluído com sucesso."
    };
  }
  
  
  function buscarProdutoPorId(
    token,
    idProduto
  ) {
  
    if (
      token &&
      typeof token === "object" &&
      !Array.isArray(token)
    ) {
  
      var dados = token;
  
      idProduto =
        dados.idProduto ||
        dados.id_produto;
  
      token =
        normalizarToken(dados);
    }
  
    token =
      normalizarToken(token);
  
    verificarPermissao(
      token,
      "GESTAO"
    );
  
    if (!idProduto) {
  
      throw new Error(
        "ID do produto não informado."
      );
    }
  
    var produtos =
      getData("PRODUTOS") || [];
  
    var produto =
      produtos.find(
        function(item) {
  
          return (
            item &&
            String(
              item.id_produto || ""
            ) === String(idProduto)
          );
        }
      );
  
    if (!produto) {
  
      throw new Error(
        "Produto não encontrado."
      );
    }
  
    return produto;
  }
  
  
  function listarProdutosAtivos(token) {
  
    token =
      normalizarToken(token);
  
    verificarPermissao(
      token,
      "GESTAO"
    );
  
    var produtos =
      getData("PRODUTOS") || [];
  
    return produtos.filter(
      function(produto) {
  
        return (
          produto &&
          String(
            produto.ativo || ""
          )
          .trim()
          .toUpperCase() ===
          "SIM"
        );
      }
    );
  }
  
  
  function testarProdutosBanco() {
  
    return (
      getData("PRODUTOS") || []
    );
  }