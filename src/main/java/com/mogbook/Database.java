package com.mogbook;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

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
        String sql = """
                CREATE TABLE IF NOT EXISTS usuarios (
                    id TEXT PRIMARY KEY,
                    nome TEXT NOT NULL,
                    senha TEXT NOT NULL,
                    tipo TEXT CHECK(tipo IN ('aluno','professor')) NOT NULL,
                    pontos INTEGER NOT NULL DEFAULT 0
                );
                """;
        try (Connection conn = connect(); Statement stmt = conn.createStatement()) {
            stmt.execute(sql);
            System.out.println("tabela criada/verificada");

            // cria professor padrão se não existir
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

    // novo método para leaderboard
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
}
