package school.sptech.projetoindividual.model;

import java.time.LocalDate;

public class Usuario {

    private Integer id;
    private String username;
    private String email;
    private String senha;
    private String nomeCompleto;
    private LocalDate nascimento;
    private String plataforma;
    private String generos;
    private Integer jogoId;
    private Integer horasJogo;
    private String avatarUrl;
    private String bio;

    public Usuario() {}

    public Usuario(Integer id, String username, String email, String senha,
                   String nomeCompleto, LocalDate nascimento, String plataforma,
                   String generos, Integer jogoId, Integer horasJogo,
                   String steamId, String avatarUrl, String bio) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.senha = senha;
        this.nomeCompleto = nomeCompleto;
        this.nascimento = nascimento;
        this.plataforma = plataforma;
        this.generos = generos;
        this.jogoId = jogoId;
        this.horasJogo = horasJogo;
        this.avatarUrl = avatarUrl;
        this.bio = bio;
    }

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getSenha() { return senha; }
    public void setSenha(String senha) { this.senha = senha; }

    public String getNomeCompleto() { return nomeCompleto; }
    public void setNomeCompleto(String nomeCompleto) { this.nomeCompleto = nomeCompleto; }

    public LocalDate getNascimento() { return nascimento; }
    public void setNascimento(LocalDate nascimento) { this.nascimento = nascimento; }

    public String getPlataforma() { return plataforma; }
    public void setPlataforma(String plataforma) { this.plataforma = plataforma; }

    public String getGeneros() { return generos; }
    public void setGeneros(String generos) { this.generos = generos; }

    public Integer getJogoId() { return jogoId; }
    public void setJogoId(Integer jogoId) { this.jogoId = jogoId; }

    public Integer getHorasJogo() { return horasJogo; }
    public void setHorasJogo(Integer horasJogo) { this.horasJogo = horasJogo; }

    public String getAvatarUrl() { return avatarUrl; }
    public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }

    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }
}