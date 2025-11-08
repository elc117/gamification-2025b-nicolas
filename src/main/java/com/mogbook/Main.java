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
    }

    private static class NovoAlunoRequest {
        String nome;
        String senha;
    }

    private static class LoginRequest {
        String usuario;
        String senha;
    }
}
