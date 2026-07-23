package school.sptech.projetoindividual.controller;

import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/comunidade")
@CrossOrigin(origins = {"http://localhost:3333", "http://127.0.0.1:3333"})
public class ComunidadeController {

    private final JdbcTemplate jdbcTemplate;

    public ComunidadeController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    // ── POST /comunidade/avaliar/{postId} ─────────────
    @PostMapping("/avaliar/{postId}")
    public ResponseEntity<String> avaliar(
            @PathVariable Integer postId,
            @RequestBody Map<String, Object> body) {

        Integer usuarioId = Integer.valueOf(body.get("usuarioId").toString());
        Integer nota      = Integer.valueOf(body.get("nota").toString());

        if (nota < 1 || nota > 5)
            return ResponseEntity.badRequest().body("Nota deve ser entre 1 e 5.");

        // Verifica se o post é do tipo mural
        try {
            String tipo = jdbcTemplate.queryForObject(
                    "SELECT tipo FROM posts WHERE id = ?", String.class, postId
            );
            if (!"mural".equals(tipo))
                return ResponseEntity.badRequest().body("Avaliação por estrelas só é permitida no mural.");
        } catch (EmptyResultDataAccessException e) {
            return ResponseEntity.status(404).body("Post não encontrado.");
        }

        // Verifica se já avaliou — atualiza se sim, insere se não
        Integer jaAvaliou = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM avaliacoes_imagens WHERE usuario_id = ? AND post_id = ?",
                Integer.class, usuarioId, postId
        );

        if (jaAvaliou != null && jaAvaliou > 0) {
            jdbcTemplate.update(
                    "UPDATE avaliacoes_imagens SET nota = ? WHERE usuario_id = ? AND post_id = ?",
                    nota, usuarioId, postId
            );
            return ResponseEntity.status(200).body("Avaliação atualizada!");
        }

