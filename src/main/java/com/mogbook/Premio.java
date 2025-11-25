package com.mogbook;

public class Premio {
    private String id;
    private String nome;
    private int custo;

    public Premio(String id, String nome, int custo) {
        this.id = id;
        this.nome = nome;
        this.custo = custo;
    }

    public String getId() {
        return id;
    }
    public String getNome() {
        return nome;
    }
    public int getCusto() {
        return custo;
    }
}
