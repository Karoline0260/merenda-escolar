/*******************************************************************
 * GESTÃO ALIMENTAR ESCOLAR - Back-end (Google Apps Script)
 * Banco de dados: planilha Google Sheets JÁ EXISTENTE.
 * 1) Cole o ID da planilha em SPREADSHEET_ID.
 * 2) Abas esperadas (linha 1 = cabeçalho, exatamente como abaixo):
 *    USUARIOS, ALUNOS, GESTAO, PRODUTOS, REFEICOES, REFEICAO_PRODUTO, CALENDARIO
 *    Opcional (para o CRUD de escolas): ESCOLAS -> id_escola nome endereco ativo
 *    CALENDARIO -> id_calendario data periodo id_refeicao observacao horario
 *******************************************************************/
const SPREADSHEET_ID = '1Ver1io0Hr9bycDRXfPqUx_3ZasfiFO0STcmQTqzpy0k';
const SALT = 'troque-este-salt-secreto';   // altere antes de cadastrar usuários
const SESSION_SECONDS = 21600;              // 6 h

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
// Usuário comum só lê estas abas
const READ_USER = ['CALENDARIO', 'REFEICOES', 'REFEICAO_PRODUTO'];

function doGet() {
  return HtmlService.createTemplateFromFile('Index').evaluate()
    .setTitle('Gestão Alimentar Escolar')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}
function include(f) { return HtmlService.createHtmlOutputFromFile(f).getContent(); }

/* ---------------- Ponto de entrada único ---------------- */
function apiCall(req) {
  try { return { ok: true, data: route_(req.action, req.data || {}, req.token) }; }
  catch (e) { return { ok: false, error: e.message }; }
}

function route_(action, d, token) {
  switch (action) {
    case 'login':    return login_(d);
    case 'register': return criarUsuario_(d, true);
    case 'forgot':   return esqueciSenha_(d);
    case 'reset':    return redefinirSenha_(d);
  }
  const s = session_(token);
  const gestao = s.perfil === 'gestao';
  switch (action) {
    case 'logout':   CacheService.getScriptCache().remove('s_' + token); return true;
    case 'cardapio': return cardapio_(d);
    case 'dashboard': need_(gestao); return dashboard_();
  }
  need_(gestao || (action === 'list' && READ_USER.indexOf(d.sheet) > -1));
  if (!TABLES[d.sheet]) throw new Error('Tabela inválida.');
  switch (action) {
    case 'list':   return listar_(d.sheet);
    case 'create': return d.sheet === 'USUARIOS' ? criarUsuario_(d.obj, false) : criar_(d.sheet, d.obj);
    case 'update': return d.sheet === 'USUARIOS' ? atualizarUsuario_(d.obj) : atualizar_(d.sheet, d.obj);
    case 'remove': return remover_(d.sheet, d.id);
  }
  throw new Error('Ação desconhecida.');
}
function need_(ok) { if (!ok) throw new Error('Acesso negado.'); }

/* ---------------- Segurança ---------------- */
function sha256_(txt) {
  return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, SALT + txt, Utilities.Charset.UTF_8)
    .map(function (b) { return ('0' + (b & 0xff).toString(16)).slice(-2); }).join('');
}
function session_(token) {
  const v = token && CacheService.getScriptCache().get('s_' + token);
  if (!v) throw new Error('Sessão expirada. Faça login novamente.');
  return JSON.parse(v);
}
function login_(d) {
  const email = String(d.email || '').trim().toLowerCase();
  const u = listar_('USUARIOS', true).filter(function (x) {
    return String(x.email).toLowerCase() === email; })[0];
  if (!u || u.senha !== sha256_(d.senha || '')) throw new Error('E-mail ou senha inválidos.');
  if (String(u.ativo).toLowerCase() !== 'sim') throw new Error('Usuário inativo.');
  const token = Utilities.getUuid();
  const s = { id: u.id_usuario, nome: u.nome, perfil: u.perfil };
  CacheService.getScriptCache().put('s_' + token, JSON.stringify(s), SESSION_SECONDS);
  return { token: token, nome: u.nome, perfil: u.perfil };
}

