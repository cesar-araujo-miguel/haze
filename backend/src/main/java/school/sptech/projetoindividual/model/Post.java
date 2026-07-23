package school.sptech.projetoindividual.model;

import java.time.LocalDateTime;

public class Post {

    private Integer id;
    private Integer usuarioId;
    private String tipo;
    private String titulo;
    private String conteudo;
    private String imagemUrl;
    private Integer categoriaId;
    private LocalDateTime dataPostagem;

    public Post() {}

    public Post(Integer id, Integer usuarioId, String tipo, String titulo,
                String conteudo, String imagemUrl, Integer categoriaId,
                LocalDateTime dataPostagem) {
        this.id = id;
        this.usuarioId = usuarioId;
        this.tipo = tipo;
        this.titulo = titulo;
        this.conteudo = conteudo;
        this.imagemUrl = imagemUrl;
        this.categoriaId = categoriaId;
        this.dataPostagem = dataPostagem;
    }

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public Integer getUsuarioId() { return usuarioId; }
    public void setUsuarioId(Integer usuarioId) { this.usuarioId = usuarioId; }

    public String getTipo() { return tipo; }
    public void setTipo(String tipo) { this.tipo = tipo; }

    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }

    public String getConteudo() { return conteudo; }
    public void setConteudo(String conteudo) { this.conteudo = conteudo; }

    public String getImagemUrl() { return imagemUrl; }
    public void setImagemUrl(String imagemUrl) { this.imagemUrl = imagemUrl; }

    public Integer getCategoriaId() { return categoriaId; }
    public void setCategoriaId(Integer categoriaId) { this.categoriaId = categoriaId; }

    public LocalDateTime getDataPostagem() { return dataPostagem; }
    public void setDataPostagem(LocalDateTime dataPostagem) { this.dataPostagem = dataPostagem; }
}