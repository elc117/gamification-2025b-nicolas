package com.mogbook;

import java.sql.*;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public class Database {
    private final String url;

    public Database(String filename) {
        this.url = "jdbc:sqlite:" + filename;
        try (Connection conn = connect()) {
            if (conn != null) {
                System.out.println("banco conectado: " + filename);
            }
        } catch (SQLException e) {
            System.err.println("erro ao conectar: " + e.getMessage());
        }
    }

    private Connection connect() throws SQLException {
        return DriverManager.getConnection(url);
    }

    public void createTables() {
        String sqlUsuarios = """
            CREATE TABLE IF NOT EXISTS usuarios (
                id TEXT PRIMARY KEY,
                nome TEXT NOT NULL,
                senha TEXT NOT NULL,
                tipo TEXT CHECK(tipo IN ('aluno','professor')) NOT NULL,
                pontos INTEGER NOT NULL DEFAULT 0
            );
        """;

        String sqlResenhas = """
            CREATE TABLE IF NOT EXISTS resenhas (
                id TEXT PRIMARY KEY,
                aluno_id TEXT NOT NULL,
                livro TEXT NOT NULL,
                autor TEXT NOT NULL,
                paginas INTEGER,
                nota INTEGER CHECK(nota BETWEEN 1 AND 5),
                conteudo TEXT,
                status TEXT CHECK(status IN ('em andamento', 'enviada', 'corrigida')) DEFAULT 'em andamento',
                FOREIGN KEY (aluno_id) REFERENCES usuarios(id)
            );
        """;

        try (Connection conn = connect(); Statement stmt = conn.createStatement()) {
            stmt.execute(sqlUsuarios);
            stmt.execute(sqlResenhas);
            System.out.println("tabelas criadas/verificadas");

            String check = "SELECT COUNT(*) FROM usuarios WHERE tipo = 'professor'";
            ResultSet rs = stmt.executeQuery(check);
            if (rs.next() && rs.getInt(1) == 0) {
                addUser("professor", "1234", "professor", 0);
                System.out.println("professor padrão criado");
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    public void addUser(String nome, String senha, String tipo, Integer pontos) {
        String newId = gerarNovoId();
        String sql = "INSERT INTO usuarios (id, nome, senha, tipo, pontos) VALUES (?, ?, ?, ?, ?)";

        try (Connection conn = connect(); PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, newId);
            pstmt.setString(2, nome);
            pstmt.setString(3, senha);
            pstmt.setString(4, tipo);
            pstmt.setInt(5, pontos);
            pstmt.executeUpdate();
            System.out.println("usuário criado com id: " + newId);
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    public User getUserByName(String nome) {
        String sql = "SELECT * FROM usuarios WHERE nome = ?";
        try (Connection conn = connect(); PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, nome);
            ResultSet rs = pstmt.executeQuery();
            if (rs.next()) {
                return new User(
                        rs.getString("id"),
                        rs.getString("nome"),
                        rs.getString("senha"),
                        rs.getString("tipo"),
                        rs.getInt("pontos")
                );
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return null;
    }

    private String gerarNovoId() {
        String sql = "SELECT id FROM usuarios ORDER BY id DESC LIMIT 1";
        try (Connection conn = connect(); Statement stmt = conn.createStatement()) {
            ResultSet rs = stmt.executeQuery(sql);
            if (rs.next()) {
                int lastId = Integer.parseInt(rs.getString("id"));
                return String.format("%03d", lastId + 1);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return "000";
    }

    public boolean isEmpty() {
        String sql = "SELECT COUNT(*) AS total FROM usuarios";
        try (Connection conn = connect(); Statement stmt = conn.createStatement()) {
            ResultSet rs = stmt.executeQuery(sql);
            return rs.next() && rs.getInt("total") == 0;
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    public List<User> getTopAlunos(int limit) {
        List<User> lista = new ArrayList<>();
        String sql = "SELECT nome, pontos FROM usuarios WHERE tipo = 'aluno' ORDER BY pontos DESC LIMIT ?";

        try (Connection conn = connect();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setInt(1, limit);
            ResultSet rs = pstmt.executeQuery();

            while (rs.next()) {
                User u = new User(null, rs.getString("nome"), "", "aluno", rs.getInt("pontos"));
                lista.add(u);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return lista;
    }

    public void addResenha(String alunoId, String livro, String autor, int paginas, int nota, String conteudo, String status) {
        String sql = "INSERT INTO resenhas (id, aluno_id, livro, autor, paginas, nota, conteudo, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        try (Connection conn = connect(); PreparedStatement stmt = conn.prepareStatement(sql)) {
            String id = UUID.randomUUID().toString();
            stmt.setString(1, id);
            stmt.setString(2, alunoId);
            stmt.setString(3, livro);
            stmt.setString(4, autor);
            stmt.setInt(5, paginas);
            stmt.setInt(6, nota);
            stmt.setString(7, conteudo);
            stmt.setString(8, status);
            stmt.executeUpdate();
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    public List<Map<String, Object>> getResenhasDoAluno(String alunoId) {
        List<Map<String, Object>> list = new ArrayList<>();
        String sql = "SELECT * FROM resenhas WHERE aluno_id = ? ORDER BY rowid DESC";
        try (Connection conn = connect(); PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, alunoId);
            ResultSet rs = stmt.executeQuery();
            while (rs.next()) {
                Map<String, Object> res = new HashMap<>();
                res.put("id", rs.getString("id"));
                res.put("livro", rs.getString("livro"));
                res.put("autor", rs.getString("autor"));
                res.put("paginas", rs.getInt("paginas"));
                res.put("nota", rs.getInt("nota"));
                res.put("conteudo", rs.getString("conteudo"));
                res.put("status", rs.getString("status"));
                list.add(res);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return list;
    }

    public void updateStatus(String id, String status) {
        String sql = "UPDATE resenhas SET status = ? WHERE id = ?";
        try (Connection conn = connect(); PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, status);
            stmt.setString(2, id);
            stmt.executeUpdate();
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    public List<Map<String, Object>> getResenhasParaCorrecao() {
        List<Map<String, Object>> list = new ArrayList<>();
        String sql = "SELECT * FROM resenhas WHERE status = 'enviada'";
        try (Connection conn = connect(); Statement stmt = conn.createStatement()) {
            ResultSet rs = stmt.executeQuery(sql);
            while (rs.next()) {
                Map<String, Object> res = new HashMap<>();
                res.put("id", rs.getString("id"));
                res.put("aluno_id", rs.getString("aluno_id"));
                res.put("livro", rs.getString("livro"));
                res.put("autor", rs.getString("autor"));
                res.put("nota", rs.getInt("nota"));
                res.put("conteudo", rs.getString("conteudo"));
                res.put("status", rs.getString("status"));
                list.add(res);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return list;
    }

}