        jdbcTemplate.update(
                "INSERT INTO avaliacoes_imagens (usuario_id, post_id, nota) VALUES (?, ?, ?)",
                usuarioId, postId, nota
        );
        return ResponseEntity.status(201).body("Avaliação enviada!");
    }

    // ── POST /comunidade/votar/{postId} ───────────────
    @PostMapping("/votar/{postId}")
    public ResponseEntity<String> votarPost(
            @PathVariable Integer postId,
            @RequestBody Map<String, Object> body) {

        Integer usuarioId = Integer.valueOf(body.get("usuarioId").toString());
        Integer valor     = Integer.valueOf(body.get("valor").toString());

        if (valor != 1 && valor != -1)
            return ResponseEntity.badRequest().body("Valor deve ser 1 (upvote) ou -1 (downvote).");

        Integer jaVotou = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM votos WHERE usuario_id = ? AND post_id = ?",
                Integer.class, usuarioId, postId
        );

        if (jaVotou != null && jaVotou > 0) {
            // Se votar igual ao voto atual, remove o voto (toggle)
            Integer votoAtual = jdbcTemplate.queryForObject(
                    "SELECT valor FROM votos WHERE usuario_id = ? AND post_id = ?",
                    Integer.class, usuarioId, postId
            );
            if (votoAtual != null && votoAtual.equals(valor)) {
                jdbcTemplate.update(
                        "DELETE FROM votos WHERE usuario_id = ? AND post_id = ?",
                        usuarioId, postId
                );
                return ResponseEntity.status(200).body("Voto removido.");
            }
            jdbcTemplate.update(
                    "UPDATE votos SET valor = ? WHERE usuario_id = ? AND post_id = ?",
                    valor, usuarioId, postId
            );
            return ResponseEntity.status(200).body("Voto atualizado!");
        }

        jdbcTemplate.update(
                "INSERT INTO votos (usuario_id, post_id, valor) VALUES (?, ?, ?)",
                usuarioId, postId, valor
        );
        return ResponseEntity.status(201).body("Voto registrado!");
    }

    // ── POST /comunidade/votar/comentario/{comentarioId}
    @PostMapping("/votar/comentario/{comentarioId}")
    public ResponseEntity<String> votarComentario(
            @PathVariable Integer comentarioId,
            @RequestBody Map<String, Object> body) {

        Integer usuarioId = Integer.valueOf(body.get("usuarioId").toString());
        Integer valor     = Integer.valueOf(body.get("valor").toString());

        if (valor != 1 && valor != -1)
            return ResponseEntity.badRequest().body("Valor deve ser 1 (upvote) ou -1 (downvote).");

        Integer jaVotou = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM votos WHERE usuario_id = ? AND comentario_id = ?",
                Integer.class, usuarioId, comentarioId
        );

        if (jaVotou != null && jaVotou > 0) {
            Integer votoAtual = jdbcTemplate.queryForObject(
                    "SELECT valor FROM votos WHERE usuario_id = ? AND comentario_id = ?",
                    Integer.class, usuarioId, comentarioId
            );
            if (votoAtual != null && votoAtual.equals(valor)) {
                jdbcTemplate.update(
                        "DELETE FROM votos WHERE usuario_id = ? AND comentario_id = ?",
                        usuarioId, comentarioId
                );
                return ResponseEntity.status(200).body("Voto removido.");
            }
            jdbcTemplate.update(
                    "UPDATE votos SET valor = ? WHERE usuario_id = ? AND comentario_id = ?",
                    valor, usuarioId, comentarioId
            );
            return ResponseEntity.status(200).body("Voto atualizado!");
        }

        jdbcTemplate.update(
                "INSERT INTO votos (usuario_id, comentario_id, valor) VALUES (?, ?, ?)",
                usuarioId, comentarioId, valor
        );
        return ResponseEntity.status(201).body("Voto registrado!");
    }

    // ── GET /comunidade/comentarios/{postId} ──────────
    @GetMapping("/comentarios/{postId}")
    public ResponseEntity<List<Map<String, Object>>> listarComentarios(
            @PathVariable Integer postId) {

        String sql = """
            SELECT
                c.id,
                c.conteudo,
                c.data_comentario,
                u.id         AS autorId,
                u.username   AS autor,
                u.avatar_url AS avatar,
                COALESCE(SUM(v.valor), 0) AS votos
            FROM comentarios c
            JOIN usuarios u ON u.id = c.usuario_id
            LEFT JOIN votos v ON v.comentario_id = c.id
            WHERE c.post_id = ?
            GROUP BY c.id, c.conteudo, c.data_comentario, u.id, u.username, u.avatar_url
            ORDER BY votos DESC, c.data_comentario ASC
        """;

        List<Map<String, Object>> comentarios = jdbcTemplate.queryForList(sql, postId);
        if (comentarios.isEmpty()) return ResponseEntity.status(204).build();
        return ResponseEntity.status(200).body(comentarios);
    }

    // ── POST /comunidade/comentarios/{postId} ─────────
    @PostMapping("/comentarios/{postId}")
    public ResponseEntity<String> comentar(
            @PathVariable Integer postId,
            @RequestBody Map<String, Object> body) {

        Integer usuarioId = Integer.valueOf(body.get("usuarioId").toString());
        String conteudo   = (String) body.get("conteudo");

        if (conteudo == null || conteudo.isBlank())
            return ResponseEntity.badRequest().body("Comentário não pode ser vazio.");

        jdbcTemplate.update(
                "INSERT INTO comentarios (post_id, usuario_id, conteudo) VALUES (?, ?, ?)",
                postId, usuarioId, conteudo
        );
        return ResponseEntity.status(201).body("Comentário enviado!");
    }

    // ── DELETE /comunidade/comentarios/{id} ───────────
    @DeleteMapping("/comentarios/{id}")
    public ResponseEntity<String> removerComentario(
            @PathVariable Integer id,
            @RequestParam Integer usuarioId) {

        try {
            Integer dono = jdbcTemplate.queryForObject(
                    "SELECT usuario_id FROM comentarios WHERE id = ?",
                    Integer.class, id
            );
            if (!dono.equals(usuarioId))
                return ResponseEntity.status(403).body("Sem permissão para remover este comentário.");
        } catch (EmptyResultDataAccessException e) {
            return ResponseEntity.status(404).body("Comentário não encontrado.");
        }

        jdbcTemplate.update("DELETE FROM votos WHERE comentario_id = ?", id);
        jdbcTemplate.update("DELETE FROM comentarios WHERE id = ?", id);
        return ResponseEntity.status(200).body("Comentário removido!");
    }
}