package school.sptech.projetoindividual.model;

public class Voto {

    private Integer id;
    private Integer usuarioId;
    private Integer postId;
    private Integer comentarioId;
    private Integer valor;

    public Voto() {}

    public Voto(Integer id, Integer usuarioId, Integer postId,
                Integer comentarioId, Integer valor) {
        this.id = id;
        this.usuarioId = usuarioId;
        this.postId = postId;
        this.comentarioId = comentarioId;
        this.valor = valor;
    }

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public Integer getUsuarioId() { return usuarioId; }
    public void setUsuarioId(Integer usuarioId) { this.usuarioId = usuarioId; }

    public Integer getPostId() { return postId; }
    public void setPostId(Integer postId) { this.postId = postId; }

    public Integer getComentarioId() { return comentarioId; }
    public void setComentarioId(Integer comentarioId) { this.comentarioId = comentarioId; }

    public Integer getValor() { return valor; }
    public void setValor(Integer valor) { this.valor = valor; }
}