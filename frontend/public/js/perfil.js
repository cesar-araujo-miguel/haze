
const API = 'http://localhost:8080';

// ── Autenticação ───
const usuarioStr = sessionStorage.getItem('usuario');
if (!usuarioStr) { window.location.href = 'index.html'; }
const usuarioLogado = JSON.parse(usuarioStr);

// ── Nav ────
const navPerfil = document.getElementById('nav-perfil');
navPerfil.innerHTML = `<img class="nav-avatar" src="${usuarioLogado.avatarUrl || '/assets/pfp/default.png'}" alt=""> ${usuarioLogado.username}`;

// ── Header ───
window.addEventListener('scroll', () => {
    document.getElementById('header').classList.toggle('scrolled', window.scrollY > 10);
}, { passive: true });

// ── Alerta ───
function mostrarAlerta(texto, tipo = 'info') {
    const el = document.getElementById('alerta');
    el.textContent = texto;
    el.className = `alerta alerta-${tipo}`;
    el.style.display = 'flex';
    setTimeout(() => { el.style.display = 'none'; }, 3500);
}

// ── Carrega perfil ───
let perfilAtual = null;

async function carregarPerfil() {
    try {
        const res = await fetch(`${API}/usuarios/${usuarioLogado.id}`);
        const data = await res.json();
        perfilAtual = data;
        renderizarPerfil(data);
        carregarPosts();
    } catch (e) {
        mostrarAlerta('Erro ao carregar perfil.', 'erro');
    }
}

function renderizarPerfil(data) {
    document.getElementById('avatar-img').src = data.avatar_url || '/assets/pfp/default.png';
    document.getElementById('perfil-username').textContent = data.username || '—';
    document.getElementById('perfil-nome').textContent = data.nome_completo || '';
    document.getElementById('perfil-bio').textContent = data.bio || 'Sem bio definida.';

    // Tags de informação
    const tags = document.getElementById('perfil-tags');
    tags.innerHTML = '';

    const nascimento = data.nascimento
        ? new Date(data.nascimento).toLocaleDateString('pt-BR') : null;

    const infos = [
        data.plataforma ? { icone: '🎮', texto: data.plataforma } : null,
        data.jogo_nome ? { icone: '⭐', texto: data.jogo_nome } : null,
        data.horas_jogo ? { icone: '⏱️', texto: `${data.horas_jogo}h` } : null,
        nascimento ? { icone: '🎂', texto: nascimento } : null,
    ].filter(Boolean);

    infos.forEach(info => {
        const tag = document.createElement('span');
        tag.className = 'perfil-tag';
        tag.innerHTML = `${info.icone} ${info.texto}`;
        tags.appendChild(tag);
    });

    // Gêneros
    if (data.generos) {
        data.generos.split(',').forEach(g => {
            const tag = document.createElement('span');
            tag.className = 'perfil-tag perfil-tag-genero';
            tag.textContent = g.trim();
            tags.appendChild(tag);
        });
    }

    // Botão editar (só para o próprio usuário)
    document.getElementById('btn-editar').style.display = 'flex';
    document.getElementById('avatar-edit-btn').style.display = 'flex';
}

// ── Preview do avatar ──
document.getElementById('avatar-file').addEventListener('change', function () {
    const file = this.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => { document.getElementById('avatar-img').src = e.target.result; };
    reader.readAsDataURL(file);
});

// ── Edição ───
async function carregarJogosSelect() {
    try {
        const res = await fetch(`${API}/jogos`);
        if (!res.ok) return;
        const jogos = await res.json();
        const select = document.getElementById('edit-jogo');
        jogos.forEach(j => {
            const opt = document.createElement('option');
            opt.value = j.id;
            opt.textContent = j.nome;
            select.appendChild(opt);
        });
    } catch (e) { }
}

function preencherFormulario(data) {
    document.getElementById('edit-username').value = data.username || '';
    document.getElementById('edit-bio').value = data.bio || '';
    document.getElementById('edit-horas').value = data.horas_jogo || '';

    // Plataforma
    document.querySelectorAll('input[name="plataforma"]').forEach(radio => {
        radio.checked = radio.value === data.plataforma;
    });

    // Gêneros
    const generosAtivos = (data.generos || '').split(',').map(g => g.trim());
    document.querySelectorAll('#edit-generos input[type="checkbox"]').forEach(cb => {
        cb.checked = generosAtivos.includes(cb.value);
    });

    // Jogo favorito
    if (data.jogo_id) {
        document.getElementById('edit-jogo').value = data.jogo_id;
    }
}

document.getElementById('btn-editar').addEventListener('click', async () => {
    await carregarJogosSelect();
    preencherFormulario(perfilAtual);
    document.getElementById('perfil-form').style.display = 'block';
    document.getElementById('perfil-form').scrollIntoView({ behavior: 'smooth', block: 'start' });
});

