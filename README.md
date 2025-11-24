# MogBook
## Software para professores de Linguagens em sala de aula
### 1. Nome: Nicolas Monteiro Longo | Curso: Sistemas de Informação
### 2. Proposta:
Dada uma solicitação externa, essa aplicação é um portal para registro de leituras e criação de resenhas das mesmas para uso em ambiente escolar, utilizando a gamificação como ferramenta a fim de fomentar o contato de alunos com a literatura.

### 3. Processo de desenvolvimento:

3.1: Buscar compreender quais seriam as páginas necessárias para a navegação da aplicação web. Então foi constatado que precisariam ser criadas: uma aba para login, onde os alunos e professor poderiam logar em sua página, e uma aba para cada tipo de usuário.

3.2: Desenvolvimento de uma interface front-end, utilizando HTML, CSS e JavaScript puros, onde não houve muita dificuldade, buscando manter um padrão estético nas páginas descritas acima.

3.3: Inserção de usuários na base de dados: o professor é um usuário padrão, e ele registra os alunos, que possuem dados específicos para entrar na plataforma.

3.4: Inserção das resenhas no banco de dados: as resenhas são inseridas seguindo o padrão de acordo com a classe, onde terão um id para a resenha, o nome do livro, o autor, a nota, as páginas, o conteúdo da resenha, o status (pendente ou corrigida), o id do aluno que a enviou, e o nome do aluno.

3.4.1: Aluno enviar resenha ao BD.

3.4.2: Professor conseguir corrigir a resenha e enviar de volta ao BD.

3.4.1: Adicionar os pontos corretamente (número de páginas X nota do professor para a resenha).

3.5: Tratamento de coisas menores: basicamente, fazer com que "as coisas aparecessem" para os usuários certos, ou seja, cada um conseguiria acessar o que sua view precisasse, e editar para que os outros usuários pudessem receber informações.

3.6: Criação das trocas de pontos por prêmios.

3.7: Ajustes finais no frond-end.

### 5. Orientações para execução:
Eu utilizei nesse projeto o Maven, que compila e executa tudo que precisa sempre, mas pra qualquer um poder executar o aplicativo sem precisar ter que instalar nada, eu deixei um arquivo pronto para ser utilizado. Basta procurar o arquivo no diretório: ```/release```, que lá estará um arquivo chamado ```gamification-2025b-nicolas-1.0-SNAPSHOT-jar-with-dependencies.jar```, então basta ir no seu terminal e digitar:
```
java -jar gamification-2025b-nicolas-1.0-SNAPSHOT-jar-with-dependencies.jar
```

Caso você tenha simplesmente baixado o repositório, apenas execute:

```
java -jar target/gamification-2025b-nicolas-1.0-SNAPSHOT-jar-with-dependencies.jar
```

### 7. Referências:
https://www.devmedia.com.br/java-crie-uma-conexao-com-banco-de-dados/5698


### 8. Comentários:
Em geral, o processo de desenvolvimento foi divertido, contudo, tive que aprender como fazer um banco de dados funcionar e como fazer isso em Java, que era uma linguagem que eu não tive quase nada de contato. A minha salvação foi que tive que fazer outro trabalho envolvendo Java e BD, o que me ajudou bastante. Pedi ajuda pro ChatGPT em alguns momentos para a interface visual e para deixar os comentários melhores, exemplo:
```Java
    // =========================
    //         Exemplo
    // =========================
```
Mas foi uma ótima experiência, por realmente achar que o projeto pode ser útil em algum momento, com algum polimento e mais tempo de desenvolvimento, sinto que posso levar para frente de alguma maneira :D.
