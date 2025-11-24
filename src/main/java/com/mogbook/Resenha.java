package com.mogbook;

public class Resenha {
    private String id;
    private String nome_livro;
    private String autor;
    private Integer nota;
    private Integer paginas;
    private String conteudo;
    private String status;
    private String idAluno;
    private String alunoNome;

    public Resenha(String id, String nome_livro, String autor, Integer nota, Integer paginas,
                String conteudo, String status, String idAluno, String alunoNome) {

        this.id = id;
        this.nome_livro = nome_livro;
        this.autor = autor;
        this.nota = nota;
        this.paginas = paginas;
        this.conteudo = conteudo;
        this.status = status;
        this.idAluno = idAluno;
        this.alunoNome = alunoNome;
    }

    public String getId() { return id; }
    public String getNomeLivro() { return nome_livro; }
    public String getAutor() { return autor; }
    public Integer getNota() { return nota; }
    public Integer getPaginas() { return paginas; }
    public String getConteudo() { return conteudo; }
    public String getStatus() { return status; }
    public String getIdAluno() { return idAluno; }
    public String getAlunoNome() { return alunoNome; }

    public void setstatus(String status) { this.status = status; }
}