/* ---------------- Usuários (CRUD com hash) ---------------- */
function criarUsuario_(o, publico) {
  o = o || {};
  const email = String(o.email || '').trim().toLowerCase();
  if (!o.nome || !email || !o.senha) throw new Error('Preencha nome, e-mail e senha.');
  if (String(o.senha).length < 6) throw new Error('A senha deve ter ao menos 6 caracteres.');
  const todos = listar_('USUARIOS', true);
  if (todos.some(function (x) { return String(x.email).toLowerCase() === email; }))
    throw new Error('E-mail já cadastrado.');
  // Cadastro público = "usuario"; o 1º usuário do sistema vira "gestao".
  const temGestao = todos.some(function (x) { return x.perfil === 'gestao'; });
  let perfil = publico ? (temGestao ? 'usuario' : 'gestao') : (o.perfil === 'gestao' ? 'gestao' : 'usuario');
  const u = criar_('USUARIOS', { nome: o.nome, email: email, senha: sha256_(o.senha),
                                 perfil: perfil, ativo: publico ? 'sim' : (o.ativo || 'sim') });
  if (perfil === 'gestao') criar_('GESTAO', { id_usuario: u.id_usuario, nome: o.nome });
  else criar_('ALUNOS', { id_usuario: u.id_usuario, nome: o.nome });
  delete u.senha; return u;
}
function atualizarUsuario_(o) {
  const atual = listar_('USUARIOS', true).filter(function (x) {
    return String(x.id_usuario) === String(o.id_usuario); })[0];
  if (!atual) throw new Error('Usuário não encontrado.');
  const novo = { id_usuario: o.id_usuario, nome: o.nome, email: String(o.email).trim().toLowerCase(),
                 perfil: o.perfil, ativo: o.ativo, senha: o.senha ? sha256_(o.senha) : atual.senha };
  atualizar_('USUARIOS', novo);
  const alvo = novo.perfil === 'gestao' ? 'GESTAO' : 'ALUNOS', outro = alvo === 'GESTAO' ? 'ALUNOS' : 'GESTAO';
  listar_(outro).filter(function (x) { return String(x.id_usuario) === String(o.id_usuario); })
    .forEach(function (x) { remover_(outro, x[TABLES[outro].id]); });
  const ja = listar_(alvo).filter(function (x) { return String(x.id_usuario) === String(o.id_usuario); });
  if (!ja.length) criar_(alvo, { id_usuario: o.id_usuario, nome: novo.nome });
  else { ja[0].nome = novo.nome; atualizar_(alvo, ja[0]); }
  delete novo.senha; return novo;
}

/* ---------------- Recuperação de senha ---------------- */
function esqueciSenha_(d) {
  const email = String(d.email || '').trim().toLowerCase();
  const u = listar_('USUARIOS', true).filter(function (x) {
    return String(x.email).toLowerCase() === email; })[0];
  if (u) { // resposta idêntica exista ou não o e-mail (evita enumeração)
    const code = ('' + Math.floor(100000 + Math.random() * 900000));
    CacheService.getScriptCache().put('r_' + email, sha256_(code), 900);
    MailApp.sendEmail(email, 'Recuperação de senha - Gestão Alimentar Escolar',
      'Seu código de recuperação é: ' + code + '\nEle expira em 15 minutos.');
  }
  return 'Se o e-mail existir, enviamos um código de recuperação.';
}
function redefinirSenha_(d) {
  const email = String(d.email || '').trim().toLowerCase(), c = CacheService.getScriptCache();
  if (!d.nova || String(d.nova).length < 6) throw new Error('A senha deve ter ao menos 6 caracteres.');
  if (c.get('r_' + email) !== sha256_(String(d.code || '').trim())) throw new Error('Código inválido ou expirado.');
  const u = listar_('USUARIOS', true).filter(function (x) {
    return String(x.email).toLowerCase() === email; })[0];
  if (!u) throw new Error('Usuário não encontrado.');
  u.senha = sha256_(d.nova); atualizar_('USUARIOS', u); c.remove('r_' + email);
  return 'Senha redefinida com sucesso.';
}

