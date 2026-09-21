/**
 * ============================================================
 * CODE.GS
 * Entrada da aplicação e carregamento de páginas.
 * ============================================================
 */

var SPREADSHEET_ID =
  "17N6S38gY42sYmWkLiRZngazwsbZ2jPaAbN_-kRg3VB0";


/**
 * ============================================================
 * PÁGINA PRINCIPAL
 * ============================================================
 */
function doGet() {

  return HtmlService
    .createTemplateFromFile("Index")
    .evaluate()
    .setTitle(
      "Calendário de Merenda Escolar"
    )
    .setXFrameOptionsMode(
      HtmlService.XFrameOptionsMode.ALLOWALL
    );
}


/**
 * ============================================================
 * INCLUIR HTML
 * ============================================================
 *
 * Somente as páginas utilizadas pela aplicação atual podem
 * ser carregadas dinamicamente.
 *
 * Área escolar foi desativada.
 * ============================================================
 */
function include(nome) {

  if (
    nome === undefined ||
    nome === null ||
    String(nome).trim() === ""
  ) {

    throw new Error(
      "Nome do arquivo não informado."
    );
  }


  var arquivo =
    String(nome).trim();


  if (
    !/^[A-Za-z0-9_-]+$/.test(arquivo)
  ) {

    throw new Error(
      "Nome de arquivo inválido."
    );
  }


  var paginasPermitidas = [
    "Index",
    "LoginGestao",
    "Gestao",
    "CSS"
  ];


  if (
    paginasPermitidas.indexOf(
      arquivo
    ) === -1
  ) {

    throw new Error(
      "Página não disponível neste sistema."
    );
  }


  try {

    return HtmlService
      .createTemplateFromFile(
        arquivo
      )
      .evaluate()
      .getContent();

  } catch (erro) {

    throw new Error(
      "Não foi possível carregar a página '" +
      arquivo +
      "'. " +
      erro.message
    );
  }
}