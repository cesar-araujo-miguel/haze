package school.sptech.projetoindividual.model;

import java.time.LocalDateTime;

public class AvaliacaoImagem {

    private Integer id;
    private Integer usuarioId;
    private Integer postId;
    private Integer nota;
    private LocalDateTime dataAvaliacao;

    public AvaliacaoImagem() {}

    public AvaliacaoImagem(Integer id, Integer usuarioId, Integer postId,
                           Integer nota, LocalDateTime dataAvaliacao) {
        this.id = id;
        this.usuarioId = usuarioId;
        this.postId = postId;
        this.nota = nota;
        this.dataAvaliacao = dataAvaliacao;
    }

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public Integer getUsuarioId() { return usuarioId; }
    public void setUsuarioId(Integer usuarioId) { this.usuarioId = usuarioId; }

    public Integer getPostId() { return postId; }
    public void setPostId(Integer postId) { this.postId = postId; }

    public Integer getNota() { return nota; }
    public void setNota(Integer nota) { this.nota = nota; }

    public LocalDateTime getDataAvaliacao() { return dataAvaliacao; }
    public void setDataAvaliacao(LocalDateTime dataAvaliacao) { this.dataAvaliacao = dataAvaliacao; }
}