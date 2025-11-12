package com.mogbook;

import io.javalin.Javalin;
import io.javalin.http.staticfiles.Location;
import com.google.gson.Gson;

public class Main {
    public static void main(String[] args) {
        Database db = new Database("mogbook.db");
        db.createTables();
        
        if (db.isEmpty()) {
            db.addUser("professor", "1234", "professor", 0);
        }

        Javalin app = Javalin.create(config -> {
            config.staticFiles.add(staticFiles -> {
                staticFiles.directory = "/public";
                staticFiles.location = Location.CLASSPATH;
            });
        }).start(7000);

        Gson gson = new Gson();

        app.post("/login", ctx -> {
            var req = gson.fromJson(ctx.body(), LoginRequest.class);
            User user = db.getUserByName(req.usuario);

            if (user != null && user.getSenha().equals(req.senha)) {
                ctx.json(user);
            } else {
                ctx.status(401);
            }
        });

        app.post("/cadastro-aluno", ctx -> {
            var req = gson.fromJson(ctx.body(), NovoAlunoRequest.class);
            db.addUser(req.nome, req.senha, "aluno", 0);
            ctx.result("aluno cadastrado");
        });

        app.get("/leaderboard", ctx -> {
            var alunos = db.getTopAlunos(10);
            ctx.json(alunos);
        });

        app.post("/resenha", ctx -> {
            var req = gson.fromJson(ctx.body(), ResenhaRequest.class);

            if (req.alunoId == null || req.livro == null || req.autor == null || req.paginas == 0 || req.nota == 0 || req.conteudo == null) {
                ctx.status(400).result("dados incompletos");
                return;
            }

            db.addResenha(req.alunoId, req.livro, req.autor, req.paginas, req.nota, req.conteudo, "enviada");
            ctx.result("resenha enviada");
        });

        app.get("/resenhas/:alunoId", ctx -> {
            String alunoId = ctx.pathParam("alunoId");
            var list = db.getResenhasDoAluno(alunoId);
            ctx.json(list);
        });

    }

    private static class NovoAlunoRequest {
        String nome;
        String senha;
    }

    private static class LoginRequest {
        String usuario;
        String senha;
    }

    private static class ResenhaRequest {
        String alunoId;
        String livro;
        String autor;
        int paginas;
        int nota;
        String conteudo;
    }
}
