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
 * CADASTRO ESCOLAR DESATIVADO
 * ============================================================
 */
function cadastrarUsuario(
  nome,
  email,
  senha,
  perfil
) {

  throw new Error(
    "Cadastro escolar desativado. Somente a Gestão possui acesso ao sistema."
  );
}


/**
 * ============================================================
 * LOGIN
 * ============================================================
 *
 * Somente GESTAO pode autenticar.
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


  var perfilInformado =
    String(
      perfilEsperado
    )
    .trim()
    .toUpperCase();


  /*
   * SOMENTE GESTÃO.
   */
  if (
    perfilInformado !==
    "GESTAO"
  ) {

    throw new Error(
      "Acesso escolar desativado. Somente a Gestão pode acessar o sistema."
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
      "GESTAO" &&

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
          "GESTAO"
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
    "E-mail ou senha inválidos."
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
      !usuario.perfil ||
      String(
        usuario.perfil
      )
      .trim()
      .toUpperCase() !==
      "GESTAO"
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


  if (
    String(
      usuario.perfil
    )
    .trim()
    .toUpperCase() !==
    "GESTAO"
  ) {

    CacheService
      .getScriptCache()
      .remove(
        token
      );


    throw new Error(
      "Acesso negado. Somente a Gestão pode acessar o sistema."
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


  var perfilNecessario =
    String(
      perfilPermitido || ""
    )
    .trim()
    .toUpperCase();


  if (
    perfilNecessario !==
    "GESTAO"
  ) {

    throw new Error(
      "Somente o perfil GESTAO é permitido neste sistema."
    );
  }


  var usuario =
    validarSessao(
      token
    );


  if (
    String(
      usuario.perfil || ""
    )
    .trim()
    .toUpperCase() !==
    "GESTAO"
  ) {

    throw new Error(
      "ACESSO NEGADO. Somente a Gestão pode acessar esta função."
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