document.getElementById('btn-cancelar').addEventListener('click', () => {
    document.getElementById('perfil-form').style.display = 'none';
});

document.getElementById('btn-salvar').addEventListener('click', async () => {
    const username = document.getElementById('edit-username').value.trim();
    const bio = document.getElementById('edit-bio').value.trim();
    const horas = document.getElementById('edit-horas').value;
    const jogoId = document.getElementById('edit-jogo').value;
    const plataforma = document.querySelector('input[name="plataforma"]:checked')?.value || '';
    const generos = [...document.querySelectorAll('#edit-generos input:checked')].map(i => i.value).join(',');
    const avatarFile = document.getElementById('avatar-file').files[0];

    if (!username) { mostrarAlerta('O usuário não pode ser vazio!', 'erro'); return; }

    const formData = new FormData();
    formData.append('username', username);
    formData.append('bio', bio);
    formData.append('plataforma', plataforma);
    formData.append('generos', generos);
    if (jogoId) formData.append('jogoId', jogoId);
    if (horas) formData.append('horasJogo', horas);
    if (avatarFile) formData.append('avatar', avatarFile);

    try {
        const res = await fetch(`${API}/usuarios/${usuarioLogado.id}`, {
            method: 'PUT',
            body: formData
        });
        const texto = await res.text();
        mostrarAlerta(texto, res.ok ? 'sucesso' : 'erro');

        if (res.ok) {
            // Recarrega perfil do backend e atualiza sessionStorage
            const resAtual = await fetch(`${API}/usuarios/${usuarioLogado.id}`);
            const dadosNovos = await resAtual.json();
            sessionStorage.setItem('usuario', JSON.stringify(dadosNovos));
            document.getElementById('perfil-form').style.display = 'none';
            renderizarPerfil(dadosNovos);
            perfilAtual = dadosNovos;
            // Atualiza nav
            navPerfil.innerHTML = `<img class="nav-avatar" src="${dadosNovos.avatar_url || '/assets/pfp/default.png'}" alt=""> ${dadosNovos.username}`;
        }
    } catch (e) {
        mostrarAlerta('Erro ao salvar alterações.', 'erro');
    }
});

// ── Posts do usuário ───
async function carregarPosts() {
    try {
        const res = await fetch(`${API}/usuarios/${usuarioLogado.id}/posts`);
        if (res.status === 204) {
            document.getElementById('mural-empty').style.display = 'flex';
            document.getElementById('forum-empty').style.display = 'flex';
            return;
        }
        const posts = await res.json();
        const mural = posts.filter(p => p.tipo === 'mural');
        const forum = posts.filter(p => p.tipo === 'forum');
        renderizarMuralPerfil(mural);
        renderizarForumPerfil(forum);
    } catch (e) {
        mostrarAlerta('Erro ao carregar posts.', 'erro');
    }
}

function renderizarMuralPerfil(posts) {
    const lista = document.getElementById('lista-mural-perfil');
    const empty = document.getElementById('mural-empty');
    if (posts.length === 0) { empty.style.display = 'flex'; return; }
    lista.innerHTML = posts.map(post => `
        <div class="perfil-card-img">
          <div class="perfil-img-wrapper">
            <img src="${post.imagem_url}" alt="${post.titulo || ''}">
          </div>
          <div class="perfil-img-info">
            <span>${post.titulo || '—'}</span>
            <span class="perfil-img-nota">${post.media_avaliacao ? post.media_avaliacao + ' ⭐' : '—'}</span>
          </div>
          <span class="perfil-post-data">${new Date(post.data_postagem).toLocaleDateString('pt-BR')}</span>
        </div>
      `).join('');
}

function renderizarForumPerfil(posts) {
    const lista = document.getElementById('lista-forum-perfil');
    const empty = document.getElementById('forum-empty');
    if (posts.length === 0) { empty.style.display = 'flex'; return; }
    lista.innerHTML = posts.map(post => `
        <li class="perfil-post-item">
          <div class="perfil-post-header">
            ${post.categoria ? `<span class="post-categoria">${post.categoria}</span>` : ''}
            <span class="perfil-post-data">${new Date(post.data_postagem).toLocaleDateString('pt-BR')}</span>
          </div>
          <h3 class="perfil-post-titulo">${post.titulo}</h3>
          <p class="perfil-post-conteudo">${post.conteudo}</p>
          <div class="perfil-post-footer">
            <span class="perfil-votos">${post.votos > 0 ? '▲' : post.votos < 0 ? '▼' : '—'} ${post.votos}</span>
          </div>
        </li>
      `).join('');
}

// ── Tabs de posts ──
document.querySelectorAll('.posts-tab').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.posts-tab').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const tab = btn.getAttribute('data-tab');
        document.getElementById('posts-mural').style.display = tab === 'mural' ? 'block' : 'none';
        document.getElementById('posts-forum').style.display = tab === 'forum' ? 'block' : 'none';
    });
});

// ── Init ───
carregarPerfil();
