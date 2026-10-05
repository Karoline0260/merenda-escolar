/*******************************************************************
 * GESTÃO ALIMENTAR ESCOLAR
 * Back-end - Google Apps Script
 *
 * Abas:
 * USUARIOS, ALUNOS, GESTAO, PRODUTOS, REFEICOES,
 * REFEICAO_PRODUTO, CALENDARIO
 *
 * Opcional: ESCOLAS
 *******************************************************************/

const SPREADSHEET_ID = '1Ver1io0Hr9bycDRXfPqUx_3ZasfiFO0STcmQTqzpy0k';
const SALT = 'troque-este-salt-secreto';
const SESSION_SECONDS = 21600;

const TABLES = {
  USUARIOS:         { id: 'id_usuario' },
  ALUNOS:           { id: 'id_aluno' },
  GESTAO:           { id: 'id_gestao' },
  PRODUTOS:         { id: 'id_produto' },
  REFEICOES:        { id: 'id_refeicao' },
  REFEICAO_PRODUTO: { id: 'id_refeicao_produto' },
  CALENDARIO:       { id: 'id_calendario' },
  ESCOLAS:          { id: 'id_escola' }
};

const READ_USER = [
  'CALENDARIO',
  'REFEICOES',
  'REFEICAO_PRODUTO'
];

/* ---------------- Aplicação ---------------- */

function doGet() {
  return HtmlService.createTemplateFromFile('Index')
    .evaluate()
    .setTitle('Gestão Alimentar Escolar')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function include(f) {
  return HtmlService.createHtmlOutputFromFile(f).getContent();
}

/* ---------------- API ---------------- */

function apiCall(req) {
  try {
    return {
      ok: true,
      data: route_(req.action, req.data || {}, req.token)
    };
  } catch (e) {
    return {
      ok: false,
      error: e.message
    };
  }
}

function route_(action, d, token) {
  switch (action) {
    case 'login':
      return login_(d);

    case 'register':
      return criarUsuario_(d, true);

    case 'forgot':
      return esqueciSenha_(d);

    case 'reset':
      return redefinirSenha_(d);

    // PÚBLICO: cardápio visível na tela inicial, sem login
    case 'cardapio':
      return cardapio_(d);
  }

  const s = session_(token);
  const gestao = s.perfil === 'gestao';

  switch (action) {
    case 'logout':
      CacheService.getScriptCache().remove('s_' + token);
      return true;

    // (o case 'cardapio' foi removido daqui)

    case 'dashboard':
      need_(gestao);
      return dashboard_();
  }

  // ... restante da função continua igual

  need_(
    gestao ||
    (action === 'list' && READ_USER.indexOf(d.sheet) > -1)
  );

  if (!TABLES[d.sheet]) {
    throw new Error('Tabela inválida.');
  }

  switch (action) {
    case 'list':
      return listar_(d.sheet);

    case 'create':
      return d.sheet === 'USUARIOS'
        ? criarUsuario_(d.obj, false)
        : criar_(d.sheet, d.obj);

    case 'update':
      return d.sheet === 'USUARIOS'
        ? atualizarUsuario_(d.obj)
        : atualizar_(d.sheet, d.obj);

    case 'remove':
      return remover_(d.sheet, d.id);
  }

  throw new Error('Ação desconhecida.');
}

function need_(ok) {
  if (!ok) {
    throw new Error('Acesso negado.');
  }
}

/* ---------------- Segurança ---------------- */

function sha256_(txt) {
  return Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    SALT + txt,
    Utilities.Charset.UTF_8
  ).map(function (b) {
    return ('0' + (b & 0xff).toString(16)).slice(-2);
  }).join('');
}

function session_(token) {
  const v = token &&
    CacheService.getScriptCache().get('s_' + token);

  if (!v) {
    throw new Error('Sessão expirada. Faça login novamente.');
  }

  return JSON.parse(v);
}

function login_(d) {
  const email = String(d.email || '')
    .trim()
    .toLowerCase();

  const u = listar_('USUARIOS', true).filter(function (x) {
    return String(x.email).toLowerCase() === email;
  })[0];

  if (!u || u.senha !== sha256_(d.senha || '')) {
    throw new Error('E-mail ou senha inválidos.');
  }

  if (String(u.ativo).toLowerCase() !== 'sim') {
    throw new Error('Usuário inativo.');
  }

  const token = Utilities.getUuid();

  const s = {
    id: u.id_usuario,
    nome: u.nome,
    perfil: u.perfil
  };

  CacheService.getScriptCache().put(
    's_' + token,
    JSON.stringify(s),
    SESSION_SECONDS
  );

  return {
    token: token,
    nome: u.nome,
    perfil: u.perfil
  };
}

/* ---------------- Usuários ---------------- */

