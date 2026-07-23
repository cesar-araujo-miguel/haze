package school.sptech.projetoindividual.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/dashboard")
@CrossOrigin(origins = {"http://localhost:3333", "http://127.0.0.1:3333"})
public class DashboardController {

    private final JdbcTemplate jdbcTemplate;

    public DashboardController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    // ── GET /dashboard/estatisticas ───────────────────
    @GetMapping("/estatisticas")
    public ResponseEntity<Map<String, Object>> estatisticas() {
        String sql = """
            SELECT
                (SELECT COUNT(*) FROM usuarios)    AS total_usuarios,
                (SELECT COUNT(*) FROM posts WHERE tipo = 'mural')  AS total_imagens,
                (SELECT COUNT(*) FROM posts WHERE tipo = 'forum')  AS total_posts,
                (SELECT COUNT(*) FROM comentarios) AS total_comentarios,
                (SELECT COUNT(*) FROM votos WHERE valor = 1)  AS total_upvotes,
                (SELECT COUNT(*) FROM votos WHERE valor = -1) AS total_downvotes
        """;
        Map<String, Object> stats = jdbcTemplate.queryForMap(sql);
        return ResponseEntity.ok(stats);
    }

    // ── GET /dashboard/usuarios-ativos ────────────────
    @GetMapping("/usuarios-ativos")
    public ResponseEntity<List<Map<String, Object>>> usuariosAtivos() {
        String sql = """
            SELECT
                u.username,
                u.avatar_url,
                COUNT(p.id) AS total_posts
            FROM usuarios u
            LEFT JOIN posts p ON p.usuario_id = u.id
            GROUP BY u.id, u.username, u.avatar_url
            ORDER BY total_posts DESC
            LIMIT 5
        """;
        List<Map<String, Object>> result = jdbcTemplate.queryForList(sql);
        if (result.isEmpty()) return ResponseEntity.status(204).build();
        return ResponseEntity.ok(result);
    }

    // ── GET /dashboard/top-imagens ────────────────────
    @GetMapping("/top-imagens")
    public ResponseEntity<List<Map<String, Object>>> topImagens() {
        String sql = """
            SELECT
                p.id,
                p.titulo,
                p.imagem_url,
                u.username AS autor,
                ROUND(AVG(a.nota), 1) AS media_avaliacao,
                COUNT(a.id)           AS total_avaliacoes
            FROM posts p
            JOIN usuarios u ON u.id = p.usuario_id
            LEFT JOIN avaliacoes_imagens a ON a.post_id = p.id
            WHERE p.tipo = 'mural'
            GROUP BY p.id, p.titulo, p.imagem_url, u.username
            HAVING total_avaliacoes > 0
            ORDER BY media_avaliacao DESC
            LIMIT 6
        """;
        List<Map<String, Object>> result = jdbcTemplate.queryForList(sql);
        if (result.isEmpty()) return ResponseEntity.status(204).build();
        return ResponseEntity.ok(result);
    }

    // ── GET /dashboard/atividade-recente ──────────────
    @GetMapping("/atividade-recente")
    public ResponseEntity<List<Map<String, Object>>> atividadeRecente() {
        String sql = """
            SELECT 'mural'  AS tipo, p.titulo AS descricao, u.username AS autor, p.data_postagem AS data
            FROM posts p JOIN usuarios u ON u.id = p.usuario_id
            WHERE p.tipo = 'mural'
            UNION ALL
            SELECT 'forum'  AS tipo, p.titulo AS descricao, u.username AS autor, p.data_postagem AS data
            FROM posts p JOIN usuarios u ON u.id = p.usuario_id
            WHERE p.tipo = 'forum'
            UNION ALL
            SELECT 'comentario' AS tipo, LEFT(c.conteudo, 60) AS descricao, u.username AS autor, c.data_comentario AS data
            FROM comentarios c JOIN usuarios u ON u.id = c.usuario_id
            ORDER BY data DESC
            LIMIT 10
        """;
        List<Map<String, Object>> result = jdbcTemplate.queryForList(sql);
        if (result.isEmpty()) return ResponseEntity.status(204).build();
        return ResponseEntity.ok(result);
    }

    // ── GET /dashboard/posts-por-usuario ──────────────
    @GetMapping("/posts-por-usuario")
    public ResponseEntity<List<Map<String, Object>>> postsPorUsuario() {
        String sql = """
            SELECT
                u.username,
                COUNT(p.id) AS total_posts
            FROM usuarios u
            LEFT JOIN posts p ON p.usuario_id = u.id
            GROUP BY u.id, u.username
            HAVING total_posts > 0
            ORDER BY total_posts DESC
            LIMIT 10
        """;
        List<Map<String, Object>> result = jdbcTemplate.queryForList(sql);
        if (result.isEmpty()) return ResponseEntity.status(204).build();
        return ResponseEntity.ok(result);
    }

    // ── GET /dashboard/distribuicao-avaliacoes ────────
    @GetMapping("/distribuicao-avaliacoes")
    public ResponseEntity<List<Map<String, Object>>> distribuicaoAvaliacoes() {
        String sql = """
            SELECT
                nota,
                COUNT(*) AS quantidade
            FROM avaliacoes_imagens
            GROUP BY nota
            ORDER BY nota ASC
        """;
        List<Map<String, Object>> result = jdbcTemplate.queryForList(sql);
        if (result.isEmpty()) return ResponseEntity.status(204).build();
        return ResponseEntity.ok(result);
    }

    // ── GET /dashboard/votos ──────────────────────────
    @GetMapping("/votos")
    public ResponseEntity<Map<String, Object>> votos() {
        String sql = """
            SELECT
                SUM(CASE WHEN valor =  1 THEN 1 ELSE 0 END) AS upvotes,
                SUM(CASE WHEN valor = -1 THEN 1 ELSE 0 END) AS downvotes
            FROM votos
        """;
        Map<String, Object> result = jdbcTemplate.queryForMap(sql);
        return ResponseEntity.ok(result);
    }
}