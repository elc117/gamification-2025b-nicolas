package com.mogbook;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;
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

    // =========================
    //       CRIA TABELAS
    // =========================
    public void createTables() {
        String sqlUsuarios = """
            CREATE TABLE IF NOT EXISTS usuarios(
                id TEXT PRIMARY KEY,
                nome TEXT NOT NULL,
                senha TEXT NOT NULL,
                tipo TEXT CHECK(tipo IN('aluno', 'professor')) NOT NULL,
                pontos INTEGER NOT NULL DEFAULT 0
            );
        """;

        String sqlResenhas = """
            CREATE TABLE IF NOT EXISTS resenhas(
                id TEXT PRIMARY KEY,
                aluno_id TEXT NOT NULL,
                livro TEXT NOT NULL,
                autor TEXT NOT NULL,
                paginas INTEGER,
                nota INTEGER CHECK(nota BETWEEN 1 AND 5),
                conteudo TEXT,
                status TEXT CHECK(status IN('Pendente', 'Corrigida')) DEFAULT 'Pendente',
                comentario TEXT,
                nota_professor INTEGER,
                FOREIGN KEY(aluno_id) REFERENCES usuarios(id)
            );
        """;

        try (Connection conn = connect(); Statement stmt = conn.createStatement()) {
            stmt.execute(sqlUsuarios);
            stmt.execute(sqlResenhas);
            System.out.println("tabelas criadas/verificadas");

            // cria professor padrão caso não tenha nenhum
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

    // =========================
    //        USUÁRIOS
    // =========================

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
        } catch (Exception e) {
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

    public List < User > getTopAlunos(int limit) {
        List < User > lista = new ArrayList < > ();
        String sql = "SELECT * FROM usuarios WHERE tipo = 'aluno' ORDER BY pontos DESC LIMIT ?";

        try (Connection conn = connect(); PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setInt(1, limit);
            ResultSet rs = pstmt.executeQuery();

            while (rs.next()) {
                User u = new User(
                    rs.getString("id"),
                    rs.getString("nome"),
                    rs.getString("senha"),
                    rs.getString("tipo"),
                    rs.getInt("pontos")
                );
                lista.add(u);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return lista;
    }

    public User getUserById(String id) {
        String sql = "SELECT * FROM usuarios WHERE id = ?";
        try (Connection conn = connect(); PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, id);
            ResultSet rs = ps.executeQuery();
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

    // =========================
    //         RESENHAS
    // =========================

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
            System.out.println("resenha criada: " + id);

        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    public List < Resenha > getResenhasDoAluno(String alunoId) {
        List < Resenha > list = new ArrayList < > ();

        String sql = """
            SELECT r.id, r.livro, r.autor, r.paginas, r.nota,
                r.conteudo, r.status, r.aluno_id, u.nome AS aluno_nome
            FROM resenhas r
            JOIN usuarios u ON u.id = r.aluno_id
            WHERE r.aluno_id = ?
            ORDER BY r.rowid DESC
        """;

        try (Connection conn = connect(); PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, alunoId);
            ResultSet rs = stmt.executeQuery();

            while (rs.next()) {
                Resenha r = new Resenha(
                    rs.getString("id"),
                    rs.getString("livro"),
                    rs.getString("autor"),
                    rs.getInt("nota"),
                    rs.getInt("paginas"),
                    rs.getString("conteudo"),
                    rs.getString("status"),
                    rs.getString("aluno_id"),
                    rs.getString("aluno_nome")
                );
                list.add(r);
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

    public void marcarCorrigida(String id, String comentario, int notaProfessor) {
        String sql = "UPDATE resenhas SET status = 'Corrigida', comentario = ?, nota_professor = ? WHERE id = ?";

        try (Connection conn = connect(); PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, comentario);
            stmt.setInt(2, notaProfessor);
            stmt.setString(3, id);
            stmt.executeUpdate();

        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    public List < Resenha > getResenhasPendentes() {
        System.out.println("buscando pendentes no banco: " + url);
        List < Resenha > list = new ArrayList < > ();
        String sql = """
            SELECT r.id, r.livro, r.autor, r.paginas, r.nota, r.conteudo, r.status,
                r.aluno_id, u.nome AS aluno_nome
            FROM resenhas r
            JOIN usuarios u ON u.id = r.aluno_id
            WHERE TRIM(r.status) = 'Pendente';
        """;

        try (Connection conn = connect(); Statement stmt = conn.createStatement(); ResultSet rs = stmt.executeQuery(sql)) {

            while (rs.next()) {
                System.out.println("achei pendente: id=" + rs.getString("id"));
                list.add(new Resenha(
                    rs.getString("id"),
                    rs.getString("livro"),
                    rs.getString("autor"),
                    rs.getInt("nota"),
                    rs.getInt("paginas"),
                    rs.getString("conteudo"),
                    rs.getString("status"),
                    rs.getString("aluno_id"),
                    rs.getString("aluno_nome")
                ));
            }

        } catch (SQLException e) {
            e.printStackTrace();
        }

        return list;
    }

    public void adicionarPontos(String alunoId, int pontos) {
        String sql = "UPDATE usuarios SET pontos = pontos + ? WHERE id = ?";

        try (Connection conn = connect(); PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setInt(1, pontos);
            stmt.setString(2, alunoId);
            stmt.executeUpdate();

        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    public Resenha getResenhaParaCalculo(String id) {
        String sql = "SELECT paginas, aluno_id FROM resenhas WHERE id = ?";

        try (Connection conn = connect(); PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, id);
            ResultSet rs = stmt.executeQuery();

            if (rs.next()) {
                return new Resenha(
                    id,
                    null, null, // não preciso de livro/autor aqui
                    null,
                    rs.getInt("paginas"),
                    null,
                    null,
                    rs.getString("aluno_id"),
                    null
                );
            }

        } catch (SQLException e) {
            e.printStackTrace();
        }

        return null;
    }

}