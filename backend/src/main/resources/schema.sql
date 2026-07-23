CREATE DATABASE IF NOT EXISTS haze;
USE haze;

CREATE TABLE jogos (
                       id   INT AUTO_INCREMENT PRIMARY KEY,
                       nome VARCHAR(100) NOT NULL
);

CREATE TABLE usuarios (
                          id            INT AUTO_INCREMENT PRIMARY KEY,
                          username      VARCHAR(100)  NOT NULL UNIQUE,
                          email         VARCHAR(100)  NOT NULL UNIQUE,
                          senha         VARCHAR(255)  NOT NULL,
                          nome_completo VARCHAR(150),
                          nascimento    DATE,
                          plataforma    VARCHAR(20),
                          generos       VARCHAR(200),
                          jogo_id       INT,
                          horas_jogo    INT,
                          avatar_url    VARCHAR(255)  DEFAULT '/assets/pfp/default.png',
                          bio           VARCHAR(300),
                          FOREIGN KEY (jogo_id) REFERENCES jogos(id)
);

CREATE TABLE categorias (
                            id   INT AUTO_INCREMENT PRIMARY KEY,
                            nome VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE posts (
                       id            INT AUTO_INCREMENT PRIMARY KEY,
                       usuario_id    INT           NOT NULL,
                       tipo          ENUM('mural', 'forum') NOT NULL,
                       titulo        VARCHAR(100),
                       conteudo      TEXT,
                       imagem_url    VARCHAR(255),
                       categoria_id  INT,
                       data_postagem DATETIME      DEFAULT CURRENT_TIMESTAMP,
                       FOREIGN KEY (usuario_id)   REFERENCES usuarios(id) ON DELETE CASCADE,
                       FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE CASCADE
);

CREATE TABLE comentarios (
                             id              INT AUTO_INCREMENT PRIMARY KEY,
                             post_id         INT  NOT NULL,
                             usuario_id      INT  NOT NULL,
                             conteudo        TEXT NOT NULL,
                             data_comentario DATETIME DEFAULT CURRENT_TIMESTAMP,
                             FOREIGN KEY (post_id)    REFERENCES posts(id),
                             FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

CREATE TABLE votos (
                       id             INT AUTO_INCREMENT PRIMARY KEY,
                       usuario_id     INT  NOT NULL,
                       post_id        INT,
                       comentario_id  INT,
                       valor          TINYINT NOT NULL CHECK (valor IN (-1, 1)),
                       UNIQUE (usuario_id, post_id),
                       UNIQUE (usuario_id, comentario_id),
                       CHECK (
                           (post_id IS NOT NULL AND comentario_id IS NULL) OR
                           (post_id IS NULL AND comentario_id IS NOT NULL)
                           ),
                       FOREIGN KEY (usuario_id)    REFERENCES usuarios(id) ON DELETE CASCADE,
                       FOREIGN KEY (post_id)       REFERENCES posts(id) ON DELETE CASCADE,
                       FOREIGN KEY (comentario_id) REFERENCES comentarios(id) ON DELETE CASCADE
);

CREATE TABLE avaliacoes_imagens (
                                    id             INT AUTO_INCREMENT PRIMARY KEY,
                                    usuario_id     INT     NOT NULL,
                                    post_id        INT     NOT NULL,
                                    nota           TINYINT NOT NULL CHECK (nota BETWEEN 1 AND 5),
                                    data_avaliacao DATETIME DEFAULT CURRENT_TIMESTAMP,
                                    UNIQUE (usuario_id, post_id),
                                    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
                                    FOREIGN KEY (post_id)    REFERENCES posts(id) ON DELETE CASCADE
);

CREATE TABLE pontuacoes_jogo (
                                 id             INT AUTO_INCREMENT PRIMARY KEY,
                                 usuario_id     INT   NOT NULL,
                                 pontuacao      INT   NOT NULL,
                                 tempo_segundos FLOAT,
                                 data_registro  DATETIME DEFAULT CURRENT_TIMESTAMP,
                                 FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

INSERT INTO jogos (nome) VALUES
                             ('Celeste'), ('Hollow Knight'), ('Undertale'), ('Dandara'),
                             ('Horizon Chase Turbo'), ('Journey'), ('Gris'),
                             ('Dead Cells'), ('Stardew Valley'), ('Minecraft');

INSERT INTO categorias (nome) VALUES
                                  ('Discussão'), ('Dica'), ('Review'), ('Notícia'), ('Pergunta');

INSERT INTO usuarios (id, username, email, senha, nome_completo, nascimento, plataforma, generos, jogo_id, horas_jogo, avatar_url, bio)
VALUES (1, 'Binhozord', 'cesar@email.com', 123456, 'César Miguel', '2006-04-21', 'pc', 'rpg,fps,estrategia', 10, 305, '/assets/pfp/default.png', NULL);


DROP USER IF EXISTS 'haze'@'%';
CREATE USER 'haze'@'%' IDENTIFIED BY 'Sptech#2024';
GRANT ALL PRIVILEGES ON haze.* TO 'haze'@'%';
FLUSH PRIVILEGES;

select * from usuarios;

