package com.mogbook;

public class Aluno extends User {
    private Integer pontos;

    public Aluno(String id, String nome, String senha, Integer pontos) {
        super(id, nome, senha, "aluno");
        this.pontos = pontos;
    }

    public Integer getPontos() {
        return pontos; 
    }
    
    public void setPontos(Integer pontos) {
        this.pontos = pontos;
    }
}
