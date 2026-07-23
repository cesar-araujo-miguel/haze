package school.sptech.projetoindividual.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.BeanPropertyRowMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;
import school.sptech.projetoindividual.model.Categoria;

import java.util.List;

@RestController
@RequestMapping("/categorias")
@CrossOrigin(origins = {"http://localhost:3333", "http://127.0.0.1:3333"})
public class CategoriaController {

    private final JdbcTemplate jdbcTemplate;

    public CategoriaController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @GetMapping
    public ResponseEntity<List<Categoria>> listar() {
        String sql = "SELECT id, nome FROM categorias ORDER BY nome";
        List<Categoria> categorias = jdbcTemplate.query(
                sql, new BeanPropertyRowMapper<>(Categoria.class)
        );
        if (categorias.isEmpty()) return ResponseEntity.status(204).build();
        return ResponseEntity.status(200).body(categorias);
    }
}