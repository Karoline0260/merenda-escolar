/**
 * ============================================================
 * DATABASE.GS
 * Funções para acesso ao Google Sheets.
 * ============================================================
 */


/**
 * ============================================================
 * RETORNA A PLANILHA
 * ============================================================
 */
function getSpreadsheet() {

    if (
      typeof SPREADSHEET_ID === "undefined" ||
      !SPREADSHEET_ID
    ) {
  
      throw new Error(
        "SPREADSHEET_ID não foi configurado."
      );
    }
  
    try {
  
      return SpreadsheetApp.openById(
        SPREADSHEET_ID
      );
  
    } catch (erro) {
  
      throw new Error(
        "Não foi possível abrir a planilha. " +
        "Verifique o ID da planilha e as permissões do projeto."
      );
    }
  }
  
  
  /**
   * ============================================================
   * NORMALIZAR TEXTO
   * ============================================================
   */
  function normalizarTexto(valor) {
  
    if (
      valor === undefined ||
      valor === null
    ) {
  
      return "";
    }
  
    return String(valor)
      .trim()
      .toUpperCase();
  }
  
  
  /**
   * ============================================================
   * SERIALIZAR VALOR
   *
   * Evita devolver objetos Date diretamente para o HTML.
   * ============================================================
   */
  function serializarValor(valor) {
  
    if (
      valor instanceof Date
    ) {
  
      return Utilities.formatDate(
        valor,
        Session.getScriptTimeZone(),
        "yyyy-MM-dd'T'HH:mm:ss"
      );
    }
  
    if (
      valor === undefined ||
      valor === null
    ) {
  
      return "";
    }
  
    return valor;
  }
  
  
  /**
   * ============================================================
   * RETORNA UMA ABA PELO NOME
   * ============================================================
   */
  function getSheet(nomeAba) {
  
    if (
      nomeAba === undefined ||
      nomeAba === null ||
      String(nomeAba).trim() === ""
    ) {
  
      throw new Error(
        "Nome da aba não informado."
      );
    }
  
    var planilha =
      getSpreadsheet();
  
    var abas =
      planilha.getSheets();
  
    var nomeProcurado =
      normalizarTexto(
        nomeAba
      );
  
  
    for (
      var i = 0;
      i < abas.length;
      i++
    ) {
  
      var nomeAtual =
        normalizarTexto(
          abas[i].getName()
        );
  
      if (
        nomeAtual ===
        nomeProcurado
      ) {
  
        return abas[i];
      }
    }
  
  
    var nomesDisponiveis =
      abas.map(
        function(aba) {
  
          return aba.getName();
        }
      );
  
  
    throw new Error(
      "A aba '" +
      nomeAba +
      "' não foi encontrada. " +
      "Abas disponíveis: " +
      nomesDisponiveis.join(", ")
    );
  }
  
  
  /**
   * ============================================================
   * INSERIR DADOS
   * ============================================================
   */
  function insertData(
    nomeAba,
    objeto
  ) {
  
    if (
      !objeto ||
      typeof objeto !== "object" ||
      Array.isArray(objeto)
    ) {
  
      throw new Error(
        "Objeto de dados não informado."
      );
    }
  
  
    var aba =
      getSheet(nomeAba);
  
  
    var ultimaColuna =
      aba.getLastColumn();
  
  
    if (
      ultimaColuna < 1
    ) {
  
      throw new Error(
        "A aba '" +
        nomeAba +
        "' não possui cabeçalhos na primeira linha."
      );
    }
  
  
    var cabecalhos =
      aba
        .getRange(
          1,
          1,
          1,
          ultimaColuna
        )
        .getValues()[0];
  
  
    var linha = [];
  
  
    for (
      var i = 0;
      i < cabecalhos.length;
      i++
    ) {
  
      var cabecalho =
        String(
          cabecalhos[i] || ""
        ).trim();
  
  
      if (
        cabecalho !== "" &&
        Object.prototype.hasOwnProperty.call(
          objeto,
          cabecalho
        )
      ) {
  
        linha.push(
          objeto[cabecalho]
        );
  
      } else {
  
        linha.push("");
      }
    }
  
  
    aba.appendRow(
      linha
    );
  
  
    return true;
  }
  
  
  /**
   * ============================================================
   * RETORNA TODOS OS DADOS
   * ============================================================
   */
  function getData(nomeAba) {
  
    var aba =
      getSheet(nomeAba);
  
  
    var ultimaLinha =
      aba.getLastRow();
  
  
    var ultimaColuna =
      aba.getLastColumn();
  
  
    if (
      ultimaLinha < 2 ||
      ultimaColuna < 1
    ) {
  
      return [];
    }
  
  
    var dados =
      aba
        .getRange(
          1,
          1,
          ultimaLinha,
          ultimaColuna
        )
        .getValues();
  
  
    var cabecalhos = [];
  
  
    for (
      var i = 0;
      i < ultimaColuna;
      i++
    ) {
  
      cabecalhos.push(
        String(
          dados[0][i] || ""
        ).trim()
      );
    }
  
  
    var resultado = [];
  
  
    for (
      var linhaIndex = 1;
      linhaIndex < dados.length;
      linhaIndex++
    ) {
  
      var linha =
        dados[linhaIndex];
  
  
      var linhaVazia =
        true;
  
  
      for (
        var colunaIndex = 0;
        colunaIndex < linha.length;
        colunaIndex++
      ) {
  
        var valor =
          linha[colunaIndex];
  
  
        if (
          valor instanceof Date
        ) {
  
          linhaVazia = false;
  
          break;
        }
  
  
        if (
          String(
            valor || ""
          ).trim() !== ""
        ) {
  
          linhaVazia = false;
  
          break;
        }
      }
  
  
      if (
        linhaVazia
      ) {
  
        continue;
      }
  
  
      var objeto = {};
  
  
      for (
        var coluna = 0;
        coluna < cabecalhos.length;
        coluna++
      ) {
  
        if (
          cabecalhos[coluna] === ""
        ) {
  
          continue;
        }
  
  
        objeto[
          cabecalhos[coluna]
        ] =
          serializarValor(
            linha[coluna]
          );
      }
  
  
      resultado.push(
        objeto
      );
    }
  
  
    return resultado;
  }
  
  
  /**
   * ============================================================
   * ATUALIZAR REGISTRO
   * ============================================================
   */
  function updateData(
    nomeAba,
    idCampo,
    idValor,
    novosDados
  ) {
  
    if (
      !idCampo ||
      String(idCampo).trim() === ""
    ) {
  
      throw new Error(
        "Campo de identificação não informado."
      );
    }
  
  
    if (
      idValor === undefined ||
      idValor === null ||
      String(idValor).trim() === ""
    ) {
  
      throw new Error(
        "Valor de identificação não informado."
      );
    }
  
  
    if (
      !novosDados ||
      typeof novosDados !== "object" ||
      Array.isArray(novosDados)
    ) {
  
      throw new Error(
        "Novos dados não informados."
      );
    }
  
  
    var aba =
      getSheet(nomeAba);
  
  
    var dados =
      aba
        .getDataRange()
        .getValues();
  
  
    if (
      dados.length < 2
    ) {
  
      throw new Error(
        "Não existem registros para atualizar."
      );
    }
  
  
    var cabecalhos =
      dados[0];
  
  
    var indiceId = -1;
  
  
    for (
      var i = 0;
      i < cabecalhos.length;
      i++
    ) {
  
      if (
        normalizarTexto(
          cabecalhos[i]
        ) ===
        normalizarTexto(
          idCampo
        )
      ) {
  
        indiceId =
          i;
  
        break;
      }
    }
  
  
    if (
      indiceId === -1
    ) {
  
      throw new Error(
        "Campo '" +
        idCampo +
        "' não encontrado."
      );
    }
  
  
    for (
      var linha = 1;
      linha < dados.length;
      linha++
    ) {
  
      if (
        String(
          dados[linha][indiceId]
        ).trim() ===
        String(idValor).trim()
      ) {
  
  
        for (
          var coluna = 0;
          coluna < cabecalhos.length;
          coluna++
        ) {
  
          var campo =
            String(
              cabecalhos[coluna]
            ).trim();
  
  
          if (
            Object.prototype.hasOwnProperty.call(
              novosDados,
              campo
            )
          ) {
  
            aba
              .getRange(
                linha + 1,
                coluna + 1
              )
              .setValue(
                novosDados[campo]
              );
          }
        }
  
  
        return true;
      }
    }
  
  
    throw new Error(
      "Registro não encontrado."
    );
  }
  
  
  /**
   * ============================================================
   * EXCLUIR REGISTRO
   * ============================================================
   */
  function deleteData(
    nomeAba,
    idCampo,
    idValor
  ) {
  
    if (
      !idCampo ||
      String(idCampo).trim() === ""
    ) {
  
      throw new Error(
        "Campo de identificação não informado."
      );
    }
  
  
    if (
      idValor === undefined ||
      idValor === null ||
      String(idValor).trim() === ""
    ) {
  
      throw new Error(
        "Valor de identificação não informado."
      );
    }
  
  
    var aba =
      getSheet(nomeAba);
  
  
    var dados =
      aba
        .getDataRange()
        .getValues();
  
  
    if (
      dados.length < 2
    ) {
  
      throw new Error(
        "Não existem registros."
      );
    }
  
  
    var cabecalhos =
      dados[0];
  
  
    var indiceId = -1;
  
  
    for (
      var i = 0;
      i < cabecalhos.length;
      i++
    ) {
  
      if (
        normalizarTexto(
          cabecalhos[i]
        ) ===
        normalizarTexto(
          idCampo
        )
      ) {
  
        indiceId =
          i;
  
        break;
      }
    }
  
  
    if (
      indiceId === -1
    ) {
  
      throw new Error(
        "Campo '" +
        idCampo +
        "' não encontrado."
      );
    }
  
  
    for (
      var linha = 1;
      linha < dados.length;
      linha++
    ) {
  
      if (
        String(
          dados[linha][indiceId]
        ).trim() ===
        String(idValor).trim()
      ) {
  
        aba.deleteRow(
          linha + 1
        );
  
        return true;
      }
    }
  
  
    throw new Error(
      "Registro não encontrado."
    );
  }
  
  
  /**
   * ============================================================
   * GERAR ID
   * ============================================================
   */
  function gerarId(prefixo) {
  
    prefixo =
      prefixo || "ID";
  
  
    return (
      String(prefixo).trim() +
      "_" +
      Utilities.getUuid()
    );
  }