function criarUsuario_(o, publico) {
  o = o || {};

  const email = String(o.email || '')
    .trim()
    .toLowerCase();

  if (!o.nome || !email || !o.senha) {
    throw new Error('Preencha nome, e-mail e senha.');
  }

  if (String(o.senha).length < 6) {
    throw new Error('A senha deve ter ao menos 6 caracteres.');
  }

  const todos = listar_('USUARIOS', true);

  if (todos.some(function (x) {
    return String(x.email).toLowerCase() === email;
  })) {
    throw new Error('E-mail já cadastrado.');
  }

  const temGestao = todos.some(function (x) {
    return x.perfil === 'gestao';
  });

  const perfil = publico
    ? (temGestao ? 'usuario' : 'gestao')
    : (o.perfil === 'gestao' ? 'gestao' : 'usuario');

  const u = criar_('USUARIOS', {
    nome: o.nome,
    email: email,
    senha: sha256_(o.senha),
    perfil: perfil,
    ativo: publico ? 'sim' : (o.ativo || 'sim')
  });

  if (perfil === 'gestao') {
    criar_('GESTAO', {
      id_usuario: u.id_usuario,
      nome: o.nome
    });
  } else {
    criar_('ALUNOS', {
      id_usuario: u.id_usuario,
      nome: o.nome
    });
  }

  delete u.senha;
  return u;
}

function atualizarUsuario_(o) {
  const atual = listar_('USUARIOS', true).filter(function (x) {
    return String(x.id_usuario) === String(o.id_usuario);
  })[0];

  if (!atual) {
    throw new Error('Usuário não encontrado.');
  }

  const novo = {
    id_usuario: o.id_usuario,
    nome: o.nome,
    email: String(o.email).trim().toLowerCase(),
    perfil: o.perfil,
    ativo: o.ativo,
    senha: o.senha ? sha256_(o.senha) : atual.senha
  };

  atualizar_('USUARIOS', novo);

  const alvo = novo.perfil === 'gestao' ? 'GESTAO' : 'ALUNOS';
  const outro = alvo === 'GESTAO' ? 'ALUNOS' : 'GESTAO';

  listar_(outro).filter(function (x) {
    return String(x.id_usuario) === String(o.id_usuario);
  }).forEach(function (x) {
    remover_(outro, x[TABLES[outro].id]);
  });

  const ja = listar_(alvo).filter(function (x) {
    return String(x.id_usuario) === String(o.id_usuario);
  });

  if (!ja.length) {
    criar_(alvo, {
      id_usuario: o.id_usuario,
      nome: novo.nome
    });
  } else {
    ja[0].nome = novo.nome;
    atualizar_(alvo, ja[0]);
  }

  delete novo.senha;
  return novo;
}

/* ---------------- Recuperação de senha ---------------- */

function esqueciSenha_(d) {
  const email = String(d.email || '')
    .trim()
    .toLowerCase();

  const u = listar_('USUARIOS', true).filter(function (x) {
    return String(x.email).toLowerCase() === email;
  })[0];

  if (u) {
    const code = String(
      Math.floor(100000 + Math.random() * 900000)
    );

    CacheService.getScriptCache().put(
      'r_' + email,
      sha256_(code),
      900
    );

    MailApp.sendEmail(
      email,
      'Recuperação de senha - Gestão Alimentar Escolar',
      'Seu código de recuperação é: ' + code +
      '\nEle expira em 15 minutos.'
    );
  }

  return 'Se o e-mail existir, enviamos um código de recuperação.';
}

function redefinirSenha_(d) {
  const email = String(d.email || '').trim().toLowerCase();
  const c = CacheService.getScriptCache();

  if (!d.nova || String(d.nova).length < 6) {
    throw new Error('A senha deve ter ao menos 6 caracteres.');
  }

  if (
    c.get('r_' + email) !==
    sha256_(String(d.code || '').trim())
  ) {
    throw new Error('Código inválido ou expirado.');
  }

  const u = listar_('USUARIOS', true).filter(function (x) {
    return String(x.email).toLowerCase() === email;
  })[0];

  if (!u) {
    throw new Error('Usuário não encontrado.');
  }

  u.senha = sha256_(d.nova);

  atualizar_('USUARIOS', u);
  c.remove('r_' + email);

  return 'Senha redefinida com sucesso.';
}

/* ---------------- Planilha ---------------- */

function sheet_(nome) {
  const sh = SpreadsheetApp
    .openById(SPREADSHEET_ID)
    .getSheetByName(nome);

  if (!sh) {
    throw new Error('Aba "' + nome + '" não encontrada na planilha.');
  }

  return sh;
}

/* ---------------- Tratamento de horários ---------------- */

