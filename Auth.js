
/**
 * ============================================================
 * AUTH.GS
 * Cadastro, login, sessão e permissões.
 * ============================================================
 */

var TEMPO_SESSAO_SEGUNDOS = 21600; // 6 horas


/**
 * ============================================================
 * NORMALIZAR TOKEN
 * ============================================================
 */
function normalizarToken(valor) {

  if (
    valor &&
    typeof valor === "object" &&
    !Array.isArray(valor)
  ) {

    var dados = valor;

    valor =
      dados.token ||
      dados.sessionToken ||
      dados.authToken ||
      dados.accessToken ||
      dados.Authorization ||
      dados.authorization ||
      "";

    if (
      !valor &&
      dados.headers &&
      typeof dados.headers === "object"
    ) {

      valor =
        dados.headers.Authorization ||
        dados.headers.authorization ||
        "";
    }
  }


  if (
    valor === undefined ||
    valor === null
  ) {

    return "";
  }


  valor =
    String(valor).trim();


  if (
    /^Bearer\s+/i.test(valor)
  ) {

    valor =
      valor
        .replace(
          /^Bearer\s+/i,
          ""
        )
        .trim();
  }


  return valor;
}


/**
 * ============================================================
 * VERIFICAR PERFIL ESCOLAR
 * ============================================================
 */
function perfilEscolarValido(
  perfil
) {

  return [
    "ALUNO",
    "PROFESSOR",
    "FUNCIONARIO"
  ]
  .indexOf(
    String(perfil || "")
      .trim()
      .toUpperCase()
  ) !== -1;
}


/**
 * ============================================================
 * CADASTRAR USUÁRIO
 * ============================================================
 *
 * Cadastro público somente para:
 *
 * ALUNO
 * PROFESSOR
 * FUNCIONARIO
 *
 * GESTAO continua sendo administrativa.
 * ============================================================
 */
function cadastrarUsuario(
  nome,
  email,
  senha,
  perfil
) {

  if (
    nome &&
    typeof nome === "object" &&
    !Array.isArray(nome)
  ) {

    var dados =
      nome;

    nome =
      dados.nome;

    email =
      dados.email;

    senha =
      dados.senha;

    perfil =
      dados.perfil ||
      dados.perfilEsperado;
  }


  if (
    !nome ||
    String(nome).trim() === ""
  ) {

    throw new Error(
      "Nome não informado."
    );
  }


  if (
    !email ||
    String(email).trim() === ""
  ) {

    throw new Error(
      "E-mail não informado."
    );
  }


  if (
    !senha ||
    String(senha).trim() === ""
  ) {

    throw new Error(
      "Senha não informada."
    );
  }


  if (
    !perfil ||
    String(perfil).trim() === ""
  ) {

    throw new Error(
      "Perfil não informado."
    );
  }


  var nomeNormalizado =
    String(
      nome
    ).trim();


  var emailNormalizado =
    String(
      email
    )
    .trim()
    .toLowerCase();


  var senhaNormalizada =
    String(
      senha
    ).trim();


  var perfilNormalizado =
    String(
      perfil
    )
    .trim()
    .toUpperCase();


  if (
    !perfilEscolarValido(
      perfilNormalizado
    )
  ) {

    throw new Error(
      "Perfil inválido. " +
      "O cadastro permite apenas " +
      "ALUNO, PROFESSOR ou FUNCIONARIO."
    );
  }


  var usuarios =
    getData(
      "USUARIOS"
    ) || [];


  for (
    var i = 0;
    i < usuarios.length;
    i++
  ) {

    var usuario =
      usuarios[i];


    if (!usuario) {
      continue;
    }


    var emailExistente =
      String(
        usuario.email || ""
      )
      .trim()
      .toLowerCase();


    if (
      emailExistente ===
      emailNormalizado
    ) {

      throw new Error(
        "Já existe um usuário cadastrado com este e-mail."
      );
    }
  }


  var novoUsuario = {

    id_usuario:
      gerarId(
        "USER"
      ),

    nome:
      nomeNormalizado,

    email:
      emailNormalizado,

    senha:
      senhaNormalizada,

    perfil:
      perfilNormalizado,

    ativo:
      "SIM"
  };


  insertData(
    "USUARIOS",
    novoUsuario
  );


  return {

    sucesso:
      true,

    mensagem:
      "Usuário cadastrado com sucesso.",

    usuario: {

      id_usuario:
        novoUsuario.id_usuario,

      nome:
        novoUsuario.nome,

      email:
        novoUsuario.email,

      perfil:
        novoUsuario.perfil
    }
  };
}


