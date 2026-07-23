
const API = 'http://localhost:8080';

// ── Nav ────
const usuarioStr = sessionStorage.getItem('usuario');
const usuario = usuarioStr ? JSON.parse(usuarioStr) : null;
const navPerfil = document.getElementById('nav-perfil');
if (usuario) {
    navPerfil.innerHTML = `<img class="nav-avatar" src="${usuario.avatarUrl || '/assets/pfp/default.png'}" alt=""> ${usuario.username}`;
} else {
    navPerfil.textContent = 'Participar';
    navPerfil.href = 'index.html';
}

// ── Header shrink ────────
window.addEventListener('scroll', () => {
    document.getElementById('header').classList.toggle('scrolled', window.scrollY > 10);
}, { passive: true });

// ── Chart.js defaults ────
Chart.defaults.font.family = "'Space Grotesk', sans-serif";
Chart.defaults.color = '#888A87';

const CORES = ['#FB9CA3', '#7EB8F7', '#7EDCB0', '#F7D97E', '#C49EF7', '#F7A97E'];

// ── Estatísticas gerais ──
async function carregarEstatisticas() {
    try {
        const res = await fetch(`${API}/dashboard/estatisticas`);
        const data = await res.json();
        document.getElementById('stat-usuarios').textContent = data.total_usuarios ?? '—';
        document.getElementById('stat-imagens').textContent = data.total_imagens ?? '—';
        document.getElementById('stat-posts').textContent = data.total_posts ?? '—';
        document.getElementById('stat-comentarios').textContent = data.total_comentarios ?? '—';
        document.getElementById('stat-upvotes').textContent = data.total_upvotes ?? '—';
        document.getElementById('stat-downvotes').textContent = data.total_downvotes ?? '—';
    } catch (e) { console.error('Erro ao carregar estatísticas:', e); }
}

// ── Usuários mais ativos ─────────
async function carregarUsuariosAtivos() {
    const ul = document.getElementById('usuariosAtivos');
    try {
        const res = await fetch(`${API}/dashboard/usuarios-ativos`);
        if (res.status === 204) { ul.innerHTML = '<li class="empty">Nenhum dado ainda.</li>'; return; }
        const data = await res.json();
        ul.innerHTML = data.map((u, i) => `
          <li class="ranking-item">
            <span class="ranking-pos">${i + 1}</span>
            <img src="${u.avatar_url || '/assets/pfp/default.png'}" class="ranking-avatar" alt="">
            <span class="ranking-nome">${u.username}</span>
            <span class="ranking-valor">${u.total_posts} posts</span>
          </li>
        `).join('');
    } catch (e) { ul.innerHTML = '<li class="empty">Erro ao carregar.</li>'; }
}

// ── Top imagens ──────────
async function carregarTopImagens() {
    const div = document.getElementById('topImagens');
    try {
        const res = await fetch(`${API}/dashboard/top-imagens`);
        if (res.status === 204) { div.innerHTML = '<p class="empty">Nenhuma imagem avaliada ainda.</p>'; return; }
        const data = await res.json();
        div.innerHTML = data.map(img => `
          <div class="imagem-card">
            <div class="imagem-thumb-wrapper">
              <img src="${img.imagem_url}" alt="${img.titulo || ''}">
            </div>
            <div class="imagem-info">
              <span class="imagem-titulo">${img.titulo || '—'}</span>
              <span class="imagem-nota">⭐ ${img.media_avaliacao ?? '—'}</span>
            </div>
            <span class="imagem-autor">por ${img.autor}</span>
          </div>
        `).join('');
    } catch (e) { div.innerHTML = '<p class="empty">Erro ao carregar.</p>'; }
}

// ── Atividade recente ────
async function carregarAtividadeRecente() {
    const ul = document.getElementById('atividadeRecente');
    try {
        const res = await fetch(`${API}/dashboard/atividade-recente`);
        if (res.status === 204) { ul.innerHTML = '<li class="empty">Nenhuma atividade ainda.</li>'; return; }
        const data = await res.json();
        const icones = { mural: '🎨', forum: '💬', comentario: '📝' };
        ul.innerHTML = data.map(a => `
          <li class="atividade-item">
            <span class="atividade-icone">${icones[a.tipo] || '📌'}</span>
            <div class="atividade-body">
              <span class="atividade-desc">${a.descricao}</span>
              <span class="atividade-meta">por <strong>${a.autor}</strong> · ${new Date(a.data).toLocaleDateString('pt-BR')}</span>
            </div>
          </li>
        `).join('');
    } catch (e) { ul.innerHTML = '<li class="empty">Erro ao carregar.</li>'; }
}

// ── Gráfico: Posts por usuário (barras horizontal) ─
async function carregarGraficoPosts() {
    try {
        const res = await fetch(`${API}/dashboard/posts-por-usuario`);
        if (res.status === 204) return;
        const data = await res.json();
        new Chart(document.getElementById('chartPosts'), {
            type: 'bar',
            data: {
                labels: data.map(u => u.username),
                datasets: [{
                    label: 'Posts',
                    data: data.map(u => u.total_posts),
                    backgroundColor: CORES,
                    borderColor: '#111',
                    borderWidth: 2,
                    borderRadius: 6,
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                plugins: { legend: { display: false } },
                scales: {
                    x: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.06)' }, ticks: { precision: 0 } },
                    y: { grid: { display: false } }
                }
            }
        });
    } catch (e) { console.error('Erro ao carregar gráfico posts:', e); }
}

// ── Gráfico: Distribuição de avaliações (pizza) ────
async function carregarGraficoAvaliacoes() {
    try {
        const res = await fetch(`${API}/dashboard/distribuicao-avaliacoes`);
        if (res.status === 204) return;
        const data = await res.json();
        new Chart(document.getElementById('chartAvaliacoes'), {
            type: 'doughnut',
            data: {
                labels: data.map(d => `${d.nota} ⭐`),
                datasets: [{
                    data: data.map(d => d.quantidade),
                    backgroundColor: CORES,
                    borderColor: '#111',
                    borderWidth: 2,
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { position: 'bottom', labels: { padding: 16, boxWidth: 14 } }
                },
                cutout: '60%'
            }
        });
    } catch (e) { console.error('Erro ao carregar gráfico avaliações:', e); }
}

// ── Gráfico: Upvotes vs Downvotes (pizza) ──────────
async function carregarGraficoVotos() {
    try {
        const res = await fetch(`${API}/dashboard/votos`);
        const data = await res.json();
        new Chart(document.getElementById('chartVotos'), {
            type: 'doughnut',
            data: {
                labels: ['Upvotes', 'Downvotes'],
                datasets: [{
                    data: [data.upvotes || 0, data.downvotes || 0],
                    backgroundColor: ['#7EDCB0', '#FB9CA3'],
                    borderColor: '#111',
                    borderWidth: 2,
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { position: 'bottom', labels: { padding: 16, boxWidth: 14 } }
                },
                cutout: '60%'
            }
        });
    } catch (e) { console.error('Erro ao carregar gráfico votos:', e); }
}

// ── Init ───
carregarEstatisticas();
carregarUsuariosAtivos();
carregarTopImagens();
carregarAtividadeRecente();
carregarGraficoPosts();
carregarGraficoAvaliacoes();
carregarGraficoVotos();
