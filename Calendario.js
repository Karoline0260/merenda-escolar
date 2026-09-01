/**
 * ============================================================
 * CALENDARIO.GS
 * ============================================================
 */


/**
 * ============================================================
 * OBTER ID DA REFEIÇÃO
 * ============================================================
 */
function obterIdRefeicaoCalendario(
    item
  ) {
  
    if (!item) {
      return "";
    }
  
    return String(
      item.id_refeicao ||
      item["id refeicao"] ||
      ""
    ).trim();
  }
  
  
  /**
   * ============================================================
   * NORMALIZAR PERÍODO / HORÁRIO
   * ============================================================
   *
   * Aceita:
   *
   * 15:55
   * 18:45
   * 1899-12-30T15:55:00
   * objetos Date contendo horário
   *
   * Retorna somente HH:mm.
   * ============================================================
   */
  function normalizarPeriodoCalendario(
    valor
  ) {
  
    if (
      valor === undefined ||
      valor === null
    ) {
  
      return "";
    }
  
  
    /*
     * Caso a planilha tenha armazenado
     * o horário como objeto Date.
     */
    if (
      valor instanceof Date
    ) {
  
      return Utilities.formatDate(
        valor,
        Session.getScriptTimeZone(),
        "HH:mm"
      );
    }
  
  
    var texto =
      String(
        valor
      ).trim();
  
  
    if (!texto) {
      return "";
    }
  
  
    /*
     * Corrige valores como:
     * 1899-12-30T15:55:00
     */
    var dataHora =
      texto.match(
        /(?:^|\s)(\d{1,2}):(\d{2})(?::\d{2})?/
      );
  
  
    if (dataHora) {
  
      var hora =
        String(
          dataHora[1]
        ).padStart(
          2,
          "0"
        );
  
      var minuto =
        String(
          dataHora[2]
        ).padStart(
          2,
          "0"
        );
  
      return (
        hora +
        ":" +
        minuto
      );
    }
  
  
    return texto;
  }
  
  
  /**
   * ============================================================
   * VALIDAR HORÁRIO
   * ============================================================
   */
  function horarioCalendarioValido(
    periodo
  ) {
  
    var horario =
      normalizarPeriodoCalendario(
        periodo
      );
  
  
    return [
      "15:55",
      "18:45"
    ]
    .indexOf(
      horario
    ) !== -1;
  }
  
  
  /**
   * ============================================================
   * NORMALIZAR ABRANGÊNCIA
   * ============================================================
   *
   * DIA
   * SEMANA
   * MES
   * ============================================================
   */
  function normalizarAbrangenciaCalendario(
    valor
  ) {
  
    var abrangencia =
      String(
        valor || "DIA"
      )
      .trim()
      .toUpperCase();
  
  
    if (
      abrangencia === "MÊS"
    ) {
  
      abrangencia = "MES";
    }
  
  
    return abrangencia;
  }
  
  
  /**
   * ============================================================
   * CRIAR DATA
   * ============================================================
   *
   * Recebe:
   * yyyy-MM-dd
   *
   * Retorna Date local do Apps Script.
   * ============================================================
   */
  function criarDataCalendario(
    valor
  ) {
  
    var texto =
      String(
        valor || ""
      ).trim();
  
  
    var partes =
      texto.split("-");
  
  
    if (
      partes.length !== 3
    ) {
  
      throw new Error(
        "Data inválida. Utilize o formato correto."
      );
    }
  
  
    var ano =
      Number(
        partes[0]
      );
  
    var mes =
      Number(
        partes[1]
      );
  
    var dia =
      Number(
        partes[2]
      );
  
  
    if (
      !ano ||
      !mes ||
      !dia
    ) {
  
      throw new Error(
        "Data inválida."
      );
    }
  
  
    var data =
      new Date(
        ano,
        mes - 1,
        dia
      );
  
  
    if (
      data.getFullYear() !== ano ||
      data.getMonth() !== mes - 1 ||
      data.getDate() !== dia
    ) {
  
      throw new Error(
        "A data informada não é válida."
      );
    }
  
  
    return data;
  }
  
  
  /**
   * ============================================================
   * FORMATAR DATA PARA O CALENDÁRIO
   * ============================================================
   */
  function formatarDataCalendario(
    data
  ) {
  
    return (
      String(
        data.getFullYear()
      ) +
  
      "-" +
  
      String(
        data.getMonth() + 1
      ).padStart(
        2,
        "0"
      ) +
  
      "-" +
  
      String(
        data.getDate()
      ).padStart(
        2,
        "0"
      )
    );
  }
  
  
  /**
   * ============================================================
   * GERAR DATAS DO CALENDÁRIO
   * ============================================================
   *
   * DIA:
   * somente a data escolhida.
   *
   * SEMANA:
   * 7 dias a partir da data escolhida.
   *
   * MES:
   * todos os dias do mês escolhido.
   * ============================================================
   */
  function gerarDatasCalendario(
    dataInicial,
    abrangencia
  ) {
  
    var datas = [];
  
  
    var data =
      new Date(
        dataInicial.getTime()
      );
  
  
    if (
      abrangencia === "DIA"
    ) {
  
      datas.push(
        formatarDataCalendario(
          data
        )
      );
  
      return datas;
    }
  
  
    if (
      abrangencia === "SEMANA"
    ) {
  
      for (
        var i = 0;
        i < 7;
        i++
      ) {
  
        var dataSemana =
          new Date(
            data.getTime()
          );
  
  
        dataSemana.setDate(
          data.getDate() + i
        );
  
  
        datas.push(
          formatarDataCalendario(
            dataSemana
          )
        );
      }
  
  
      return datas;
    }
  
  
    if (
      abrangencia === "MES"
    ) {
  
      var primeiroDia =
        new Date(
          data.getFullYear(),
          data.getMonth(),
          1
        );
  
  
      var ultimoDia =
        new Date(
          data.getFullYear(),
          data.getMonth() + 1,
          0
        );
  
  
      for (
        var dia = primeiroDia;
        dia <= ultimoDia;
        dia.setDate(
          dia.getDate() + 1
        )
      ) {
  
        datas.push(
          formatarDataCalendario(
            new Date(
              dia.getTime()
            )
          )
        );
      }
  
  
      return datas;
    }
  
  
    throw new Error(
      "Tipo de cadastro inválido. " +
      "Utilize DIA, SEMANA ou MES."
    );
  }
  
  
  /**
   * ============================================================
   * BUSCAR NOME DA REFEIÇÃO
   * ============================================================
   */
  function buscarNomeRefeicaoCalendario(
    idRefeicao,
    produtos
  ) {
  
    if (!idRefeicao) {
      return "";
    }
  
  
    for (
      var i = 0;
      i < produtos.length;
      i++
    ) {
  
      var produto =
        produtos[i];
  
  
      if (!produto) {
        continue;
      }
  
  
      if (
        String(
          produto.id_produto || ""
        )
        .trim() ===
        String(
          idRefeicao
        )
        .trim()
      ) {
  
        return String(
          produto.nome || ""
        ).trim();
      }
    }
  
  
    return "";
  }
  
  
  /**
   * ============================================================
   * GARANTIR COLUNA CARDAPIO
   * ============================================================
   */
  function garantirColunaCardapio(
    aba
  ) {
  
    var ultimaColuna =
      aba.getLastColumn();
  
  
    if (
      ultimaColuna < 1
    ) {
  
      throw new Error(
        "A aba CALENDARIO não possui cabeçalhos na primeira linha."
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
  
  
    for (
      var i = 0;
      i < cabecalhos.length;
      i++
    ) {
  
      if (
        String(
          cabecalhos[i] || ""
        )
        .trim()
        .toLowerCase() ===
        "cardapio"
      ) {
  
        return;
      }
    }
  
  
    aba
      .getRange(
        1,
        ultimaColuna + 1
      )
      .setValue(
        "cardapio"
      );
  }
  
  
  /**
   * ============================================================
   * CADASTRAR CARDÁPIO NO CALENDÁRIO
   * ============================================================
   */
  function cadastrarCalendario(
    token,
    calendario
  ) {
  
    if (
      token &&
      typeof token === "object" &&
      !Array.isArray(token)
    ) {
  
      var dados =
        token;
  
  
      calendario =
        dados.calendario ||
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
      !calendario ||
      typeof calendario !== "object" ||
      Array.isArray(calendario)
    ) {
  
      throw new Error(
        "Os dados do calendário não foram informados."
      );
    }
  
  
    if (
      !calendario.data ||
      String(
        calendario.data
      ).trim() === ""
    ) {
  
      throw new Error(
        "A data é obrigatória."
      );
    }
  
  
    var idRefeicao =
      calendario.id_refeicao ||
      calendario["id refeicao"] ||
      "";
  
  
    idRefeicao =
      String(
        idRefeicao
      ).trim();
  
  
    var periodo =
      normalizarPeriodoCalendario(
        calendario.periodo
      );
  
  
    var abrangencia =
      normalizarAbrangenciaCalendario(
        calendario.abrangencia
      );
  
  
    var cardapio =
      String(
        calendario.cardapio || ""
      ).trim();
  
  
    var observacao =
      String(
        calendario.observacao || ""
      ).trim();
  
  
    if (!idRefeicao) {
  
      throw new Error(
        "Selecione uma refeição."
      );
    }
  
  
    if (!horarioCalendarioValido(periodo)) {
  
      throw new Error(
        "O horário deve ser 15:55 ou 18:45."
      );
    }
  
  
    if (!cardapio) {
  
      throw new Error(
        "Informe o cardápio."
      );
    }
  
  
    if (
      [
        "DIA",
        "SEMANA",
        "MES"
      ]
      .indexOf(
        abrangencia
      ) === -1
    ) {
  
      throw new Error(
        "A abrangência deve ser DIA, SEMANA ou MES."
      );
    }
  
  
    /*
     * Verificar se a refeição existe.
     */
    var produtos =
      getData(
        "PRODUTOS"
      ) || [];
  
  
    var refeicaoExiste =
      produtos.some(
        function(produto) {
  
          return (
            produto &&
            String(
              produto.id_produto || ""
            )
            .trim() ===
            idRefeicao
          );
        }
      );
  
  
    if (!refeicaoExiste) {
  
      throw new Error(
        "A refeição selecionada não existe."
      );
    }
  
  
    /*
     * Garantir coluna CARDAPIO.
     */
    var aba =
      getSheet(
        "CALENDARIO"
      );
  
  
    garantirColunaCardapio(
      aba
    );
  
  
    /*
     * Gerar datas conforme a abrangência.
     */
    var dataInicial =
      criarDataCalendario(
        calendario.data
      );
  
  
    var datas =
      gerarDatasCalendario(
        dataInicial,
        abrangencia
      );
  
  
    var registrosCriados = [];
  
  
    for (
      var i = 0;
      i < datas.length;
      i++
    ) {
  
      var novoRegistro = {
  
        id_calendario:
          gerarId(
            "CAL"
          ),
  
        data:
          datas[i],
  
        periodo:
          periodo,
  
        id_refeicao:
          idRefeicao,
  
        cardapio:
          cardapio,
  
        observacao:
          observacao
      };
  
  
      insertData(
        "CALENDARIO",
        novoRegistro
      );
  
  
      registrosCriados.push(
        novoRegistro
      );
    }
  
  
    return {
  
      sucesso:
        true,
  
      mensagem:
        (
          abrangencia === "DIA"
            ? "Cardápio adicionado ao calendário com sucesso."
            : "Cardápio cadastrado para " +
              registrosCriados.length +
              " dia(s) com sucesso."
        ),
  
      calendario:
        registrosCriados[0],
  
      registrosCriados:
        registrosCriados,
  
      quantidade:
        registrosCriados.length
    };
  }
  
  
  /**
   * ============================================================
   * LISTAR CALENDÁRIO
   * ============================================================
   */
  function listarCalendario(
    token
  ) {
  
    token =
      normalizarToken(
        token
      );
  
  
    var usuario =
      validarSessao(
        token
      );
  
  
    var perfil =
      String(
        usuario.perfil || ""
      )
      .trim()
      .toUpperCase();
  
  
    if (
      [
        "ALUNO",
        "PROFESSOR",
        "FUNCIONARIO",
        "GESTAO"
      ]
      .indexOf(
        perfil
      ) === -1
    ) {
  
      throw new Error(
        "ACESSO NEGADO. Perfil não autorizado."
      );
    }
  
  
    var calendario =
      getData(
        "CALENDARIO"
      ) || [];
  
  
    var produtos =
      getData(
        "PRODUTOS"
      ) || [];
  
  
    return calendario.map(
      function(item) {
  
        var idRefeicao =
          obterIdRefeicaoCalendario(
            item
          );
  
  
        var nomeRefeicao =
          buscarNomeRefeicaoCalendario(
            idRefeicao,
            produtos
          );
  
  
        return {
  
          id_calendario:
            item.id_calendario ||
            "",
  
          data:
            item.data ||
            "",
  
          periodo:
            normalizarPeriodoCalendario(
              item.periodo
            ),
  
          id_refeicao:
            idRefeicao,
  
          refeicao:
            nomeRefeicao,
  
          cardapio:
            item.cardapio ||
            "",
  
          observacao:
            item.observacao ||
            ""
        };
      }
    );
  }
  
  
  /**
   * ============================================================
   * EXCLUIR CALENDÁRIO
   * ============================================================
   */
  function excluirCalendario(
    token,
    idCalendario
  ) {
  
    if (
      token &&
      typeof token === "object" &&
      !Array.isArray(token)
    ) {
  
      var dados =
        token;
  
  
      idCalendario =
        dados.idCalendario ||
        dados.id_calendario;
  
  
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
  
  
    if (!idCalendario) {
  
      throw new Error(
        "ID do calendário não informado."
      );
    }
  
  
    var calendario =
      getData(
        "CALENDARIO"
      ) || [];
  
  
    var existe =
      calendario.some(
        function(item) {
  
          return (
            item &&
            String(
              item.id_calendario ||
              ""
            ) ===
            String(
              idCalendario
            )
          );
        }
      );
  
  
    if (!existe) {
  
      throw new Error(
        "Registro de calendário não encontrado."
      );
    }
  
  
    deleteData(
      "CALENDARIO",
      "id_calendario",
      idCalendario
    );
  
  
    return {
  
      sucesso:
        true,
  
      mensagem:
        "Registro de calendário excluído com sucesso."
    };
  }