/**
 * ============================================================
 * LOGIN
 * ============================================================
 *
 * Perfis válidos:
 *
 * ALUNO
 * PROFESSOR
 * FUNCIONARIO
 * GESTAO
 * ============================================================
 */
function login(
  email,
  senha,
  perfilEsperado
) {

  if (
    email &&
    typeof email === "object" &&
    !Array.isArray(email)
  ) {

    var dados =
      email;

    email =
      dados.email;

    senha =
      dados.senha;

    perfilEsperado =
      dados.perfil ||
      dados.perfilEsperado;
  }


  if (
    !email ||
    String(email).trim() === ""
  ) {

    throw new Error(
      "E-mail não informado."
    );
  }


  if (
    senha === undefined ||
    senha === null ||
    String(senha).trim() === ""
  ) {

    throw new Error(
      "Senha não informada."
    );
  }


  if (
    !perfilEsperado ||
    String(perfilEsperado).trim() === ""
  ) {

    throw new Error(
      "Perfil não informado."
    );
  }


  var usuarios =
    getData(
      "USUARIOS"
    ) || [];


  var emailInformado =
    String(
      email
    )
    .trim()
    .toLowerCase();


  var senhaInformada =
    String(
      senha
    ).trim();


  var perfilInformado =
    String(
      perfilEsperado
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
      perfilInformado
    ) === -1
  ) {

    throw new Error(
      "Perfil inválido."
    );
  }


  for (
    var i = 0;
    i < usuarios.length;
    i++
  ) {

    var usuario =
      usuarios[i];


    if (!usuario) {
      continue;
    }


    var emailPlanilha =
      String(
        usuario.email || ""
      )
      .trim()
      .toLowerCase();


    var senhaPlanilha =
      String(
        usuario.senha === undefined ||
        usuario.senha === null
          ? ""
          : usuario.senha
      )
      .trim();


    var perfilPlanilha =
      String(
        usuario.perfil || ""
      )
      .trim()
      .toUpperCase();


    var ativoPlanilha =
      String(
        usuario.ativo || ""
      )
      .trim()
      .toUpperCase();


    if (
      emailPlanilha ===
      emailInformado &&

      senhaPlanilha ===
      senhaInformada &&

      perfilPlanilha ===
      perfilInformado &&

      ativoPlanilha ===
      "SIM"
    ) {

      var token =
        Utilities.getUuid();


      var dadosUsuario = {

        id_usuario:
          usuario.id_usuario,

        nome:
          usuario.nome,

        email:
          usuario.email,

        perfil:
          perfilPlanilha
      };


      CacheService
        .getScriptCache()
        .put(
          token,
          JSON.stringify(
            dadosUsuario
          ),
          TEMPO_SESSAO_SEGUNDOS
        );


      return {

        sucesso:
          true,

        mensagem:
          "Login realizado com sucesso.",

        token:
          token,

        sessionToken:
          token,

        usuario:
          dadosUsuario,

        expiracaoSegundos:
          TEMPO_SESSAO_SEGUNDOS
      };
    }
  }


  throw new Error(
    "E-mail, senha ou perfil inválido."
  );
}


/**
 * ============================================================
 * CONSULTAR SESSÃO
 * ============================================================
 */
function consultarSessao(
  token
) {

  token =
    normalizarToken(
      token
    );


  if (!token) {

    return {

      autenticado:
        false,

      usuario:
        null,

      motivo:
        "SEM_TOKEN"
    };
  }


  var dados =
    CacheService
      .getScriptCache()
      .get(
        token
      );


  if (!dados) {

    return {

      autenticado:
        false,

      usuario:
        null,

      motivo:
        "SESSAO_EXPIRADA"
    };
  }


  try {

    var usuario =
      JSON.parse(
        dados
      );


    if (
      !usuario ||
      !usuario.id_usuario ||
      !usuario.perfil
    ) {

      CacheService
        .getScriptCache()
        .remove(
          token
        );


      return {

        autenticado:
          false,

        usuario:
          null,

        motivo:
          "SESSAO_INVALIDA"
      };
    }


    return {

      autenticado:
        true,

      usuario:
        usuario,

      motivo:
        "OK"
    };

  } catch (erro) {

    CacheService
      .getScriptCache()
      .remove(
        token
      );


    return {

      autenticado:
        false,

      usuario:
        null,

      motivo:
        "SESSAO_INVALIDA"
    };
  }
}


/**
 * ============================================================
 * VALIDAR SESSÃO
 * ============================================================
 */
