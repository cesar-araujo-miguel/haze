
    const API = 'http://localhost:8080';

    const usuarioStr = sessionStorage.getItem('usuario');
    const usuario = usuarioStr ? JSON.parse(usuarioStr) : null;

    const navPerfil = document.getElementById('nav-perfil');
    if (usuario) {
      navPerfil.innerHTML = `<img class="nav-avatar" src="${usuario.avatarUrl || '/assets/pfp/default.png'}" alt=""> ${usuario.username}`;
    } else {
      navPerfil.textContent = 'Participar';
      navPerfil.href = 'index.html';
    }

    window.addEventListener('scroll', () => {
      document.getElementById('header').classList.toggle('scrolled', window.scrollY > 10);
    }, { passive: true });

    function mostrarAlerta(texto, tipo = 'info') {
      const el = document.getElementById('alerta');
      el.textContent = texto;
      el.className = `alerta alerta-${tipo}`;
      el.style.display = 'flex';
      setTimeout(() => { el.style.display = 'none'; }, 3500);
    }

    function abrirModal(html) {
      document.getElementById('modalBody').innerHTML = html;
      document.getElementById('modal').classList.add('active');
    }

    function fecharModal() {
      document.getElementById('modal').classList.remove('active');
      document.getElementById('modalBody').innerHTML = '';
    }

    document.getElementById('fecharModal').addEventListener('click', fecharModal);
    document.getElementById('modal').addEventListener('click', e => {
      if (e.target === document.getElementById('modal')) fecharModal();
    });

    function exigirLogin() {
      abrirModal(`
        <div style="text-align:center; padding:1rem 0;">
          <div style="font-size:2.5rem; margin-bottom:1rem;">🔒</div>
          <h3 style="margin-bottom:0.75rem;">Faça parte da comunidade</h3>
          <p style="color:var(--grey); font-size:0.95rem; margin-bottom:1.5rem;">
            Para postar, avaliar e interagir você precisa ter uma conta HAZE.
          </p>
          <div style="display:flex; gap:0.75rem; justify-content:center; flex-wrap:wrap;">
            <a href="index.html#auth" class="btn btn-primary">Criar conta</a>
            <a href="index.html#auth" class="btn btn-ghost" style="border:2.5px solid var(--dark);">Fazer login</a>
          </div>
        </div>
      `);
    }

    // ═════════
    // MURAL
    // ═════════
    async function carregarMural() {
      const ordenar = document.getElementById('ordenar').value;
      try {
        const resp = await fetch(`${API}/posts/mural?ordenar=${ordenar}`);
        if (resp.status === 204) { renderizarMural([]); return; }
        renderizarMural(await resp.json());
      } catch (e) {
        mostrarAlerta('Erro ao carregar o mural.', 'erro');
      }
    }

    function renderizarMural(posts) {
      const lista = document.getElementById('lista-mural');
      const empty = document.getElementById('mural-empty');
      lista.querySelectorAll('.card-imagem').forEach(c => c.remove());

      if (posts.length === 0) { empty.style.display = 'flex'; return; }
      empty.style.display = 'none';

      posts.forEach(post => {
        const card = document.createElement('div');
        card.className = 'card-imagem';
        card.setAttribute('data-titulo', post.titulo || '');
        card.innerHTML = `
          ${usuario && usuario.id === post.autorId
            ? `<button class="btn-remover" data-id="${post.id}" title="Remover">🗑️</button>` : ''}
          <div class="card-img-wrapper">
            <img src="${post.imagem}" alt="${post.titulo || ''}">
          </div>
          <div class="card-info">
            <p class="card-titulo">${post.titulo || ''}</p>
            <div class="card-meta">
              <img src="${post.avatar || '/assets/pfp/default.png'}" class="avatar" alt="">
              <span>${post.autor}</span>
              <span class="card-nota">${post.media_avaliacao ? post.media_avaliacao + ' ⭐' : '—'}</span>
            </div>
            <div class="avaliacao" data-id="${post.id}">
              <select class="select-avaliacao">
                <option value="">Avaliar ⭐</option>
                <option value="1">1 ⭐</option>
                <option value="2">2 ⭐</option>
                <option value="3">3 ⭐</option>
                <option value="4">4 ⭐</option>
                <option value="5">5 ⭐</option>
              </select>
              <button class="btn-avaliar btn btn-primary btn-sm">Enviar</button>
            </div>
          </div>
        `;
        lista.appendChild(card);
      });

      lista.querySelectorAll('.select-avaliacao').forEach(sel => {
        sel.addEventListener('click', e => e.stopPropagation());
      });

      lista.querySelectorAll('.btn-avaliar').forEach(btn => {
        btn.addEventListener('click', async e => {
          e.stopPropagation();
          if (!usuario) { exigirLogin(); return; }
          const div = btn.closest('.avaliacao');
          const postId = div.getAttribute('data-id');
          const nota = div.querySelector('.select-avaliacao').value;
          if (!nota) { mostrarAlerta('Selecione uma nota!', 'erro'); return; }
          try {
            const res = await fetch(`${API}/comunidade/avaliar/${postId}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ usuarioId: usuario.id, nota: parseInt(nota) })
            });
            mostrarAlerta(await res.text(), res.ok ? 'sucesso' : 'erro');
            carregarMural();
          } catch (e) { mostrarAlerta('Erro ao enviar avaliação.', 'erro'); }
        });
      });

      lista.querySelectorAll('.btn-remover').forEach(btn => {
        btn.addEventListener('click', async e => {
          e.stopPropagation();
          if (!confirm('Remover esta arte?')) return;
          const postId = btn.getAttribute('data-id');
          try {
            const res = await fetch(`${API}/posts/mural/${postId}?usuarioId=${usuario.id}`, { method: 'DELETE' });
            mostrarAlerta(await res.text(), res.ok ? 'sucesso' : 'erro');
            carregarMural();
          } catch (e) { mostrarAlerta('Erro ao remover arte.', 'erro'); }
        });
      });

      lista.querySelectorAll('.card-imagem').forEach(card => {
        card.addEventListener('click', e => {
          if (e.target.closest('.avaliacao') || e.target.closest('.btn-remover')) return;
          const src = card.querySelector('.card-img-wrapper img').src;
          const titulo = card.getAttribute('data-titulo');
          abrirModal(`<h3>${titulo}</h3><img src="${src}" alt="${titulo}" style="width:100%; border-radius:12px; margin-top:1rem;">`);
        });
      });
    }

    document.getElementById('novaPostagemMural').addEventListener('click', () => {
      if (!usuario) { exigirLogin(); return; }
      abrirModal(`
        <h3>Nova Arte</h3>
        <div class="modal-form">
          <div class="field">
            <label>Título</label>
            <input type="text" id="artTitle" placeholder="Título da arte" maxlength="100">
          </div>
          <div class="field">
            <label>Imagem</label>
            <input type="file" id="artImage" accept="image/*">
          </div>
          <button class="btn btn-primary btn-full" id="salvarArte">Publicar</button>
        </div>
      `);

      document.getElementById('salvarArte').addEventListener('click', async () => {
        const titulo = document.getElementById('artTitle').value.trim();
        const file = document.getElementById('artImage').files[0];
        if (!titulo) { mostrarAlerta('Informe um título!', 'erro'); return; }
        if (!file)   { mostrarAlerta('Selecione uma imagem!', 'erro'); return; }
        const formData = new FormData();
        formData.append('titulo', titulo);
        formData.append('usuarioId', usuario.id);
        formData.append('imagem', file);
        try {
          const res = await fetch(`${API}/posts/mural`, { method: 'POST', body: formData });
          const texto = await res.text();
          mostrarAlerta(texto, res.status === 201 ? 'sucesso' : 'erro');
          if (res.status === 201) { fecharModal(); carregarMural(); }
        } catch (e) { mostrarAlerta('Erro ao publicar arte.', 'erro'); }
      });
    });

    // ═════════
    // FÓRUM
    // ═════════
    async function carregarCategorias() {
      try {
        const res = await fetch(`${API}/categorias`);
        if (!res.ok) return;
        const cats = await res.json();
        const select = document.getElementById('filtro-categoria');
        cats.forEach(cat => {
          const opt = document.createElement('option');
          opt.value = cat.id;
          opt.textContent = cat.nome;
          select.appendChild(opt);
        });
      } catch (e) { console.error('Erro ao carregar categorias:', e); }
    }

    async function carregarForum() {
      const ordenar = document.getElementById('ordenar').value;
      const categoriaId = document.getElementById('filtro-categoria').value;
      const params = new URLSearchParams({ ordenar });
      if (categoriaId) params.append('categoriaId', categoriaId);
      try {
        const resp = await fetch(`${API}/posts/forum?${params}`);
        if (resp.status === 204) { renderizarForum([]); return; }
        renderizarForum(await resp.json());
      } catch (e) { mostrarAlerta('Erro ao carregar o fórum.', 'erro'); }
    }

    function renderizarForum(posts) {
      const lista = document.getElementById('lista-forum');
      const empty = document.getElementById('forum-empty');
      lista.querySelectorAll('.post-item').forEach(p => p.remove());

      if (posts.length === 0) { empty.style.display = 'flex'; return; }
      empty.style.display = 'none';

      posts.forEach(post => {
        const li = document.createElement('li');
        li.className = 'post-item';
        li.setAttribute('data-titulo', post.titulo);
        li.setAttribute('data-id', post.id);
        li.innerHTML = `
          <div class="post-votos">
            <button class="btn-voto upvote" data-id="${post.id}" data-valor="1">▲</button>
            <span class="voto-count">${post.votos || 0}</span>
            <button class="btn-voto downvote" data-id="${post.id}" data-valor="-1">▼</button>
          </div>
          <div class="post-body">
            <div class="post-header">
              <div class="post-meta">
                <img src="${post.avatar || '/assets/pfp/default.png'}" class="avatar" alt="">
                <span class="post-autor">${post.autor}</span>
                ${post.categoria ? `<span class="post-categoria">${post.categoria}</span>` : ''}
                <span class="post-data">${new Date(post.data_postagem).toLocaleDateString('pt-BR')}</span>
              </div>
              ${usuario && usuario.id === post.autorId ? `
                <div class="post-acoes">
                  <button class="btn-editar-forum btn btn-ghost btn-sm" data-id="${post.id}">✏️ Editar</button>
                  <button class="btn-remover-forum btn btn-ghost btn-sm" data-id="${post.id}">🗑️ Remover</button>
                </div>` : ''}
            </div>
            <h3 class="post-titulo">${post.titulo}</h3>
            <p class="post-conteudo">${post.conteudo}</p>
            <div class="post-footer">
              <button class="btn-comentarios btn btn-ghost btn-sm" data-id="${post.id}">
                💬 ${post.total_comentarios || 0} comentários
              </button>
            </div>
            <div class="comentarios-section" id="comentarios-${post.id}" style="display:none;"></div>
          </div>
        `;
        lista.appendChild(li);
      });

      lista.querySelectorAll('.btn-voto').forEach(btn => {
        btn.addEventListener('click', async e => {
          e.stopPropagation();
          if (!usuario) { exigirLogin(); return; }
          const postId = btn.getAttribute('data-id');
          const valor  = parseInt(btn.getAttribute('data-valor'));
          try {
            const res = await fetch(`${API}/comunidade/votar/${postId}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ usuarioId: usuario.id, valor })
            });
            mostrarAlerta(await res.text(), res.ok ? 'sucesso' : 'erro');
            carregarForum();
          } catch (e) { mostrarAlerta('Erro ao votar.', 'erro'); }
        });
      });

      lista.querySelectorAll('.btn-comentarios').forEach(btn => {
        btn.addEventListener('click', async e => {
          e.stopPropagation();
          const postId = btn.getAttribute('data-id');
          const section = document.getElementById(`comentarios-${postId}`);
          if (section.style.display !== 'none') { section.style.display = 'none'; return; }
          section.style.display = 'block';
          await carregarComentarios(postId, section);
        });
      });

      lista.querySelectorAll('.btn-remover-forum').forEach(btn => {
        btn.addEventListener('click', async e => {
          e.stopPropagation();
          if (!confirm('Remover este post?')) return;
          const postId = btn.getAttribute('data-id');
          try {
            const res = await fetch(`${API}/posts/forum/${postId}?usuarioId=${usuario.id}`, { method: 'DELETE' });
            mostrarAlerta(await res.text(), res.ok ? 'sucesso' : 'erro');
            carregarForum();
          } catch (e) { mostrarAlerta('Erro ao remover post.', 'erro'); }
        });
      });

      lista.querySelectorAll('.btn-editar-forum').forEach(btn => {
        btn.addEventListener('click', e => {
          e.stopPropagation();
          const postId   = btn.getAttribute('data-id');
          const li       = btn.closest('.post-item');
          const titulo   = li.querySelector('.post-titulo').textContent;
          const conteudo = li.querySelector('.post-conteudo').textContent;

          abrirModal(`
            <h3>Editar Discussão</h3>
            <div class="modal-form">
              <div class="field">
                <label>Título</label>
                <input type="text" id="editTitulo" value="${titulo}" maxlength="100">
              </div>
              <div class="field">
                <label>Conteúdo</label>
                <textarea id="editConteudo" rows="6">${conteudo}</textarea>
              </div>
              <button class="btn btn-primary btn-full" id="salvarEdicao">Salvar</button>
            </div>
          `);

          document.getElementById('salvarEdicao').addEventListener('click', async () => {
            const novoTitulo   = document.getElementById('editTitulo').value.trim();
            const novoConteudo = document.getElementById('editConteudo').value.trim();
            if (!novoTitulo || !novoConteudo) { mostrarAlerta('Preencha todos os campos!', 'erro'); return; }
            try {
              const res = await fetch(`${API}/posts/forum/${postId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ titulo: novoTitulo, conteudo: novoConteudo, usuarioId: usuario.id })
              });
              mostrarAlerta(await res.text(), res.ok ? 'sucesso' : 'erro');
              if (res.ok) { fecharModal(); carregarForum(); }
            } catch (e) { mostrarAlerta('Erro ao editar post.', 'erro'); }
          });
        });
      });
    }

    async function carregarComentarios(postId, section) {
      try {
        const res = await fetch(`${API}/comunidade/comentarios/${postId}`);
        const comentarios = res.status === 204 ? [] : await res.json();

        section.innerHTML = `
          <ul class="lista-comentarios">
            ${comentarios.length === 0
              ? '<li class="comentario-empty">Nenhum comentário ainda.</li>'
              : comentarios.map(c => `
                <li class="comentario-item">
                  <div class="comentario-votos">
                    <button class="btn-voto-comentario" data-id="${c.id}" data-valor="1">▲</button>
                    <span>${c.votos || 0}</span>
                    <button class="btn-voto-comentario" data-id="${c.id}" data-valor="-1">▼</button>
                  </div>
                  <div class="comentario-body">
                    <div class="comentario-meta">
                      <img src="${c.avatar || '/assets/pfp/default.png'}" class="avatar" alt="">
                      <span class="post-autor">${c.autor}</span>
                      <span class="post-data">${new Date(c.data_comentario).toLocaleDateString('pt-BR')}</span>
                    </div>
                    <p>${c.conteudo}</p>
                    ${usuario && usuario.id === c.autorId
                      ? `<button class="btn-remover-comentario btn btn-ghost btn-sm" data-id="${c.id}">🗑️</button>`
                      : ''}
                  </div>
                </li>
              `).join('')}
          </ul>
          ${usuario ? `
            <div class="novo-comentario">
              <textarea id="novo-comentario-${postId}" placeholder="Escreva um comentário..." rows="3"></textarea>
              <button class="btn btn-primary btn-sm" id="enviar-comentario-${postId}">Comentar</button>
            </div>
          ` : `<p class="comentario-empty"><a href="index.html#auth">Faça login</a> para comentar.</p>`}
        `;

        section.querySelectorAll('.btn-voto-comentario').forEach(btn => {
          btn.addEventListener('click', async () => {
            if (!usuario) { exigirLogin(); return; }
            const comentarioId = btn.getAttribute('data-id');
            const valor = parseInt(btn.getAttribute('data-valor'));
            try {
              await fetch(`${API}/comunidade/votar/comentario/${comentarioId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ usuarioId: usuario.id, valor })
              });
              await carregarComentarios(postId, section);
            } catch (e) { mostrarAlerta('Erro ao votar.', 'erro'); }
          });
        });

        section.querySelectorAll('.btn-remover-comentario').forEach(btn => {
          btn.addEventListener('click', async () => {
            if (!confirm('Remover comentário?')) return;
            const comentarioId = btn.getAttribute('data-id');
            try {
              await fetch(`${API}/comunidade/comentarios/${comentarioId}?usuarioId=${usuario.id}`, { method: 'DELETE' });
              await carregarComentarios(postId, section);
            } catch (e) { mostrarAlerta('Erro ao remover comentário.', 'erro'); }
          });
        });

        const btnEnviar = document.getElementById(`enviar-comentario-${postId}`);
        if (btnEnviar) {
          btnEnviar.addEventListener('click', async () => {
            const conteudo = document.getElementById(`novo-comentario-${postId}`).value.trim();
            if (!conteudo) { mostrarAlerta('Escreva um comentário!', 'erro'); return; }
            try {
              const res = await fetch(`${API}/comunidade/comentarios/${postId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ usuarioId: usuario.id, conteudo })
              });
              mostrarAlerta(await res.text(), res.status === 201 ? 'sucesso' : 'erro');
              await carregarComentarios(postId, section);
            } catch (e) { mostrarAlerta('Erro ao comentar.', 'erro'); }
          });
        }

      } catch (e) { mostrarAlerta('Erro ao carregar comentários.', 'erro'); }
    }

    document.getElementById('novaPostagemForum').addEventListener('click', async () => {
      if (!usuario) { exigirLogin(); return; }

      let opcoesCategoria = '<option value="">Sem categoria</option>';
      try {
        const res = await fetch(`${API}/categorias`);
        if (res.ok) {
          const cats = await res.json();
          opcoesCategoria += cats.map(c => `<option value="${c.id}">${c.nome}</option>`).join('');
        }
      } catch (e) {}

      abrirModal(`
        <h3>Nova Discussão</h3>
        <div class="modal-form">
          <div class="field">
            <label>Título</label>
            <input type="text" id="postTitle" placeholder="Sobre o que é?" maxlength="100">
          </div>
          <div class="field">
            <label>Categoria</label>
            <select id="postCategoria">${opcoesCategoria}</select>
          </div>
          <div class="field">
            <label>Conteúdo</label>
            <textarea id="postContent" rows="6" placeholder="Escreva sua mensagem..."></textarea>
          </div>
          <button class="btn btn-primary btn-full" id="salvarPost">Publicar</button>
        </div>
      `);

      document.getElementById('salvarPost').addEventListener('click', async () => {
        const titulo      = document.getElementById('postTitle').value.trim();
        const conteudo    = document.getElementById('postContent').value.trim();
        const categoriaId = document.getElementById('postCategoria').value || null;
        if (!titulo || !conteudo) { mostrarAlerta('Preencha todos os campos!', 'erro'); return; }
        try {
          const res = await fetch(`${API}/posts/forum`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ titulo, conteudo, usuarioId: usuario.id, categoriaId })
          });
          const texto = await res.text();
          mostrarAlerta(texto, res.status === 201 ? 'sucesso' : 'erro');
          if (res.status === 201) { fecharModal(); carregarForum(); }
        } catch (e) { mostrarAlerta('Erro ao publicar discussão.', 'erro'); }
      });
    });

    // ── Tabs ───
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const tab = btn.getAttribute('data-tab');
        document.querySelectorAll('.conteudo-tab').forEach(c => c.style.display = 'none');
        document.getElementById(tab).style.display = 'block';
        if (tab === 'mural') carregarMural();
        if (tab === 'forum') carregarForum();
      });
    });

    // ── Busca ──
    document.getElementById('busca').addEventListener('input', e => {
      const termo = e.target.value.toLowerCase();
      document.querySelectorAll('.conteudo-tab').forEach(tab => {
        if (tab.style.display === 'none') return;
        tab.querySelectorAll('.post-item, .card-imagem').forEach(item => {
          const texto = item.getAttribute('data-titulo')?.toLowerCase() || '';
          item.style.display = texto.includes(termo) ? '' : 'none';
        });
      });
    });

    // ── Ordenar ──
    document.getElementById('ordenar').addEventListener('change', () => {
      const tabAtiva = document.querySelector('.tab-btn.active').getAttribute('data-tab');
      if (tabAtiva === 'mural') carregarMural();
      if (tabAtiva === 'forum') carregarForum();
    });

    // ── Filtro categoria ──
    document.getElementById('filtro-categoria').addEventListener('change', carregarForum);

    // ── Init ───
    carregarCategorias();
    carregarMural();
 