package com.mogbook;

public class User {
    protected String id;
    protected String nome;
    protected String senha;
    protected String tipo;

    public User(String id, String nome, String senha, String tipo) {
        this.id = id;
        this.nome = nome;
        this.senha = senha;
        this.tipo = tipo;
    }

    public String getId() {
        return id;
    }
    public String getNome() {
        return nome;
    }
    public String getSenha() {
        return senha;
    }
    public String getTipo() {
        return tipo;
    }
}