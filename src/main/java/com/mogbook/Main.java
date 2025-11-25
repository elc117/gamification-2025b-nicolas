package com.mogbook;

import io.javalin.Javalin;
import io.javalin.http.staticfiles.Location;

import java.io.File;
import java.io.FileInputStream;
import java.util.Map;

import com.google.gson.Gson;

public class Main {
    public static void main(String[] args) {
        Database db = new Database("mogbook.db");

        new File("recibos").mkdirs();
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

        app.before(ctx -> {
            ctx.header("Access-Control-Allow-Origin", "https://html-classic.itch.zone");
            ctx.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
            ctx.header("Access-Control-Allow-Headers", "Content-Type");
        });

        app.options("/*", ctx -> {
            ctx.status(204);
        });

        Gson gson = new Gson();

    // =========================
    //         ENDPOINTS
    // =========================

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
            var alunos = db.getTopAlunos(-1);
            ctx.json(alunos);
        });

        app.post("/resenha", ctx -> {
            var req = gson.fromJson(ctx.body(), ResenhaRequest.class);

            if (req.alunoId == null || req.livro == null || req.autor == null || req.paginas == 0 || req.nota == 0 || req.conteudo == null) {
                ctx.status(400).result("dados incompletos");
                return;
            }

            db.addResenha(req.alunoId, req.livro, req.autor, req.paginas, req.nota, req.conteudo, "Pendente");
            ctx.result("resenha enviada");
        });

        app.get("/resenhas/pendentes", ctx -> {
            System.out.println("endpoint /resenhas/pendentes chamado");
            var pendentes = db.getResenhasPendentes();
            ctx.json(pendentes);
        });

        app.get("/resenhas/{alunoId}", ctx -> {
            System.out.println("endpoint /resenhas/alunoID chamado");
            String alunoId = ctx.pathParam("alunoId");
            var list = db.getResenhasDoAluno(alunoId);
            ctx.json(list);
        });

        app.get("/usuario/{id}", ctx -> {
            String id = ctx.pathParam("id");
            User u = db.getUserById(id);
            if (u != null) ctx.json(u);
            else ctx.status(404);
        });

        app.post("/resenhas/{id}/corrigir", ctx -> {
            String id = ctx.pathParam("id");
            var req = gson.fromJson(ctx.body(), CorrigirRequest.class);

            db.marcarCorrigida(id, req.comentario, req.notaProfessor);

            Resenha r = db.getResenhaParaCalculo(id);

            if (r != null) {
                int paginas = r.getPaginas();
                int pontos = req.notaProfessor * paginas;

                db.adicionarPontos(r.getIdAluno(), pontos);
            }

            ctx.result("resenha corrigida");
        });

        app.get("/premios", ctx -> {
            ctx.json(db.getPremios());
        });

        app.post("/premios", ctx -> {
            var req = gson.fromJson(ctx.body(), CriarPremioRequest.class);

            if (req.nome == null || req.custo <= 0) {
                ctx.status(400).result("dados inválidos");
                return;
            }

            db.addPremio(req.nome, req.custo);
            ctx.result("premio criado");
        });

        app.post("/trocar", ctx -> {
            var req = gson.fromJson(ctx.body(), TrocaRequest.class);

            User u = db.getUserById(req.alunoId);
            if (!(u instanceof Aluno aluno)) {
                ctx.status(400).result("usuário não é aluno");
                return;
            }

            Premio p = db.getPremioById(req.premioId);
            if (p == null) {
                ctx.status(400).result("erro");
                return;
            }

            if (aluno.getPontos() < p.getCusto()) {
                ctx.status(400).result("pontos insuficientes");
                return;
            }

            db.adicionarPontos(u.getId(), -p.getCusto());

            String nomeArquivo = "recibo-" + u.getId() + "-" + System.currentTimeMillis() + ".pdf";
            String caminho = "recibos/" + nomeArquivo;

            String gerado = Recibo.gerar(
                    u.getId(),
                    u.getNome(),
                    p.getId(),
                    p.getNome(),
                    p.getCusto(),
                    caminho
            );

            if (gerado == null) {
                ctx.status(500).result("erro ao gerar recibo");
                return;
            }

            ctx.json(Map.of(
                    "status", "ok",
                    "arquivo", nomeArquivo
            ));
        });

        app.get("/recibo/{nome}", ctx -> {
            String nome = ctx.pathParam("nome");
            File f = new File("recibos/" + nome);

            if (!f.exists()) {
                ctx.status(404).result("arquivo não encontrado");
                return;
            }

            ctx.header("Content-Disposition", "attachment; filename=" + nome);
            ctx.contentType("application/pdf");
            ctx.result(new FileInputStream(f));
        });

    }


    // =========================
    //     CLASSES REQUESTS
    // =========================

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

    private static class CorrigirRequest {
        String comentario;
        int notaProfessor;
    }

    private static class CriarPremioRequest {
        String nome;
        int custo;
    }

    private static class TrocaRequest {
        String alunoId;
        String premioId;
    }
}