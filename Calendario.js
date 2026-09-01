/**
 * ============================================================
 * CALENDARIO.GS
 * Programação semanal e mensal da merenda.
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
   * NORMALIZAR HORÁRIO
   * ============================================================
   *
   * Remove completamente a parte 1899-12-30T quando existir.
   *
   * Exemplos:
   *
   * 15:55
   * 18:45
   * 1899-12-30T15:55:00
   * 1899-12-30T18:45:00
   *
   * Resultado:
   *
   * 15:55
   * 18:45
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
  
  
    var horario =
      texto.match(
        /(\d{1,2}):(\d{2})(?::\d{2})?/
      );
  
  
    if (!horario) {
      return "";
    }
  
  
    var hora =
      String(
        horario[1]
      ).padStart(
        2,
        "0"
      );
  
  
    var minuto =
      String(
        horario[2]
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
    ].indexOf(
      horario
    ) !== -1;
  }
  
  
  /**
   * ============================================================
   * NORMALIZAR ABRANGÊNCIA
   * ============================================================
   *
   * Somente:
   *
   * SEMANA
   * MES
   * ============================================================
   */
  function normalizarAbrangenciaCalendario(
    valor
  ) {
  
    var abrangencia =
      String(
        valor || ""
      )
      .trim()
      .toUpperCase();
  
  
    if (
      abrangencia === "MÊS"
    ) {
  
      abrangencia =
        "MES";
    }
  
  
    if (
      [
        "SEMANA",
        "MES"
      ].indexOf(
        abrangencia
      ) === -1
    ) {
  
      throw new Error(
        "A programação deve ser SEMANA ou MES."
      );
    }
  
  
    return abrangencia;
  }
  
  
  /**
   * ============================================================
   * CRIAR DATA
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
        "Data inválida."
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
  
  
    data.setHours(
      0,
      0,
      0,
      0
    );
  
  
    return data;
  }
  
  
  /**
   * ============================================================
   * FORMATAR DATA
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
   * OBTER LIMITES DO PERÍODO
   * ============================================================
   *
   * SEMANA:
   * segunda até domingo.
   *
   * MES:
   * primeiro até último dia do mês.
   * ============================================================
   */
  function obterPeriodoCalendario(
    dataInicial,
    abrangencia
  ) {
  
    var inicio =
      new Date(
        dataInicial.getTime()
      );
  
  
    inicio.setHours(
      0,
      0,
      0,
      0
    );
  
  
    var fim;
  
  
    if (
      abrangencia === "SEMANA"
    ) {
  
      var diaSemana =
        inicio.getDay();
  
  
      /*
       * JavaScript:
       *
       * domingo = 0
       * segunda = 1
       * ...
       * sábado = 6
       *
       * Ajustar para segunda-feira.
       */
      var distanciaSegunda =
        diaSemana === 0
          ? 6
          : diaSemana - 1;
  
  
      inicio.setDate(
        inicio.getDate() -
        distanciaSegunda
      );
  
  
      fim =
        new Date(
          inicio.getTime()
        );
  
  
      fim.setDate(
        inicio.getDate() + 6
      );
    }
  
  
    else if (
      abrangencia === "MES"
    ) {
  
      inicio =
        new Date(
          inicio.getFullYear(),
          inicio.getMonth(),
          1
        );
  
  
      fim =
        new Date(
          inicio.getFullYear(),
          inicio.getMonth() + 1,
          0
        );
    }
  
  
    else {
  
      throw new Error(
        "Abrangência inválida."
      );
    }
  
  
    inicio.setHours(
      0,
      0,
      0,
      0
    );
  
  
    fim.setHours(
      0,
      0,
      0,
      0
    );
  
  
    return {
  
      inicio:
        inicio,
  
      fim:
        fim,
  
      dataInicial:
        formatarDataCalendario(
          inicio
        ),
  
      dataFinal:
        formatarDataCalendario(
          fim
        )
    };
  }
  
  
  /**
   * ============================================================
   * GERAR DATAS DO PERÍODO
   * ============================================================
   */
  function gerarDatasCalendario(
    dataInicial,
    abrangencia
  ) {
  
    var periodo =
      obterPeriodoCalendario(
        dataInicial,
        abrangencia
      );
  
  
    var datas = [];
  
  
    var atual =
      new Date(
        periodo.inicio.getTime()
      );
  
  
    while (
      atual.getTime() <=
      periodo.fim.getTime()
    ) {
  
      datas.push(
        formatarDataCalendario(
          atual
        )
      );
  
  
      atual.setDate(
        atual.getDate() + 1
      );
    }
  
  
    return datas;
  }
  
  
  /**
   * ============================================================
   * VERIFICAR SE DATA PERTENCE AO PERÍODO
   * ============================================================
   */
  function dataPertenceAoPeriodo(
    data,
    periodo
  ) {
  
    var dataObjeto =
      criarDataCalendario(
        data
      );
  
  
    var inicio =
      criarDataCalendario(
        periodo.dataInicial
      );
  
  
    var fim =
      criarDataCalendario(
        periodo.dataFinal
      );
  
  
    return (
      dataObjeto.getTime() >=
      inicio.getTime() &&
  
      dataObjeto.getTime() <=
      fim.getTime()
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
        ).trim() ===
        String(
          idRefeicao
        ).trim()
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
   * CADASTRAR PROGRAMAÇÃO SEMANAL/MENSAL
   * ============================================================
   *
   * Recebe:
   *
   * {
   *   token: "...",
   *   abrangencia: "SEMANA" | "MES",
   *   dataReferencia: "yyyy-MM-dd",
   *   registros: [
   *     {
   *       data: "yyyy-MM-dd",
   *       id_refeicao: "...",
   *       periodo: "15:55",
   *       cardapio: "...",
   *       observacao: "..."
   *     }
   *   ]
   * }
   *
   * Permite várias refeições no mesmo dia.
   * ============================================================
   */
  function cadastrarCalendariosPeriodo(
    token,
    dados
  ) {
  
    if (
      token &&
      typeof token === "object" &&
      !Array.isArray(token)
    ) {
  
      dados =
        token;
  
  
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
      !dados ||
      typeof dados !== "object" ||
      Array.isArray(dados)
    ) {
  
      throw new Error(
        "Dados da programação não informados."
      );
    }
  
  
    var abrangencia =
      normalizarAbrangenciaCalendario(
        dados.abrangencia
      );
  
  
    var dataReferencia =
      dados.dataReferencia ||
      dados.data ||
      "";
  
  
    if (
      !String(
        dataReferencia
      ).trim()
    ) {
  
      throw new Error(
        "A data de referência é obrigatória."
      );
    }
  
  
    var dataBase =
      criarDataCalendario(
        dataReferencia
      );
  
  
    var periodoCalendario =
      obterPeriodoCalendario(
        dataBase,
        abrangencia
      );
  
  
    var registros =
      dados.registros;
  
  
    if (
      !Array.isArray(
        registros
      ) ||
      registros.length === 0
    ) {
  
      throw new Error(
        "Adicione pelo menos uma refeição ao período."
      );
    }
  
  
    var produtos =
      getData(
        "PRODUTOS"
      ) || [];
  
  
    var registrosValidados = [];
  
  
    /*
     * ==========================================================
     * VALIDAR TUDO ANTES DE SALVAR
     * ==========================================================
     */
    for (
      var i = 0;
      i < registros.length;
      i++
    ) {
  
      var registro =
        registros[i];
  
  
      if (
        !registro ||
        typeof registro !== "object"
      ) {
  
        throw new Error(
          "Existe uma programação inválida."
        );
      }
  
  
      var data =
        String(
          registro.data || ""
        ).trim();
  
  
      var idRefeicao =
        String(
          registro.id_refeicao ||
          ""
        ).trim();
  
  
      var periodo =
        normalizarPeriodoCalendario(
          registro.periodo
        );
  
  
      var cardapio =
        String(
          registro.cardapio || ""
        ).trim();
  
  
      var observacao =
        String(
          registro.observacao || ""
        ).trim();
  
  
      if (!data) {
  
        throw new Error(
          "Todas as programações precisam ter uma data."
        );
      }
  
  
      criarDataCalendario(
        data
      );
  
  
      if (
        !dataPertenceAoPeriodo(
          data,
          periodoCalendario
        )
      ) {
  
        throw new Error(
          "A data " +
          data +
          " não pertence ao período selecionado."
        );
      }
  
  
      if (!idRefeicao) {
  
        throw new Error(
          "Todas as programações precisam ter uma refeição."
        );
      }
  
  
      if (
        !horarioCalendarioValido(
          periodo
        )
      ) {
  
        throw new Error(
          "Todos os horários devem ser 15:55 ou 18:45."
        );
      }
  
  
      if (!cardapio) {
  
        throw new Error(
          "Todos os registros precisam possuir um cardápio."
        );
      }
  
  
      var refeicaoExiste =
        produtos.some(
          function(produto) {
  
            return (
              produto &&
              String(
                produto.id_produto || ""
              ).trim() ===
              idRefeicao
            );
          }
        );
  
  
      if (!refeicaoExiste) {
  
        throw new Error(
          "Uma das refeições selecionadas não existe."
        );
      }
  
  
      registrosValidados.push({
  
        data:
          data,
  
        id_refeicao:
          idRefeicao,
  
        periodo:
          periodo,
  
        cardapio:
          cardapio,
  
        observacao:
          observacao
      });
    }
  
  
    /*
     * ==========================================================
     * GARANTIR COLUNA CARDAPIO
     * ==========================================================
     */
    var aba =
      getSheet(
        "CALENDARIO"
      );
  
  
    garantirColunaCardapio(
      aba
    );
  
  
    /*
     * ==========================================================
     * SALVAR
     * ==========================================================
     */
    var registrosCriados = [];
  
  
    registrosValidados.forEach(
      function(registro) {
  
        var novoRegistro = {
  
          id_calendario:
            gerarId(
              "CAL"
            ),
  
          data:
            registro.data,
  
          periodo:
            registro.periodo,
  
          id_refeicao:
            registro.id_refeicao,
  
          cardapio:
            registro.cardapio,
  
          observacao:
            registro.observacao
        };
  
  
        insertData(
          "CALENDARIO",
          novoRegistro
        );
  
  
        registrosCriados.push(
          novoRegistro
        );
      }
    );
  
  
    return {
  
      sucesso:
        true,
  
      quantidade:
        registrosCriados.length,
  
      abrangencia:
        abrangencia,
  
      dataInicial:
        periodoCalendario.dataInicial,
  
      dataFinal:
        periodoCalendario.dataFinal,
  
      registrosCriados:
        registrosCriados,
  
      mensagem:
        registrosCriados.length +
        (
          registrosCriados.length === 1
            ? " refeição foi adicionada ao calendário."
            : " refeições foram adicionadas ao calendário."
        )
    };
  }
  
  
  /**
   * ============================================================
   * COMPATIBILIDADE COM FUNÇÃO ANTIGA
   * ============================================================
   *
   * Mantida para evitar quebra de outras chamadas.
   *
   * Agora somente SEMANA/MES são aceitos.
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
        dados;
  
  
      token =
        normalizarToken(
          dados
        );
    }
  
  
    return cadastrarCalendariosPeriodo(
      token,
      {
  
        abrangencia:
          calendario.abrangencia,
  
        dataReferencia:
          calendario.dataReferencia ||
          calendario.data,
  
        registros: [
  
          {
  
            data:
              calendario.data,
  
            id_refeicao:
              calendario.id_refeicao ||
              calendario["id refeicao"],
  
            periodo:
              calendario.periodo,
  
            cardapio:
              calendario.cardapio,
  
            observacao:
              calendario.observacao
          }
        ]
      }
    );
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
      ].indexOf(
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
  
  
    var resultado =
      calendario.map(
        function(item) {
  
          var idRefeicao =
            obterIdRefeicaoCalendario(
              item
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
              buscarNomeRefeicaoCalendario(
                idRefeicao,
                produtos
              ),
  
            cardapio:
              item.cardapio ||
              "",
  
            observacao:
              item.observacao ||
              ""
          };
        }
      );
  
  
    /*
     * Ordenar por data e horário.
     */
    resultado.sort(
      function(a, b) {
  
        var dataA =
          String(
            a.data || ""
          );
  
  
        var dataB =
          String(
            b.data || ""
          );
  
  
        if (
          dataA < dataB
        ) {
  
          return -1;
        }
  
  
        if (
          dataA > dataB
        ) {
  
          return 1;
        }
  
  
        var periodoA =
          String(
            a.periodo || ""
          );
  
  
        var periodoB =
          String(
            b.periodo || ""
          );
  
  
        return (
          periodoA.localeCompare(
            periodoB
          )
        );
      }
    );
  
  
    return resultado;
  }
  
  
  /**
   * ============================================================
   * EXCLUIR UM REGISTRO
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
  
  
    deleteData(
      "CALENDARIO",
      "id_calendario",
      idCalendario
    );
  
  
    return {
  
      sucesso:
        true,
  
      mensagem:
        "Registro do calendário excluído com sucesso."
    };
  }
  
  
  /**
   * ============================================================
   * LIMPAR TODO O CALENDÁRIO
   * ============================================================
   */
  function excluirTodosCalendario(
    token
  ) {
  
    token =
      normalizarToken(token);
  
  
    verificarPermissao(
      token,
      "GESTAO"
    );
  
  
    var aba =
      getSheet(
        "CALENDARIO"
      );
  
  
    var ultimaLinha =
      aba.getLastRow();
  
  
    if (
      ultimaLinha < 2
    ) {
  
      return {
  
        sucesso:
          true,
  
        quantidade:
          0,
  
        mensagem:
          "Não existem registros para limpar."
      };
    }
  
  
    var quantidade =
      ultimaLinha - 1;
  
  
    aba.deleteRows(
      2,
      quantidade
    );
  
  
    return {
  
      sucesso:
        true,
  
      quantidade:
        quantidade,
  
      mensagem:
        quantidade +
        (
          quantidade === 1
            ? " registro foi removido."
            : " registros foram removidos."
        )
    };
  }