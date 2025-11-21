package com.mogbook;

public class Resenha {
    private String id;
    private String nome_livro;
    private String autor;
    private Integer nota;
    private Integer paginas;
    private String conteudo;
    private String estado;
    private String idAluno;

    public Resenha(String id, String nome_livro, String autor, Integer nota, Integer paginas,
                   String conteudo, String estado, String idAluno) {
        this.id = id;
        this.nome_livro = nome_livro;
        this.autor = autor;
        this.nota = nota;
        this.paginas = paginas;
        this.conteudo = conteudo;
        this.estado = estado;
        this.idAluno = idAluno;
    }

    public String getId() { return id; }
    public String getNomeLivro() { return nome_livro; }
    public String getAutor() { return autor; }
    public Integer getNota() { return nota; }
    public Integer getPaginas() { return paginas; }
    public String getConteudo() { return conteudo; }
    public String getEstado() { return estado; }
    public String getIdAluno() { return idAluno; }

    public void setEstado(String estado) { this.estado = estado; }
}
