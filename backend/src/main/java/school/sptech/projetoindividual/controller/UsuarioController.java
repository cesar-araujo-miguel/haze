package school.sptech.projetoindividual.controller;

import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.BeanPropertyRowMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;
import school.sptech.projetoindividual.model.Usuario;

import java.time.LocalDate;
import java.time.Period;
import java.util.List;
import java.util.Map;
import org.springframework.web.multipart.MultipartFile;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@RestController
@RequestMapping("/usuarios")
@CrossOrigin(origins = {"http://localhost:3333", "http://127.0.0.1:3333"})
public class UsuarioController {

    private final JdbcTemplate jdbcTemplate;

    public UsuarioController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @PostMapping("/cadastrar")
    public ResponseEntity<String> cadastrar(@RequestBody Map<String, Object> body) {

        // ── Coleta ───────────────────────────────────────
        String username      = (String) body.get("nomeServer");
        String email         = (String) body.get("emailServer");
        String senha         = (String) body.get("senhaServer");
        String nomeCompleto  = (String) body.get("nomeCompleto");
        String nascimentoStr = (String) body.get("nascimentoServer");
        String plataforma    = (String) body.get("plataformaServer");
        Object jogoIdObj     = body.get("jogoServer");
        Object horasObj      = body.get("horasServer");

        @SuppressWarnings("unchecked")
        List<String> generos = (List<String>) body.get("generosServer");

        // ── Validação ────────────────────────────────────
        if (username == null || username.isBlank())
            return ResponseEntity.badRequest().body("Usuário inválido.");

        if (email == null || !email.matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$"))
            return ResponseEntity.badRequest().body("E-mail inválido.");

        if (senha == null || senha.length() < 6)
            return ResponseEntity.badRequest().body("Senha deve ter pelo menos 6 caracteres.");

        if (nomeCompleto == null || nomeCompleto.isBlank())
            return ResponseEntity.badRequest().body("Nome completo inválido.");

        if (nascimentoStr == null || nascimentoStr.isBlank())
            return ResponseEntity.badRequest().body("Data de nascimento inválida.");

        LocalDate nascimento = LocalDate.parse(nascimentoStr);
        if (Period.between(nascimento, LocalDate.now()).getYears() < 13)
            return ResponseEntity.badRequest().body("Você deve ter pelo menos 13 anos.");

        if (plataforma == null || plataforma.isBlank())
            return ResponseEntity.badRequest().body("Plataforma inválida.");

        if (generos == null || generos.isEmpty())
            return ResponseEntity.badRequest().body("Selecione ao menos um gênero.");

        // ── Verifica duplicatas ──────────────────────────
        Integer countEmail = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM usuarios WHERE email = ?", Integer.class, email);
        if (countEmail != null && countEmail > 0)
            return ResponseEntity.badRequest().body("E-mail já cadastrado.");

        Integer countUser = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM usuarios WHERE username = ?", Integer.class, username);
        if (countUser != null && countUser > 0)
            return ResponseEntity.badRequest().body("Usuário já cadastrado.");

        // ── Insert ───────────────────────────────────────
        String sql = """
            INSERT INTO usuarios
                (username, email, senha, nome_completo, nascimento,
                 plataforma, generos, jogo_id, horas_jogo)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """;

        Integer jogoId    = jogoIdObj != null ? Integer.valueOf(jogoIdObj.toString()) : null;
        Integer horasJogo = horasObj  != null ? Integer.valueOf(horasObj.toString())  : null;

        jdbcTemplate.update(sql,
                username,
                email,
                senha,
                nomeCompleto,
                nascimento,
                plataforma,
                String.join(",", generos),
                jogoId,
                horasJogo
        );

        return ResponseEntity.status(201).body("Cadastro realizado com sucesso!");
    }


    @PostMapping("/autenticar")
    public ResponseEntity<?> autenticar(@RequestBody Map<String, Object> body) {

        String email = (String) body.get("emailServer");
        String senha = (String) body.get("senhaServer");

        if (email == null || email.isBlank() || senha == null || senha.isBlank())
            return ResponseEntity.badRequest().body("Preencha todos os campos.");

        try {
            String sql = "SELECT * FROM usuarios WHERE email = ? AND senha = ?";
            Usuario usuario = jdbcTemplate.queryForObject(
                    sql,
                    new BeanPropertyRowMapper<>(Usuario.class),
                    email, senha
            );
            return ResponseEntity.status(200).body(usuario);

        } catch (EmptyResultDataAccessException e) {
            return ResponseEntity.status(401).body("E-mail ou senha incorretos.");
        }
    }

    // ── GET /usuarios/{id} ────────────────────────────────
    @GetMapping("/{id}")
    public ResponseEntity<?> buscarPorId(@PathVariable Integer id) {
        try {
            String sql = """
            SELECT
                u.id, u.username, u.email, u.nome_completo,
                u.nascimento, u.plataforma, u.generos,
                u.horas_jogo, u.avatar_url, u.bio,
                j.id   AS jogo_id,
                j.nome AS jogo_nome
            FROM usuarios u
            LEFT JOIN jogos j ON j.id = u.jogo_id
            WHERE u.id = ?
        """;
            Map<String, Object> usuario = jdbcTemplate.queryForMap(sql, id);
            return ResponseEntity.ok(usuario);
        } catch (EmptyResultDataAccessException e) {
            return ResponseEntity.status(404).body("Usuário não encontrado.");
        }
    }

    // ── GET /usuarios/{id}/posts ──────────────────────────
    @GetMapping("/{id}/posts")
    public ResponseEntity<List<Map<String, Object>>> postsPorUsuario(@PathVariable Integer id) {
        String sql = """
        SELECT
            p.id, p.tipo, p.titulo, p.conteudo,
            p.imagem_url, p.data_postagem,
            c.nome AS categoria,
            COALESCE(SUM(v.valor), 0)     AS votos,
            ROUND(AVG(a.nota), 1)         AS media_avaliacao
        FROM posts p
        LEFT JOIN categorias c          ON c.id = p.categoria_id
        LEFT JOIN votos v               ON v.post_id = p.id
        LEFT JOIN avaliacoes_imagens a  ON a.post_id = p.id
        WHERE p.usuario_id = ?
        GROUP BY p.id, p.tipo, p.titulo, p.conteudo, p.imagem_url, p.data_postagem, c.nome
        ORDER BY p.data_postagem DESC
    """;
        List<Map<String, Object>> posts = jdbcTemplate.queryForList(sql, id);
        if (posts.isEmpty()) return ResponseEntity.status(204).build();
        return ResponseEntity.ok(posts);
    }

    // ── PUT /usuarios/{id} ────────────────────────────────
    @PutMapping("/{id}")
    public ResponseEntity<String> atualizar(
            @PathVariable Integer id,
            @RequestParam(required = false) String username,
            @RequestParam(required = false) String bio,
            @RequestParam(required = false) String plataforma,
            @RequestParam(required = false) String generos,
            @RequestParam(required = false) Integer jogoId,
            @RequestParam(required = false) Integer horasJogo,
            @RequestParam(required = false) MultipartFile avatar) {

        // Verifica se usuário existe
        Integer count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM usuarios WHERE id = ?", Integer.class, id
        );
        if (count == null || count == 0)
            return ResponseEntity.status(404).body("Usuário não encontrado.");

        // Verifica se username já está em uso por outro usuário
        if (username != null && !username.isBlank()) {
            Integer countUser = jdbcTemplate.queryForObject(
                    "SELECT COUNT(*) FROM usuarios WHERE username = ? AND id != ?",
                    Integer.class, username, id
            );
            if (countUser != null && countUser > 0)
                return ResponseEntity.badRequest().body("Usuário já está em uso.");
        }

        // Salva avatar se enviado
        String avatarUrl = null;
        if (avatar != null && !avatar.isEmpty()) {
            String extensao = avatar.getOriginalFilename() != null
                    ? avatar.getOriginalFilename().substring(avatar.getOriginalFilename().lastIndexOf('.'))
                    : ".jpg";
            String nomeArquivo = "pfp_" + id + "_" + System.currentTimeMillis() + extensao;
            try {
                Path pasta = Paths.get("../../frontend/public/assets/pfp/");
                Files.createDirectories(pasta);
                avatar.transferTo(new File(pasta.toAbsolutePath() + "/" + nomeArquivo));
                avatarUrl = "/assets/pfp/" + nomeArquivo;
            } catch (IOException e) {
                return ResponseEntity.status(500).body("Erro ao salvar avatar.");
            }
        }

        // Monta SQL dinamicamente
        StringBuilder sql = new StringBuilder("UPDATE usuarios SET ");
        List<Object> params = new java.util.ArrayList<>();

        if (username  != null && !username.isBlank())  { sql.append("username = ?, ");   params.add(username); }
        if (bio       != null)                          { sql.append("bio = ?, ");         params.add(bio); }
        if (plataforma!= null && !plataforma.isBlank()) { sql.append("plataforma = ?, ");  params.add(plataforma); }
        if (generos   != null)                          { sql.append("generos = ?, ");      params.add(generos); }
        if (jogoId    != null)                          { sql.append("jogo_id = ?, ");      params.add(jogoId); }
        if (horasJogo != null)                          { sql.append("horas_jogo = ?, ");   params.add(horasJogo); }
        if (avatarUrl != null)                          { sql.append("avatar_url = ?, ");   params.add(avatarUrl); }

        if (params.isEmpty())
            return ResponseEntity.badRequest().body("Nenhum campo para atualizar.");

        // Remove última vírgula e espaço
        sql.delete(sql.length() - 2, sql.length());
        sql.append(" WHERE id = ?");
        params.add(id);

        jdbcTemplate.update(sql.toString(), params.toArray());
        return ResponseEntity.ok("Perfil atualizado com sucesso!");
    }
}