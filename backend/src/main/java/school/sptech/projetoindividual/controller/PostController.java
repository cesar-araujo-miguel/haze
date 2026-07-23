package school.sptech.projetoindividual.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.BeanPropertyRowMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import school.sptech.projetoindividual.model.Post;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/posts")
@CrossOrigin(origins = {"http://localhost:3333", "http://127.0.0.1:3333"})
public class PostController {

    private final JdbcTemplate jdbcTemplate;

    // Caminho da pasta public do frontend
    private static final String PASTA_MURAL = "../../frontend/public/assets/mural/";

    public PostController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    // ── GET /posts/mural ──────────────────────────────
    @GetMapping("/mural")
    public ResponseEntity<List<Map<String, Object>>> listarMural(
            @RequestParam(defaultValue = "recentes") String ordenar) {

        String ordem = switch (ordenar) {
            case "populares"  -> "media_avaliacao DESC";
            case "antigas"    -> "p.data_postagem ASC";
            default           -> "p.data_postagem DESC";
        };

        String sql = """
            SELECT
                p.id,
                p.titulo,
                p.imagem_url AS imagem,
                p.data_postagem,
                u.id         AS autorId,
                u.username   AS autor,
                u.avatar_url AS avatar,
                ROUND(AVG(a.nota), 1) AS media_avaliacao
            FROM posts p
            JOIN usuarios u ON u.id = p.usuario_id
            LEFT JOIN avaliacoes_imagens a ON a.post_id = p.id
            WHERE p.tipo = 'mural'
            GROUP BY p.id, p.titulo, p.imagem_url, p.data_postagem, u.id, u.username, u.avatar_url
            ORDER BY
            """ + ordem;

        List<Map<String, Object>> posts = jdbcTemplate.queryForList(sql);
        if (posts.isEmpty()) return ResponseEntity.status(204).build();
        return ResponseEntity.status(200).body(posts);
    }

    // ── POST /posts/mural ─────────────────────────────
    @PostMapping("/mural")
    public ResponseEntity<String> criarMural(
            @RequestParam("usuarioId") Integer usuarioId,
            @RequestParam("titulo") String titulo,
            @RequestParam("imagem") MultipartFile imagem) {

        if (titulo == null || titulo.isBlank())
            return ResponseEntity.badRequest().body("Informe um título.");

        if (imagem == null || imagem.isEmpty())
            return ResponseEntity.badRequest().body("Selecione uma imagem.");

        String extensao = imagem.getOriginalFilename() != null
                ? imagem.getOriginalFilename().substring(imagem.getOriginalFilename().lastIndexOf('.'))
                : ".jpg";
        String nomeArquivo = "mural_" + usuarioId + "_" + System.currentTimeMillis() + extensao;

        try {
            Path pasta = Paths.get(PASTA_MURAL);
            Files.createDirectories(pasta);
            imagem.transferTo(new File(pasta.toAbsolutePath() + "/" + nomeArquivo));
        } catch (IOException e) {
            return ResponseEntity.status(500).body("Erro ao salvar a imagem.");
        }

        String imagemUrl = "/assets/mural/" + nomeArquivo;

        jdbcTemplate.update("""
            INSERT INTO posts (usuario_id, tipo, titulo, imagem_url)
            VALUES (?, 'mural', ?, ?)
        """, usuarioId, titulo, imagemUrl);

        return ResponseEntity.status(201).body("Arte publicada com sucesso!");
    }

    // ── DELETE /posts/mural/{id} ──────────────────────
    @DeleteMapping("/mural/{id}")
    public ResponseEntity<String> removerMural(
            @PathVariable Integer id,
            @RequestParam Integer usuarioId) {

        Integer dono = jdbcTemplate.queryForObject(
                "SELECT usuario_id FROM posts WHERE id = ? AND tipo = 'mural'",
                Integer.class, id
        );

        if (dono == null)
            return ResponseEntity.status(404).body("Post não encontrado.");

        if (!dono.equals(usuarioId))
            return ResponseEntity.status(403).body("Sem permissão para remover este post.");

        jdbcTemplate.update("DELETE FROM avaliacoes_imagens WHERE post_id = ?", id);
        jdbcTemplate.update("DELETE FROM comentarios WHERE post_id = ?", id);
        jdbcTemplate.update("DELETE FROM posts WHERE id = ?", id);

        return ResponseEntity.status(200).body("Arte removida com sucesso!");
    }

