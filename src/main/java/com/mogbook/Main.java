package com.mogbook;

import io.javalin.Javalin;
import io.javalin.http.Context;

public class Main {
    public static void main(String[] args) {
        var app = Javalin.create(config -> {
            config.staticFiles.add("/public");
        }).start(7070);

        app.get("/", ctx -> ctx.redirect("index.html"));

        app.post("/login", Main::fazerLogin);
    }

    private static void fazerLogin(Context ctx) {
        String usuario = ctx.formParam("usuario");
        String senha = ctx.formParam("senha");

        if ("professor".equals(usuario) && "123".equals(senha)) {
            ctx.redirect("/professor.html");
        } else if ("aluno".equals(usuario) && "123".equals(senha)) {
            ctx.redirect("/aluno.html");
        } else {
            ctx.redirect("/index.html?erro=1");
        }
    }
}
