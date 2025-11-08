package com.mogbook;

public class User {
    private String id;
    private String nome;
    private String senha;
    private String tipo;
    private Integer pontos;

    public User(String id, String nome, String senha, String tipo, Integer pontos) {
        this.id = id;
        this.nome = nome;
        this.senha = senha;
        this.tipo = tipo;
        this.pontos = pontos;
    }

    public String getId() { return id; }
    public String getNome() { return nome; }
    public String getSenha() { return senha; }
    public String getTipo() { return tipo; }
    public Integer getPontos() { return pontos; }
}