/**
 * Normaliza o horário para HH:mm.
 *
 * O horário é tratado como hora do dia, não como um instante
 * que deva ser convertido entre fusos horários.
 */
function horarioTexto_(valor, timeZone) {
  if (valor instanceof Date) {
    // Formata a hora no fuso horário da própria planilha.
    // Não use getHours()/getMinutes(), pois esses métodos usam
    // o fuso horário do ambiente de execução do Apps Script.
    const tz = timeZone || Session.getScriptTimeZone();
    return Utilities.formatDate(valor, tz, 'HH:mm');
  }

  // O Google Sheets também pode retornar uma fração do dia.
  if (typeof valor === 'number' && isFinite(valor)) {
    let minutos = Math.round(valor * 1440);
    minutos = ((minutos % 1440) + 1440) % 1440;

    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;

    return String(horas).padStart(2, '0') + ':' +
      String(mins).padStart(2, '0');
  }

  const texto = String(valor == null ? '' : valor).trim();

  const match = texto.match(
    /^(\d{1,2}):([0-5]\d)(?::([0-5]\d))?$/
  );

  if (!match) return texto;

  const horas = Number(match[1]);
  const minutos = Number(match[2]);

  if (horas < 0 || horas > 23) return texto;

  return String(horas).padStart(2, '0') + ':' +
    String(minutos).padStart(2, '0');
}

/**
 * Converte HH:mm para fração de um dia.
 * O Google Sheets armazena valores de hora dessa forma.
 */
function horarioFracao_(valor, timeZone) {
  const texto = horarioTexto_(valor, timeZone);

  const match = texto.match(
    /^([01]\d|2[0-3]):([0-5]\d)$/
  );

  if (!match) {
    throw new Error(
      'Horário inválido. Informe um horário válido no formato HH:mm.'
    );
  }

  const horas = Number(match[1]);
  const minutos = Number(match[2]);

  return (horas * 60 + minutos) / 1440;
}

/**
 * Formata datas e horários para exibição.
 */
function fmt_(valor, timeZone) {
  if (valor instanceof Date) {
    const tz = timeZone || Session.getScriptTimeZone();

    const ano = Number(
      Utilities.formatDate(valor, tz, 'yyyy')
    );

    // O Sheets usa uma data-base antiga para células que
    // armazenam somente o horário.
    if (ano < 1950) {
      return horarioTexto_(valor, tz);
    }

    return Utilities.formatDate(valor, tz, 'yyyy-MM-dd');
  }

  return valor;
}

/* ---------------- R - Read ---------------- */

function listar_(nome, comSenha) {
  const sh = sheet_(nome);
  const valores = sh.getDataRange().getValues();
  const cabecalhos = valores.shift();

  const timeZone = sh.getParent().getSpreadsheetTimeZone();

  return valores.filter(function (r) {
    return r.join('') !== '';
  }).map(function (r) {
    const o = {};

    cabecalhos.forEach(function (c, i) {
      if (nome === 'CALENDARIO' && c === 'horario') {
        o[c] = horarioTexto_(r[i], timeZone);
      } else {
        o[c] = fmt_(r[i], timeZone);
      }
    });

    if (nome === 'USUARIOS' && !comSenha) {
      delete o.senha;
    }

    return o;
  });
}

/* ---------------- C - Create ---------------- */

function criar_(nome, obj) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);

  try {
    const sh = sheet_(nome);
    const idc = TABLES[nome].id;

    const cabecalhos = sh.getRange(
      1, 1, 1, sh.getLastColumn()
    ).getValues()[0];

    const ids = listar_(nome, true).map(function (x) {
      return Number(x[idc]) || 0;
    });

    obj = obj || {};

    obj[idc] = Math.max.apply(null, [0].concat(ids)) + 1;

    if (
      cabecalhos.indexOf('data_cadastro') > -1 &&
      !obj.data_cadastro
    ) {
      obj.data_cadastro = Utilities.formatDate(
        new Date(),
        Session.getScriptTimeZone(),
        'yyyy-MM-dd'
      );
    }

    const timeZone = sh.getParent().getSpreadsheetTimeZone();

    const colHorario = nome === 'CALENDARIO'
      ? cabecalhos.indexOf('horario')
      : -1;

    let fracaoHorario = null;

    if (colHorario >= 0 && obj.horario !== undefined) {
      fracaoHorario = horarioFracao_(obj.horario, timeZone);
    }

    const valores = cabecalhos.map(function (c, i) {
      if (i === colHorario && fracaoHorario !== null) {
        return fracaoHorario;
      }

      return obj[c] === undefined ? '' : obj[c];
    });

    sh.appendRow(valores);

    if (colHorario >= 0 && fracaoHorario !== null) {
      sh.getRange(
        sh.getLastRow(),
        colHorario + 1
      ).setNumberFormat('hh:mm');
    }

    return obj;

  } finally {
    lock.releaseLock();
  }
}

