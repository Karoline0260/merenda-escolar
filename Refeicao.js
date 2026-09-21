/**
 * ============================================================
 * REFEICAO.GS
 * ============================================================
 */

function obterIdRefeicao(item) {

    if (!item) {
      return "";
    }
  
    return String(
      item.id_refeicao ||
      item["id refeicao"] ||
      ""
    ).trim();
  }
  
  
  function listarRefeicoes(token) {
  
    token =
      normalizarToken(token);
  
    verificarPermissao(
      token,
      "GESTAO"
    );
  
    return (
      getData("REFEICOES") || []
    );
  }
  
  
  function buscarRefeicaoPorId(
    token,
    idRefeicao
  ) {
  
    if (
      token &&
      typeof token === "object" &&
      !Array.isArray(token)
    ) {
  
      var dados = token;
  
      idRefeicao =
        dados.idRefeicao ||
        dados.id_refeicao;
  
      token =
        normalizarToken(dados);
    }
  
    token =
      normalizarToken(token);
  
    verificarPermissao(
      token,
      "GESTAO"
    );
  
    if (!idRefeicao) {
  
      throw new Error(
        "ID da refeição não informado."
      );
    }
  
    var refeicoes =
      getData("REFEICOES") || [];
  
    for (
      var i = 0;
      i < refeicoes.length;
      i++
    ) {
  
      if (
        String(
          obterIdRefeicao(
            refeicoes[i]
          )
        ) ===
        String(idRefeicao)
      ) {
  
        return refeicoes[i];
      }
    }
  
    throw new Error(
      "Refeição não encontrada."
    );
  }
  
  
  function listarProdutosDaRefeicao(
    token,
    idRefeicao
  ) {
  
    if (
      token &&
      typeof token === "object" &&
      !Array.isArray(token)
    ) {
  
      var dados = token;
  
      idRefeicao =
        dados.idRefeicao ||
        dados.id_refeicao;
  
      token =
        normalizarToken(dados);
    }
  
    token =
      normalizarToken(token);
  
    verificarPermissao(
      token,
      "GESTAO"
    );
  
    if (!idRefeicao) {
  
      throw new Error(
        "ID da refeição não informado."
      );
    }
  
    var produtos =
      getData("PRODUTOS") || [];
  
    var relacionamentos =
      getData("REFEICAO_PRODUTO") || [];
  
    var idsProdutos =
      relacionamentos
        .filter(
          function(item) {
  
            return (
              item &&
              String(
                item.id_refeicao ||
                item["id refeicao"] ||
                ""
              ) ===
              String(idRefeicao)
            );
          }
        )
        .map(
          function(item) {
  
            return String(
              item.id_produto || ""
            );
          }
        );
  
    return produtos.filter(
      function(produto) {
  
        return (
          produto &&
          idsProdutos.indexOf(
            String(
              produto.id_produto || ""
            )
          ) !== -1
        );
      }
    );
  }
  
  
  function excluirRefeicao(
    token,
    idRefeicao
  ) {
  
    if (
      token &&
      typeof token === "object" &&
      !Array.isArray(token)
    ) {
  
      var dados = token;
  
      idRefeicao =
        dados.idRefeicao ||
        dados.id_refeicao;
  
      token =
        normalizarToken(dados);
    }
  
    token =
      normalizarToken(token);
  
    verificarPermissao(
      token,
      "GESTAO"
    );
  
    if (!idRefeicao) {
  
      throw new Error(
        "ID da refeição não informado."
      );
    }
  
    var calendario =
      getData("CALENDARIO") || [];
  
    var refeicaoEmUso =
      calendario.some(
        function(item) {
  
          return (
            item &&
            String(
              item.id_refeicao ||
              item["id refeicao"] ||
              ""
            ) ===
            String(idRefeicao)
          );
        }
      );
  
    if (refeicaoEmUso) {
  
      throw new Error(
        "Esta refeição está sendo utilizada no calendário."
      );
    }
  
    var relacionamentos =
      getData("REFEICAO_PRODUTO") || [];
  
    relacionamentos
      .filter(
        function(item) {
  
          return (
            item &&
            String(
              item.id_refeicao ||
              item["id refeicao"] ||
              ""
            ) ===
            String(idRefeicao)
          );
        }
      )
      .forEach(
        function(item) {
  
          var idRelacionamento =
            item.id_refeicao_produto ||
            item.id_produto_refeicao;
  
          if (idRelacionamento) {
  
            deleteData(
              "REFEICAO_PRODUTO",
              item.id_refeicao_produto
                ? "id_refeicao_produto"
                : "id_produto_refeicao",
              idRelacionamento
            );
          }
        }
      );
  
    deleteData(
      "REFEICOES",
      "id_refeicao",
      idRefeicao
    );
  
    return {
  
      sucesso: true,
  
      mensagem:
        "Refeição excluída com sucesso."
    };
  }