function validarSessao(
  token
) {

  token =
    normalizarToken(
      token
    );


  if (!token) {

    throw new Error(
      "Token não informado. Faça login novamente."
    );
  }


  var dados =
    CacheService
      .getScriptCache()
      .get(
        token
      );


  if (!dados) {

    throw new Error(
      "Sessão inválida ou expirada. Faça login novamente."
    );
  }


  var usuario;


  try {

    usuario =
      JSON.parse(
        dados
      );

  } catch (erro) {

    CacheService
      .getScriptCache()
      .remove(
        token
      );


    throw new Error(
      "Sessão inválida. Faça login novamente."
    );
  }


  if (
    !usuario ||
    !usuario.id_usuario ||
    !usuario.perfil
  ) {

    CacheService
      .getScriptCache()
      .remove(
        token
      );


    throw new Error(
      "Sessão inválida. Faça login novamente."
    );
  }


  return usuario;
}


/**
 * ============================================================
 * VERIFICAR PERMISSÃO
 * ============================================================
 */
function verificarPermissao(
  token,
  perfilPermitido
) {

  if (
    token &&
    typeof token === "object" &&
    !Array.isArray(token)
  ) {

    var dados =
      token;

    perfilPermitido =
      dados.perfilPermitido ||
      dados.perfil ||
      dados.perfilEsperado ||
      perfilPermitido;

    token =
      normalizarToken(
        dados
      );
  }


  token =
    normalizarToken(
      token
    );


  if (!token) {

    throw new Error(
      "Token não informado. Faça login novamente."
    );
  }


  if (
    perfilPermitido === undefined ||
    perfilPermitido === null ||
    String(
      perfilPermitido
    ).trim() === ""
  ) {

    throw new Error(
      "Perfil permitido não informado."
    );
  }


  var perfilNecessario =
    String(
      perfilPermitido
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
      perfilNecessario
    ) === -1
  ) {

    throw new Error(
      "Perfil de permissão inválido."
    );
  }


  var usuario =
    validarSessao(
      token
    );


  var perfilUsuario =
    String(
      usuario.perfil || ""
    )
    .trim()
    .toUpperCase();


  if (
    perfilUsuario !==
    perfilNecessario
  ) {

    throw new Error(
      "ACESSO NEGADO. " +
      "Esta função exige o perfil " +
      perfilNecessario +
      "."
    );
  }


  return usuario;
}


/**
 * ============================================================
 * LOGOUT
 * ============================================================
 */
function logout(
  token
) {

  token =
    normalizarToken(
      token
    );


  if (!token) {

    return {

      sucesso:
        true,

      mensagem:
        "Sessão já estava encerrada."
    };
  }


  CacheService
    .getScriptCache()
    .remove(
      token
    );


  return {

    sucesso:
      true,

    mensagem:
      "Logout realizado com sucesso."
  };
}


/**
 * ============================================================
 * TESTAR USUÁRIOS
 * ============================================================
 */
function testarUsuariosDeTeste() {

  var testes = [

    {
      email:
        "aluno@email.com",

      senha:
        "123456",

      perfil:
        "ALUNO"
    },

    {
      email:
        "professor@email.com",

      senha:
        "123456",

      perfil:
        "PROFESSOR"
    },

    {
      email:
        "funcionario@email.com",

      senha:
        "123456",

      perfil:
        "FUNCIONARIO"
    },

    {
      email:
        "gestao@email.com",

      senha:
        "123456",

      perfil:
        "GESTAO"
    }
  ];


  return testes.map(
    function(teste) {

      try {

        var resultado =
          login(
            teste
          );


        var sessao =
          consultarSessao(
            resultado.token
          );


        return {

          email:
            teste.email,

          perfil:
            teste.perfil,

          login:
            resultado.sucesso,

          tokenGerado:
            !!resultado.token,

          sessaoValida:
            sessao.autenticado,

          usuario:
            sessao.usuario
        };

      } catch (erro) {

        return {

          email:
            teste.email,

          perfil:
            teste.perfil,

          login:
            false,

          tokenGerado:
            false,

          sessaoValida:
            false,

          erro:
            erro.message
        };
      }
    }
  );
}


/**
 * ============================================================
 * TESTAR TOKEN
 * ============================================================
 */
function testarToken(
  token
) {

  token =
    normalizarToken(
      token
    );


  if (!token) {

    return {

      sucesso:
        false,

      motivo:
        "TOKEN_VAZIO",

      mensagem:
        "Nenhum token foi recebido pelo servidor."
    };
  }


  var sessao =
    consultarSessao(
      token
    );


  return {

    sucesso:
      sessao.autenticado,

    tokenRecebido:
      true,

    sessao:
      sessao
  };
}