/* ---------------- CRUD genérico sobre a planilha ---------------- */
function sheet_(nome) {
  const sh = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(nome);
  if (!sh) throw new Error('Aba "' + nome + '" não encontrada na planilha.');
  return sh;
}
function fmt_(v) {
  if (v instanceof Date) return v.getFullYear() < 1950
    ? Utilities.formatDate(v, 'GMT-3', 'HH:mm')   // horários vêm como 1899
    : Utilities.formatDate(v, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  return v;
}
// R - Read
function listar_(nome, comSenha) {
  const v = sheet_(nome).getDataRange().getValues();
  const h = v.shift();
  return v.filter(function (r) { return r.join('') !== ''; }).map(function (r) {
    const o = {}; h.forEach(function (c, i) { o[c] = fmt_(r[i]); });
    if (nome === 'USUARIOS' && !comSenha) delete o.senha;
    return o;
  });
}
// C - Create
function criar_(nome, obj) {
  const lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    const sh = sheet_(nome), idc = TABLES[nome].id;
    const h = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
    const ids = listar_(nome, true).map(function (x) { return Number(x[idc]) || 0; });
    obj = obj || {}; obj[idc] = Math.max.apply(null, [0].concat(ids)) + 1;
    if (h.indexOf('data_cadastro') > -1 && !obj.data_cadastro)
      obj.data_cadastro = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
    sh.appendRow(h.map(function (c) { return obj[c] === undefined ? '' : obj[c]; }));
    return obj;
  } finally { lock.releaseLock(); }
}
// U - Update
function atualizar_(nome, obj) {
  const sh = sheet_(nome), idc = TABLES[nome].id;
  const v = sh.getDataRange().getValues(), h = v[0], ci = h.indexOf(idc);
  for (let i = 1; i < v.length; i++) if (String(v[i][ci]) === String(obj[idc])) {
    sh.getRange(i + 1, 1, 1, h.length).setValues([h.map(function (c, j) {
      return obj[c] === undefined ? v[i][j] : obj[c]; })]);
    return obj;
  }
  throw new Error('Registro não encontrado.');
}
// D - Delete (com remoção em cascata dos vínculos)
function remover_(nome, id) {
  const sh = sheet_(nome), idc = TABLES[nome].id;
  const v = sh.getDataRange().getValues(), ci = v[0].indexOf(idc);
  for (let i = v.length - 1; i >= 1; i--) if (String(v[i][ci]) === String(id)) sh.deleteRow(i + 1);
  const casc = function (t, campo) {
    listar_(t).filter(function (x) { return String(x[campo]) === String(id); })
      .forEach(function (x) { remover_(t, x[TABLES[t].id]); });
  };
  if (nome === 'USUARIOS') { casc('ALUNOS', 'id_usuario'); casc('GESTAO', 'id_usuario'); }
  if (nome === 'REFEICOES') { casc('REFEICAO_PRODUTO', 'id_refeicao'); casc('CALENDARIO', 'id_refeicao'); }
  if (nome === 'PRODUTOS') casc('REFEICAO_PRODUTO', 'id_produto');
  return true;
}

/* ---------------- Consultas (cardápio e dashboard) ---------------- */
function cardapio_(d) {
  const ref = {}, prod = {};
  listar_('REFEICOES').forEach(function (r) { ref[r.id_refeicao] = r; });
  listar_('PRODUTOS').forEach(function (p) { prod[p.id_produto] = p.nome; });
  const ing = listar_('REFEICAO_PRODUTO');
  return listar_('CALENDARIO').filter(function (c) {
    return (!d.de || c.data >= d.de) && (!d.ate || c.data <= d.ate);
  }).sort(function (a, b) { return (a.data + a.horario) < (b.data + b.horario) ? -1 : 1; })
  .map(function (c) {
    const r = ref[c.id_refeicao] || {};
    c.refeicao = r.nome || '-'; c.descricao = r.descricao || '';
    c.ingredientes = ing.filter(function (i) { return String(i.id_refeicao) === String(c.id_refeicao); })
      .map(function (i) { return (prod[i.id_produto] || '?') + ' (' + i.quantidade + ')'; });
    return c;
  });
}
function dashboard_() {
  const hoje = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
  const us = listar_('USUARIOS'), cal = listar_('CALENDARIO'), rp = listar_('REFEICAO_PRODUTO');
  const prod = listar_('PRODUTOS'), ref = listar_('REFEICOES');
  let escolas = 0; try { escolas = listar_('ESCOLAS').length; } catch (e) {}
  const uso = {};
  rp.forEach(function (i) { uso[i.id_produto] = (uso[i.id_produto] || 0) + 1; });
  const top = prod.map(function (p) { return { nome: p.nome, usos: uso[p.id_produto] || 0 }; })
    .sort(function (a, b) { return b.usos - a.usos; }).slice(0, 5);
  return {
    usuarios: us.length, alunos: us.filter(function (u) { return u.perfil === 'usuario'; }).length,
    gestores: us.filter(function (u) { return u.perfil === 'gestao'; }).length,
    produtos: prod.length, refeicoes: ref.length, escolas: escolas,
    proximos: cardapio_({ de: hoje }).slice(0, 8), topProdutos: top
  };
}