    // ── GET /posts/forum ──────────────────────────────
    @GetMapping("/forum")
    public ResponseEntity<List<Map<String, Object>>> listarForum(
            @RequestParam(defaultValue = "recentes") String ordenar,
            @RequestParam(required = false) Integer categoriaId) {

        String ordem = switch (ordenar) {
            case "populares" -> "votos DESC";
            case "antigas"   -> "p.data_postagem ASC";
            default          -> "p.data_postagem DESC";
        };

        String filtroCategoria = categoriaId != null ? "AND p.categoria_id = " + categoriaId : "";

        String sql = """
            SELECT
                p.id,
                p.titulo,
                p.conteudo,
                p.data_postagem,
                u.id         AS autorId,
                u.username   AS autor,
                u.avatar_url AS avatar,
                c.nome       AS categoria,
                COALESCE(SUM(v.valor), 0) AS votos,
                COUNT(DISTINCT cm.id)     AS total_comentarios
            FROM posts p
            JOIN usuarios u ON u.id = p.usuario_id
            LEFT JOIN categorias c  ON c.id = p.categoria_id
            LEFT JOIN votos v       ON v.post_id = p.id
            LEFT JOIN comentarios cm ON cm.post_id = p.id
            WHERE p.tipo = 'forum'
            """ + filtroCategoria + """
            GROUP BY p.id, p.titulo, p.conteudo, p.data_postagem,
                     u.id, u.username, u.avatar_url, c.nome
            ORDER BY
            """ + ordem;

        List<Map<String, Object>> posts = jdbcTemplate.queryForList(sql);
        if (posts.isEmpty()) return ResponseEntity.status(204).build();
        return ResponseEntity.status(200).body(posts);
    }

    // ── POST /posts/forum ─────────────────────────────
    @PostMapping("/forum")
    public ResponseEntity<String> criarForum(@RequestBody Map<String, Object> body) {

        Integer usuarioId   = Integer.valueOf(body.get("usuarioId").toString());
        String titulo       = (String) body.get("titulo");
        String conteudo     = (String) body.get("conteudo");
        Object categoriaObj = body.get("categoriaId");

        if (titulo == null || titulo.isBlank())
            return ResponseEntity.badRequest().body("Informe um título.");

        if (conteudo == null || conteudo.isBlank())
            return ResponseEntity.badRequest().body("Informe o conteúdo.");

        Integer categoriaId = categoriaObj != null
                ? Integer.valueOf(categoriaObj.toString()) : null;

        jdbcTemplate.update("""
            INSERT INTO posts (usuario_id, tipo, titulo, conteudo, categoria_id)
            VALUES (?, 'forum', ?, ?, ?)
        """, usuarioId, titulo, conteudo, categoriaId);

        return ResponseEntity.status(201).body("Discussão publicada com sucesso!");
    }

    // ── PUT /posts/forum/{id} ─────────────────────────
    @PutMapping("/forum/{id}")
    public ResponseEntity<String> editarForum(
            @PathVariable Integer id,
            @RequestBody Map<String, Object> body) {

        Integer usuarioId = Integer.valueOf(body.get("usuarioId").toString());
        String titulo     = (String) body.get("titulo");
        String conteudo   = (String) body.get("conteudo");

        if (titulo == null || titulo.isBlank())
            return ResponseEntity.badRequest().body("Informe um título.");

        if (conteudo == null || conteudo.isBlank())
            return ResponseEntity.badRequest().body("Informe o conteúdo.");

        Integer dono = jdbcTemplate.queryForObject(
                "SELECT usuario_id FROM posts WHERE id = ? AND tipo = 'forum'",
                Integer.class, id
        );

        if (dono == null)
            return ResponseEntity.status(404).body("Post não encontrado.");

        if (!dono.equals(usuarioId))
            return ResponseEntity.status(403).body("Sem permissão para editar este post.");

        jdbcTemplate.update("""
            UPDATE posts SET titulo = ?, conteudo = ? WHERE id = ?
        """, titulo, conteudo, id);

        return ResponseEntity.status(200).body("Post atualizado com sucesso!");
    }

    // ── DELETE /posts/forum/{id} ──────────────────────
    @DeleteMapping("/forum/{id}")
    public ResponseEntity<String> removerForum(
            @PathVariable Integer id,
            @RequestParam Integer usuarioId) {

        Integer dono = jdbcTemplate.queryForObject(
                "SELECT usuario_id FROM posts WHERE id = ? AND tipo = 'forum'",
                Integer.class, id
        );

        if (dono == null)
            return ResponseEntity.status(404).body("Post não encontrado.");

        if (!dono.equals(usuarioId))
            return ResponseEntity.status(403).body("Sem permissão para remover este post.");

        jdbcTemplate.update("DELETE FROM votos WHERE post_id = ?", id);
        jdbcTemplate.update("DELETE FROM comentarios WHERE post_id = ?", id);
        jdbcTemplate.update("DELETE FROM posts WHERE id = ?", id);

        return ResponseEntity.status(200).body("Post removido com sucesso!");
    }
}