/* ---------------- U - Update ---------------- */

function atualizar_(nome, obj) {
  const sh = sheet_(nome);
  const idc = TABLES[nome].id;

  const valores = sh.getDataRange().getValues();
  const cabecalhos = valores[0];
  const colunaId = cabecalhos.indexOf(idc);

  const timeZone = sh.getParent().getSpreadsheetTimeZone();

  const colHorario = nome === 'CALENDARIO'
    ? cabecalhos.indexOf('horario')
    : -1;

  for (let i = 1; i < valores.length; i++) {
    if (String(valores[i][colunaId]) === String(obj[idc])) {
      let fracaoHorario = null;

      if (colHorario >= 0 && obj.horario !== undefined) {
        fracaoHorario = horarioFracao_(
          obj.horario,
          timeZone
        );
      }

      const novaLinha = cabecalhos.map(function (c, j) {
        if (j === colHorario && fracaoHorario !== null) {
          return fracaoHorario;
        }

        return obj[c] === undefined
          ? valores[i][j]
          : obj[c];
      });

      sh.getRange(
        i + 1,
        1,
        1,
        cabecalhos.length
      ).setValues([novaLinha]);

      if (colHorario >= 0 && fracaoHorario !== null) {
        sh.getRange(
          i + 1,
          colHorario + 1
        ).setNumberFormat('hh:mm');
      }

      return obj;
    }
  }

  throw new Error('Registro não encontrado.');
}

/* ---------------- D - Delete ---------------- */

function remover_(nome, id) {
  const sh = sheet_(nome);
  const idc = TABLES[nome].id;

  const valores = sh.getDataRange().getValues();
  const colunaId = valores[0].indexOf(idc);

  for (let i = valores.length - 1; i >= 1; i--) {
    if (String(valores[i][colunaId]) === String(id)) {
      sh.deleteRow(i + 1);
    }
  }

  const casc = function (t, campo) {
    listar_(t).filter(function (x) {
      return String(x[campo]) === String(id);
    }).forEach(function (x) {
      remover_(t, x[TABLES[t].id]);
    });
  };

  if (nome === 'USUARIOS') {
    casc('ALUNOS', 'id_usuario');
    casc('GESTAO', 'id_usuario');
  }

  if (nome === 'REFEICOES') {
    casc('REFEICAO_PRODUTO', 'id_refeicao');
    casc('CALENDARIO', 'id_refeicao');
  }

  if (nome === 'PRODUTOS') {
    casc('REFEICAO_PRODUTO', 'id_produto');
  }

  return true;
}

/* ---------------- Cardápio ---------------- */

function cardapio_(d) {
  const ref = {};
  const prod = {};

  listar_('REFEICOES').forEach(function (r) {
    ref[r.id_refeicao] = r;
  });

  listar_('PRODUTOS').forEach(function (p) {
    prod[p.id_produto] = p.nome;
  });

  const ingredientes = listar_('REFEICAO_PRODUTO');

  return listar_('CALENDARIO')
    .filter(function (c) {
      return (!d.de || c.data >= d.de) &&
        (!d.ate || c.data <= d.ate);
    })
    .sort(function (a, b) {
      const ka = String(a.data || '') + ' ' +
        String(a.horario || '00:00');

      const kb = String(b.data || '') + ' ' +
        String(b.horario || '00:00');

      return ka < kb ? -1 : ka > kb ? 1 : 0;
    })
    .map(function (c) {
      const r = ref[c.id_refeicao] || {};

      c.refeicao = r.nome || '-';
      c.descricao = r.descricao || '';

      c.ingredientes = ingredientes
        .filter(function (i) {
          return String(i.id_refeicao) === String(c.id_refeicao);
        })
        .map(function (i) {
          return (prod[i.id_produto] || '?') +
            ' (' + i.quantidade + ')';
        });

      return c;
    });
}

/* ---------------- Dashboard ---------------- */

function dashboard_() {
  const timeZone = SpreadsheetApp
    .openById(SPREADSHEET_ID)
    .getSpreadsheetTimeZone();

  const hoje = Utilities.formatDate(
    new Date(),
    timeZone,
    'yyyy-MM-dd'
  );

  const us = listar_('USUARIOS');
  const ref = listar_('REFEICOES');

  return {
    usuarios: us.length,

    alunos: us.filter(function (u) {
      return u.perfil === 'usuario';
    }).length,

    gestores: us.filter(function (u) {
      return u.perfil === 'gestao';
    }).length,

    refeicoes: ref.length,
    proximos: cardapio_({ de: hoje }).slice(0, 8)
  };
}