/**
 * ============================================================
 * TESTAR FLUXO TOKEN ALUNO
 * ============================================================
 */
function testarFluxoTokenAluno() {

  var resultadoLogin =
    login(
      "aluno@email.com",
      "123456",
      "ALUNO"
    );


  Logger.log(
    "1 - LOGIN:"
  );


  Logger.log(
    JSON.stringify(
      resultadoLogin,
      null,
      2
    )
  );


  var token =
    resultadoLogin.token;


  Logger.log(
    "2 - TOKEN:"
  );


  Logger.log(
    token
  );


  var sessao =
    consultarSessao(
      token
    );


  Logger.log(
    "3 - CONSULTAR SESSAO:"
  );


  Logger.log(
    JSON.stringify(
      sessao,
      null,
      2
    )
  );


  var usuario =
    validarSessao(
      token
    );


  Logger.log(
    "4 - VALIDAR SESSAO:"
  );


  Logger.log(
    JSON.stringify(
      usuario,
      null,
      2
    )
  );


  return {

    login:
      resultadoLogin,

    sessao:
      sessao,

    usuario:
      usuario
  };
}


/**
 * ============================================================
 * TESTAR FLUXO TOKEN GESTAO
 * ============================================================
 */
function testarFluxoTokenGestao() {

  var resultadoLogin =
    login(
      "gestao@email.com",
      "123456",
      "GESTAO"
    );


  Logger.log(
    "1 - LOGIN:"
  );


  Logger.log(
    JSON.stringify(
      resultadoLogin,
      null,
      2
    )
  );


  var token =
    resultadoLogin.token;


  Logger.log(
    "2 - TOKEN:"
  );


  Logger.log(
    token
  );


  var sessao =
    consultarSessao(
      token
    );


  Logger.log(
    "3 - CONSULTAR SESSAO:"
  );


  Logger.log(
    JSON.stringify(
      sessao,
      null,
      2
    )
  );


  var usuario =
    validarSessao(
      token
    );


  Logger.log(
    "4 - VALIDAR SESSAO:"
  );


  Logger.log(
    JSON.stringify(
      usuario,
      null,
      2
    )
  );


  var permissao =
    verificarPermissao(
      token,
      "GESTAO"
    );


  Logger.log(
    "5 - PERMISSÃO:"
  );


  Logger.log(
    JSON.stringify(
      permissao,
      null,
      2
    )
  );


  return {

    login:
      resultadoLogin,

    sessao:
      sessao,

    usuario:
      usuario,

    permissao:
      permissao
  };
}


/**
 * ============================================================
 * TESTAR PRODUTO COM TOKEN
 * ============================================================
 */
function testarProdutoComToken() {

  var resultadoLogin =
    login(
      "gestao@email.com",
      "123456",
      "GESTAO"
    );


  var token =
    resultadoLogin.token;


  Logger.log(
    "TOKEN GERADO:"
  );


  Logger.log(
    token
  );


  var produtos =
    listarProdutos(
      token
    );


  Logger.log(
    "PRODUTOS:"
  );


  Logger.log(
    JSON.stringify(
      produtos,
      null,
      2
    )
  );


  return produtos;
}


/**
 * ============================================================
 * TESTAR REFEIÇÃO COM TOKEN
 * ============================================================
 */
function testarRefeicaoComToken() {

  var resultadoLogin =
    login(
      "gestao@email.com",
      "123456",
      "GESTAO"
    );


  var token =
    resultadoLogin.token;


  Logger.log(
    "TOKEN GERADO:"
  );


  Logger.log(
    token
  );


  var refeicoes =
    listarRefeicoes(
      token
    );


  Logger.log(
    "REFEICOES:"
  );


  Logger.log(
    JSON.stringify(
      refeicoes,
      null,
      2
    )
  );


  return refeicoes;
}


/**
 * ============================================================
 * TESTAR CALENDÁRIO COM TOKEN
 * ============================================================
 */
function testarCalendarioComToken() {

  var resultadoLogin =
    login(
      "gestao@email.com",
      "123456",
      "GESTAO"
    );


  var token =
    resultadoLogin.token;


  Logger.log(
    "TOKEN GERADO:"
  );


  Logger.log(
    token
  );


  var calendario =
    listarCalendario(
      token
    );


  Logger.log(
    "CALENDARIO:"
  );


  Logger.log(
    JSON.stringify(
      calendario,
      null,
      2
    )
  );


  return calendario;
}
