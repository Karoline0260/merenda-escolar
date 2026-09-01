function testarLoginAluno() {

    try {
  
      var resultado = login(
        "aluno@email.com",
        "123456",
        "ALUNO"
      );
  
      Logger.log(
        JSON.stringify(
          resultado,
          null,
          2
        )
      );
  
    } catch (erro) {
  
      Logger.log(
        "ERRO EXATO:"
      );
  
      Logger.log(
        String(erro.message)
      );
  
      Logger.log(
        "STACK:"
      );
  
      Logger.log(
        String(erro.stack || "")
      );
  
      throw erro;
    }
  }
  