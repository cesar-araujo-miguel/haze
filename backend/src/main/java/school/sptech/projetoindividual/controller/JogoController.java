package school.sptech.projetoindividual.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.BeanPropertyRowMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;
import school.sptech.projetoindividual.model.Jogo;

import java.util.List;

@RestController
@RequestMapping("/jogos")
@CrossOrigin(origins = {"http://localhost:3333", "http://127.0.0.1:3333"})
public class JogoController {

    private final JdbcTemplate jdbcTemplate;

    public JogoController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @GetMapping()
    public ResponseEntity<List<Jogo>> listar() {
        String sql = "SELECT id, nome FROM jogos ORDER BY nome";
        List<Jogo> jogos = jdbcTemplate.query(sql, new BeanPropertyRowMapper<>(Jogo.class));
        if (jogos.isEmpty()) return ResponseEntity.status(204).build();
        return ResponseEntity.status(200).body(jogos);
    }
}