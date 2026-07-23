package school.sptech.projetoindividual.model;

import java.time.LocalDateTime;

public class Comentario {

    private Integer id;
    private Integer postId;
    private Integer usuarioId;
    private String conteudo;
    private LocalDateTime dataComentario;

    public Comentario() {}

    public Comentario(Integer id, Integer postId, Integer usuarioId,
                      String conteudo, LocalDateTime dataComentario) {
        this.id = id;
        this.postId = postId;
        this.usuarioId = usuarioId;
        this.conteudo = conteudo;
        this.dataComentario = dataComentario;
    }

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public Integer getPostId() { return postId; }
    public void setPostId(Integer postId) { this.postId = postId; }

    public Integer getUsuarioId() { return usuarioId; }
    public void setUsuarioId(Integer usuarioId) { this.usuarioId = usuarioId; }

    public String getConteudo() { return conteudo; }
    public void setConteudo(String conteudo) { this.conteudo = conteudo; }

    public LocalDateTime getDataComentario() { return dataComentario; }
    public void setDataComentario(LocalDateTime dataComentario) { this.dataComentario = dataComentario; }
}