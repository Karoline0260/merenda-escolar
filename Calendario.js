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
   * NORMALIZAR HORÁRIO
   * ============================================================
   *
   * Sempre retorna HH:mm.
   *
   * Aceita:
   *
   * 15:55
   * 18:45
   * 1899-12-30T15:55:00
   * objetos Date
   * ============================================================
   */
  function normalizarHorarioRefeicao(
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
  
  
    var match =
      texto.match(
        /(?:^|\s)(\d{1,2}):(\d{2})(?::\d{2})?/
      );
  
  
    if (!match) {
      return "";
    }
  
  
    var hora =
      Number(
        match[1]
      );
  
  
    var minuto =
      Number(
        match[2]
      );
  
  
    if (
      hora < 0 ||
      hora > 23 ||
      minuto < 0 ||
      minuto > 59
    ) {
  
      return "";
    }
  
  
    return (
      String(
        hora
      ).padStart(
        2,
        "0"
      ) +
      ":" +
      String(
        minuto
      ).padStart(
        2,
        "0"
      )
    );
  }
  
  
  /**
   * ============================================================
   * CONFIGURAÇÃO DOS DOIS HORÁRIOS
   * ============================================================
   *
   * A configuração fica salva nas propriedades do projeto.
   *
   * Valores iniciais:
   *
   * 1ª refeição = 15:55
   * 2ª refeição = 18:45
   * ============================================================
   */
  function obterConfiguracaoHorariosRefeicoes() {
  
    var propriedades =
      PropertiesService
        .getScriptProperties();
  
  
    var horario1 =
      normalizarHorarioRefeicao(
        propriedades.getProperty(
          "HORARIO_REFEICAO_1"
        )
      ) ||
      "15:55";
  
  
    var horario2 =
      normalizarHorarioRefeicao(
        propriedades.getProperty(
          "HORARIO_REFEICAO_2"
        )
      ) ||
      "18:45";
  
  
    return {
  
      horario1:
        horario1,
  
      horario2:
        horario2,
  
      horarios: [
        horario1,
        horario2
      ]
    };
  }
  
  
  /**
   * ============================================================
   * SALVAR CONFIGURAÇÃO DOS HORÁRIOS
   * ============================================================
   */
  function salvarConfiguracaoHorariosRefeicoes(
    token,
    horario1,
    horario2
  ) {
  
    if (
      token &&
      typeof token === "object" &&
      !Array.isArray(token)
    ) {
  
      var dados =
        token;
  
  
      horario1 =
        dados.horario1 ||
        dados.horarioRefeicao1;
  
  
      horario2 =
        dados.horario2 ||
        dados.horarioRefeicao2;
  
  
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
  
  
    horario1 =
      normalizarHorarioRefeicao(
        horario1
      );
  
  
    horario2 =
      normalizarHorarioRefeicao(
        horario2
      );
  
  
    if (
      !horario1 ||
      !horario2
    ) {
  
      throw new Error(
        "Informe os dois horários das refeições."
      );
    }
  
  
    if (
      horario1 ===
      horario2
    ) {
  
      throw new Error(
        "Os horários das duas refeições devem ser diferentes."
      );
    }
  
  
    var configuracaoAnterior =
      obterConfiguracaoHorariosRefeicoes();
  
  
    /*
     * Atualiza registros já cadastrados no calendário.
     */
    atualizarHorariosCalendarioExistentes(
      configuracaoAnterior.horario1,
      horario1,
      configuracaoAnterior.horario2,
      horario2
    );
  
  
    PropertiesService
      .getScriptProperties()
      .setProperties(
        {
          HORARIO_REFEICAO_1:
            horario1,
  
          HORARIO_REFEICAO_2:
            horario2
        },
        true
      );
  
  
    return {
  
      sucesso:
        true,
  
      mensagem:
        "Horários das duas refeições atualizados com sucesso.",
  
      configuracao:
        obterConfiguracaoHorariosRefeicoes()
    };
  }
  
  
  /**
   * ============================================================
   * ATUALIZAR HORÁRIOS JÁ EXISTENTES
   * ============================================================
   */
  function atualizarHorariosCalendarioExistentes(
    horarioAntigo1,
    horarioNovo1,
    horarioAntigo2,
    horarioNovo2
  ) {
  
    var calendario =
      getData(
        "CALENDARIO"
      ) || [];
  
  
    calendario.forEach(
      function(item) {
  
        if (
          !item ||
          !item.id_calendario
        ) {
  
          return;
        }
  
  
        var horarioAtual =
          normalizarHorarioRefeicao(
            item.horario ||
            item.periodo
          );
  
  
        var novoHorario =
          "";
  
  
        if (
          horarioAtual ===
          horarioAntigo1
        ) {
  
          novoHorario =
            horarioNovo1;
  
        } else if (
          horarioAtual ===
          horarioAntigo2
        ) {
  
          novoHorario =
            horarioNovo2;
        }
  
  
        if (
          novoHorario &&
          novoHorario !==
          horarioAtual
        ) {
  
          /*
           * Atualiza tanto a coluna horario quanto a coluna
           * periodo caso elas existam.
           */
          try {
  
            updateData(
              "CALENDARIO",
              "id_calendario",
              item.id_calendario,
              {
                horario:
                  novoHorario,
  
                periodo:
                  novoHorario
              }
            );
  
          } catch (erro) {
  
            /*
             * Algumas instalações antigas podem ter somente
             * a coluna periodo.
             */
            updateData(
              "CALENDARIO",
              "id_calendario",
              item.id_calendario,
              {
                periodo:
                  novoHorario
              }
            );
          }
        }
      }
    );
  }
  
  
  /**
   * ============================================================
   * LISTAR CONFIGURAÇÃO
   * ============================================================
   */
  function listarConfiguracaoHorariosRefeicoes(
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
  
  
    return obterConfiguracaoHorariosRefeicoes();
  }
  
  
  /**
   * ============================================================
   * COMPATIBILIDADE
   * ============================================================
   */
  function normalizarPeriodoCalendario(
    valor
  ) {
  
    return normalizarHorarioRefeicao(
      valor
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
      normalizarHorarioRefeicao(
        periodo
      );
  
  
    var configuracao =
      obterConfiguracaoHorariosRefeicoes();
  
  
    return (
      configuracao.horarios.indexOf(
        horario
      ) !== -1
    );
  }
  
  
  /**
   * ============================================================
   * NORMALIZAR ABRANGÊNCIA
   * ============================================================
   */
  function normalizarAbrangenciaCalendario(
    valor
  ) {
  
    var abrangencia =
      String(
        valor ||
        "DIA"
      )
      .trim()
      .toUpperCase();
  
  
    if (
      abrangencia ===
      "MÊS"
    ) {
  
      abrangencia =
        "MES";
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
        valor ||
        ""
      ).trim();
  
  
    var partes =
      texto.split(
        "-"
      );
  
  
    if (
      partes.length !==
      3
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
      data.getFullYear() !==
      ano ||
      data.getMonth() !==
      mes - 1 ||
      data.getDate() !==
      dia
    ) {
  
      throw new Error(
        "A data informada não é válida."
      );
    }
  
  
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
   * GERAR DATAS
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
      abrangencia ===
      "DIA"
    ) {
  
      datas.push(
        formatarDataCalendario(
          data
        )
      );
  
  
      return datas;
    }
  
  
    if (
      abrangencia ===
      "SEMANA"
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
          data.getDate() +
          i
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
      abrangencia ===
      "MES"
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
      "Tipo de cadastro inválido. Utilize DIA, SEMANA ou MES."
    );
  }
  
  
  /**
   * ============================================================
   * BUSCAR NOME DA REFEIÇÃO
   * ============================================================
   */
  function buscarNomeRefeicaoCalendario(
    idRefeicao,
    refeicoes
  ) {
  
    if (
      !idRefeicao
    ) {
  
      return "";
    }
  
  
    for (
      var i = 0;
      i < refeicoes.length;
      i++
    ) {
  
      var refeicao =
        refeicoes[i];
  
  
      if (!refeicao) {
        continue;
      }
  
  
      if (
        String(
          refeicao.id_refeicao ||
          ""
        )
        .trim() ===
        String(
          idRefeicao
        )
        .trim()
      ) {
  
        return String(
          refeicao.nome ||
          ""
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
      ultimaColuna <
      1
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
          cabecalhos[i] ||
          ""
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
   * CADASTRAR NO CALENDÁRIO
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
      typeof calendario !==
      "object" ||
      Array.isArray(calendario)
    ) {
  
      throw new Error(
        "Os dados do calendário não foram informados."
      );
    }
  
  
    var data =
      String(
        calendario.data ||
        ""
      ).trim();
  
  
    if (!data) {
  
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
  
  
    /*
     * O horário vem do formulário, mas somente poderá ser
     * um dos dois horários configurados pela Gestão.
     */
    var periodo =
      normalizarHorarioRefeicao(
        calendario.horario ||
        calendario.periodo
      );
  
  
    var configuracao =
      obterConfiguracaoHorariosRefeicoes();
  
  
    if (
      configuracao.horarios.indexOf(
        periodo
      ) === -1
    ) {
  
      throw new Error(
        "Selecione um dos dois horários configurados pela Gestão."
      );
    }
  
  
    var abrangencia =
      normalizarAbrangenciaCalendario(
        calendario.abrangencia
      );
  
  
    var cardapio =
      String(
        calendario.cardapio ||
        ""
      ).trim();
  
  
    var observacao =
      String(
        calendario.observacao ||
        ""
      ).trim();
  
  
    /*
     * O cadastro atual permite o cardápio como campo opcional
     * para manter compatibilidade com instalações existentes.
     */
    if (!idRefeicao) {
  
      throw new Error(
        "Selecione uma refeição."
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
  
  
    var refeicoes =
      getData(
        "REFEICOES"
      ) || [];
  
  
    var refeicaoExiste =
      refeicoes.some(
        function(item) {
  
          return (
            item &&
            String(
              item.id_refeicao ||
              ""
            ).trim() ===
            idRefeicao
          );
        }
      );
  
  
    if (
      !refeicaoExiste
    ) {
  
      throw new Error(
        "A refeição selecionada não foi encontrada."
      );
    }
  
  
    /*
     * O intervalo de datas.
     */
    var dataInicial =
      criarDataCalendario(
        data
      );
  
  
    var datas =
      gerarDatasCalendario(
        dataInicial,
        abrangencia
      );
  
  
    var registrosCriados =
      [];
  
  
    /*
     * Verificar duplicidade por data + horário.
     */
    var calendarioExistente =
      getData(
        "CALENDARIO"
      ) || [];
  
  
    for (
      var i = 0;
      i < datas.length;
      i++
    ) {
  
      var dataAtual =
        datas[i];
  
  
      var duplicado =
        calendarioExistente.some(
          function(item) {
  
            if (!item) {
              return false;
            }
  
  
            var dataItem =
              String(
                item.data ||
                ""
              ).trim();
  
  
            var horarioItem =
              normalizarHorarioRefeicao(
                item.horario ||
                item.periodo
              );
  
  
            return (
              dataItem ===
              dataAtual &&
  
              horarioItem ===
              periodo
            );
          }
        );
  
  
      if (
        duplicado
      ) {
  
        throw new Error(
          "Já existe uma refeição cadastrada para " +
          dataAtual +
          " às " +
          periodo +
          "."
        );
      }
    }
  
  
    var aba =
      getSheet(
        "CALENDARIO"
      );
  
  
    garantirColunaCardapio(
      aba
    );
  
  
    for (
      var j = 0;
      j < datas.length;
      j++
    ) {
  
      var novoRegistro = {
  
        id_calendario:
          gerarId(
            "CAL"
          ),
  
        data:
          datas[j],
  
        periodo:
          periodo,
  
        horario:
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
          abrangencia ===
          "DIA"
  
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
   * DIA DA SEMANA
   * ============================================================
   */
  function obterDiaSemanaCalendario(
    dataTexto
  ) {
  
    var texto =
      String(
        dataTexto ||
        ""
      ).trim();
  
  
    var partes =
      texto.split(
        "-"
      );
  
  
    if (
      partes.length !==
      3
    ) {
  
      return "";
    }
  
  
    var data =
      new Date(
        Number(
          partes[0]
        ),
        Number(
          partes[1]
        ) - 1,
        Number(
          partes[2]
        )
      );
  
  
    var dias = [
  
      "Domingo",
  
      "Segunda-feira",
  
      "Terça-feira",
  
      "Quarta-feira",
  
      "Quinta-feira",
  
      "Sexta-feira",
  
      "Sábado"
  
    ];
  
  
    return (
      dias[
        data.getDay()
      ] ||
      ""
    );
  }
  
  
  /**
   * ============================================================
   * LISTAR CALENDÁRIO
   * ============================================================
   */
  function listarCalendario(
    token,
    filtro
  ) {
  
    token =
      normalizarToken(
        token
      );
  
  
    verificarPermissao(
      token,
      "GESTAO"
    );
  
  
    var calendario =
      getData(
        "CALENDARIO"
      ) || [];
  
  
    var refeicoes =
      getData(
        "REFEICOES"
      ) || [];
  
  
    var resultado =
      calendario.map(
        function(item) {
  
          var idRefeicao =
            obterIdRefeicaoCalendario(
              item
            );
  
  
          var nomeRefeicao =
            buscarNomeRefeicaoCalendario(
              idRefeicao,
              refeicoes
            );
  
  
          var horario =
            normalizarHorarioRefeicao(
              item.horario ||
              item.periodo
            );
  
  
          return {
  
            id_calendario:
              item.id_calendario ||
              "",
  
            data:
              item.data ||
              "",
  
            dia_semana:
              obterDiaSemanaCalendario(
                item.data
              ),
  
            horario:
              horario,
  
            periodo:
              horario,
  
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
  
  
    resultado.sort(
      function(a, b) {
  
        var dataA =
          String(
            a.data ||
            ""
          ) +
          " " +
          String(
            a.horario ||
            ""
          );
  
  
        var dataB =
          String(
            b.data ||
            ""
          ) +
          " " +
          String(
            b.horario ||
            ""
          );
  
  
        return (
          dataA.localeCompare(
            dataB
          )
        );
      }
    );
  
  
    /*
     * Filtro da semana.
     */
    if (
      filtro &&
      typeof filtro ===
      "object" &&
      filtro.semana
    ) {
  
      var hoje =
        new Date();
  
  
      hoje.setHours(
        0,
        0,
        0,
        0
      );
  
  
      var inicioSemana =
        new Date(
          hoje.getTime()
        );
  
  
      inicioSemana.setDate(
        hoje.getDate() -
        hoje.getDay()
      );
  
  
      var fimSemana =
        new Date(
          inicioSemana.getTime()
        );
  
  
      fimSemana.setDate(
        inicioSemana.getDate() +
        6
      );
  
  
      resultado =
        resultado.filter(
          function(item) {
  
            var partes =
              String(
                item.data ||
                ""
              ).split(
                "-"
              );
  
  
            if (
              partes.length !==
              3
            ) {
  
              return false;
            }
  
  
            var dataItem =
              new Date(
                Number(
                  partes[0]
                ),
                Number(
                  partes[1]
                ) - 1,
                Number(
                  partes[2]
                )
              );
  
  
            dataItem.setHours(
              0,
              0,
              0,
              0
            );
  
  
            return (
              dataItem >=
              inicioSemana &&
              dataItem <=
              fimSemana
            );
          }
        );
    }
  
  
    return resultado;
  }
  
  
  /**
   * ============================================================
   * CARDÁPIO PÚBLICO
   * ============================================================
   *
   * Não exige login.
   *
   * Mostra somente a semana atual.
   * ============================================================
   */
  function listarCardapioPublico() {
  
    var calendario =
      getData(
        "CALENDARIO"
      ) || [];
  
  
    var refeicoes =
      getData(
        "REFEICOES"
      ) || [];
  
  
    var hoje =
      new Date();
  
  
    hoje.setHours(
      0,
      0,
      0,
      0
    );
  
  
    var inicioSemana =
      new Date(
        hoje.getTime()
      );
  
  
    inicioSemana.setDate(
      hoje.getDate() -
      hoje.getDay()
    );
  
  
    inicioSemana.setHours(
      0,
      0,
      0,
      0
    );
  
  
    var fimSemana =
      new Date(
        inicioSemana.getTime()
      );
  
  
    fimSemana.setDate(
      inicioSemana.getDate() +
      6
    );
  
  
    fimSemana.setHours(
      23,
      59,
      59,
      999
    );
  
  
    var resultado =
      [];
  
  
    calendario.forEach(
      function(item) {
  
        if (
          !item ||
          !item.data
        ) {
  
          return;
        }
  
  
        var partes =
          String(
            item.data
          ).split(
            "-"
          );
  
  
        if (
          partes.length !==
          3
        ) {
  
          return;
        }
  
  
        var dataRegistro =
          new Date(
            Number(
              partes[0]
            ),
            Number(
              partes[1]
            ) - 1,
            Number(
              partes[2]
            )
          );
  
  
        dataRegistro.setHours(
          0,
          0,
          0,
          0
        );
  
  
        if (
          dataRegistro <
          inicioSemana ||
          dataRegistro >
          fimSemana
        ) {
  
          return;
        }
  
  
        var idRefeicao =
          obterIdRefeicaoCalendario(
            item
          );
  
  
        var nomeRefeicao =
          buscarNomeRefeicaoCalendario(
            idRefeicao,
            refeicoes
          );
  
  
        var horario =
          normalizarHorarioRefeicao(
            item.horario ||
            item.periodo
          );
  
  
        resultado.push({
  
          id_calendario:
            item.id_calendario ||
            "",
  
          data:
            item.data ||
            "",
  
          dia_semana:
            obterDiaSemanaCalendario(
              item.data
            ),
  
          horario:
            horario,
  
          periodo:
            horario,
  
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
        });
      }
    );
  
  
    resultado.sort(
      function(a, b) {
  
        var dataA =
          String(
            a.data ||
            ""
          ) +
          " " +
          String(
            a.horario ||
            ""
          );
  
  
        var dataB =
          String(
            b.data ||
            ""
          ) +
          " " +
          String(
            b.horario ||
            ""
          );
  
  
        return (
          dataA.localeCompare(
            dataB
          )
        );
      }
    );
  
  
    return resultado;
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
  
  
    if (
      !idCalendario
    ) {
  
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