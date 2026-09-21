 /**
  * ============================================================
  * PRODUTO.GS
  * Comidas / Produtos utilizados nas refeições.
  * ============================================================
  */


/**
 * ============================================================
 * LISTAR COMIDAS
 * ============================================================
 */
function listarComidas(
    token
  ) {
  
    token =
      normalizarToken(
        token
      );
  
  
    verificarPermissao(
      token,
      "GESTAO"
    );
  
  
    return (
      getData(
        "PRODUTOS"
      ) || []
    );
  }
  
  
  /**
   * ============================================================
   * LISTAR COMIDAS ATIVAS
   * ============================================================
   */
  function listarComidasAtivas(
    token
  ) {
  
    token =
      normalizarToken(
        token
      );
  
  
    verificarPermissao(
      token,
      "GESTAO"
    );
  
  
    var produtos =
      getData(
        "PRODUTOS"
      ) || [];
  
  
    return produtos.filter(
      function(produto) {
  
        return (
          produto &&
          String(
            produto.ativo ||
            "SIM"
          )
          .trim()
          .toUpperCase() ===
          "SIM"
        );
      }
    );
  }
  
  
  /**
   * ============================================================
   * CADASTRAR COMIDA
   * ============================================================
   *
   * A interface chama "cadastrarComida".
   *
   * O banco continua utilizando a aba PRODUTOS.
   * ============================================================
   */
  function cadastrarComida(
    token,
    comida
  ) {
  
    /*
     * Permite também chamada no formato:
     *
     * cadastrarComida({
     *   token: "...",
     *   comida: {...}
     * })
     */
    if (
      token &&
      typeof token === "object" &&
      !Array.isArray(token)
    ) {
  
      var dados =
        token;
  
  
      comida =
        dados.comida ||
        dados.produto ||
        dados.dados ||
        {};
  
  
      token =
        normalizarToken(
          dados
        );
    }
  
  
    token =
      normalizarToken(
        token
      );
  
  
    verificarPermissao(
      token,
      "GESTAO"
    );
  
  
    if (
      !comida ||
      typeof comida !== "object" ||
      Array.isArray(comida)
    ) {
  
      throw new Error(
        "Dados da comida não informados."
      );
    }
  
  
    var nome =
      String(
        comida.nome ||
        ""
      ).trim();
  
  
    var descricao =
      String(
        comida.descricao ||
        ""
      ).trim();
  
  
    if (!nome) {
  
      throw new Error(
        "O nome da comida é obrigatório."
      );
    }
  
  
    /*
     * Evita cadastrar a mesma comida duas vezes.
     */
    var produtos =
      getData(
        "PRODUTOS"
      ) || [];
  
  
    var nomeNormalizado =
      nome
        .trim()
        .toUpperCase();
  
  
    var existente =
      produtos.some(
        function(produto) {
  
          if (!produto) {
            return false;
          }
  
  
          return (
            String(
              produto.nome ||
              ""
            )
            .trim()
            .toUpperCase() ===
            nomeNormalizado
          );
        }
      );
  
  
    if (existente) {
  
      throw new Error(
        "Já existe uma comida cadastrada com este nome."
      );
    }
  
  
    var novaComida = {
  
      id_produto:
        gerarId(
          "PROD"
        ),
  
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
      novaComida
    );
  
  
    return {
  
      sucesso:
        true,
  
      mensagem:
        "Comida cadastrada com sucesso.",
  
      comida:
        novaComida,
  
      produto:
        novaComida
    };
  }
  
  
  /**
   * ============================================================
   * ATUALIZAR COMIDA
   * ============================================================
   */
  function atualizarComida(
    token,
    idComida,
    comida
  ) {
  
    if (
      token &&
      typeof token === "object" &&
      !Array.isArray(token)
    ) {
  
      var dados =
        token;
  
  
      idComida =
        dados.idComida ||
        dados.id_comida ||
        dados.idProduto ||
        dados.id_produto;
  
  
      comida =
        dados.comida ||
        dados.produto ||
        dados.dados ||
        {};
  
  
      token =
        normalizarToken(
          dados
        );
    }
  
  
    token =
      normalizarToken(
        token
      );
  
  
    verificarPermissao(
      token,
      "GESTAO"
    );
  
  
    if (!idComida) {
  
      throw new Error(
        "ID da comida não informado."
      );
    }
  
  
    if (
      !comida ||
      typeof comida !== "object" ||
      Array.isArray(comida)
    ) {
  
      throw new Error(
        "Dados da comida não informados."
      );
    }
  
  
    var nome =
      String(
        comida.nome ||
        ""
      ).trim();
  
  
    var descricao =
      String(
        comida.descricao ||
        ""
      ).trim();
  
  
    var ativo =
      comida.ativo === undefined ||
      comida.ativo === null ||
      String(
        comida.ativo
      ).trim() === ""
  
        ? "SIM"
  
        : String(
            comida.ativo
          )
          .trim()
          .toUpperCase();
  
  
    if (!nome) {
  
      throw new Error(
        "O nome da comida é obrigatório."
      );
    }
  
  
    if (
      [
        "SIM",
        "NAO"
      ]
      .indexOf(
        ativo
      ) === -1
    ) {
  
      throw new Error(
        "O campo ativo deve ser SIM ou NAO."
      );
    }
  
  
    updateData(
      "PRODUTOS",
      "id_produto",
      idComida,
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
  
      sucesso:
        true,
  
      mensagem:
        "Comida atualizada com sucesso."
    };
  }
  
  
  /**
   * ============================================================
   * EXCLUIR COMIDA
   * ============================================================
   */
  function excluirComida(
    token,
    idComida
  ) {
  
    if (
      token &&
      typeof token === "object" &&
      !Array.isArray(token)
    ) {
  
      var dados =
        token;
  
  
      idComida =
        dados.idComida ||
        dados.id_comida ||
        dados.idProduto ||
        dados.id_produto;
  
  
      token =
        normalizarToken(
          dados
        );
    }
  
  
    token =
      normalizarToken(
        token
      );
  
  
    verificarPermissao(
      token,
      "GESTAO"
    );
  
  
    if (!idComida) {
  
      throw new Error(
        "ID da comida não informado."
      );
    }
  
  
    var relacionamentos =
      getData(
        "REFEICAO_PRODUTO"
      ) || [];
  
  
    var produtoEmUso =
      relacionamentos.some(
        function(item) {
  
          return (
            item &&
            String(
              item.id_produto ||
              ""
            ).trim() ===
            String(
              idComida
            ).trim()
          );
        }
      );
  
  
    if (produtoEmUso) {
  
      throw new Error(
        "Esta comida está vinculada a uma refeição e não pode ser excluída."
      );
    }
  
  
    deleteData(
      "PRODUTOS",
      "id_produto",
      idComida
    );
  
  
    return {
  
      sucesso:
        true,
  
      mensagem:
        "Comida excluída com sucesso."
    };
  }
  
  
  /**
   * ============================================================
   * BUSCAR COMIDA POR ID
   * ============================================================
   */
  function buscarComidaPorId(
    token,
    idComida
  ) {
  
    if (
      token &&
      typeof token === "object" &&
      !Array.isArray(token)
    ) {
  
      var dados =
        token;
  
  
      idComida =
        dados.idComida ||
        dados.id_comida ||
        dados.idProduto ||
        dados.id_produto;
  
  
      token =
        normalizarToken(
          dados
        );
    }
  
  
    token =
      normalizarToken(
        token
      );
  
  
    verificarPermissao(
      token,
      "GESTAO"
    );
  
  
    if (!idComida) {
  
      throw new Error(
        "ID da comida não informado."
      );
    }
  
  
    var produtos =
      getData(
        "PRODUTOS"
      ) || [];
  
  
    var comida =
      produtos.find(
        function(item) {
  
          return (
            item &&
            String(
              item.id_produto ||
              ""
            ).trim() ===
            String(
              idComida
            ).trim()
          );
        }
      );
  
  
    if (!comida) {
  
      throw new Error(
        "Comida não encontrada."
      );
    }
  
  
    return comida;
  }
  
  
  /**
   * ============================================================
   * FUNÇÕES ANTIGAS / COMPATIBILIDADE
   * ============================================================
   */
  
  function listarProdutos(
    token
  ) {
  
    return listarComidas(
      token
    );
  }
  
  
  function listarProdutosAtivos(
    token
  ) {
  
    return listarComidasAtivas(
      token
    );
  }
  
  
  function cadastrarProduto(
    token,
    produto
  ) {
  
    /*
     * Reaproveita a função nova.
     */
    var resultado =
      cadastrarComida(
        token,
        produto
      );
  
  
    return {
  
      sucesso:
        resultado.sucesso,
  
      mensagem:
        "Produto cadastrado com sucesso.",
  
      produto:
        resultado.produto
    };
  }