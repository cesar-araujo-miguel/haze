
    window.addEventListener('scroll', () => {
      document.getElementById('header').classList.toggle('scrolled', window.scrollY > 50);
    }, { passive: true });

    // ── Carrossel de blocos ────────
    let blocoAtual = 0;
    const blocos = [
      { id: "blocos-1", titulo: "Desenvolvimento de jogos" },
      { id: "blocos-2", titulo: "Competências Socioemocionais" }
    ];

    function trocarBloco(direcao) {
      const anterior = blocoAtual;
      blocoAtual = (blocoAtual + direcao + blocos.length) % blocos.length;

      const blocoAnt = document.getElementById(blocos[anterior].id);
      const blocoNovo = document.getElementById(blocos[blocoAtual].id);

      blocoAnt.classList.add("saindo");
      setTimeout(() => {
        blocoAnt.classList.add("desativado");
        blocoAnt.classList.remove("saindo");
        blocoNovo.classList.remove("desativado");
        blocoNovo.classList.add("entrando");
        document.getElementById("carrossel-titulo").textContent = blocos[blocoAtual].titulo;
        setTimeout(() => blocoNovo.classList.remove("entrando"), 10);
      }, 350);
    }

    window.addEventListener("DOMContentLoaded", () => {
      if (window.location.hash === '#auth') {
        document.getElementById('auth')?.scrollIntoView({ behavior: 'smooth' });
      }
      blocos.forEach((b, i) => {
        const el = document.getElementById(b.id);
        if (i !== blocoAtual) el.classList.add("desativado");
        else el.classList.remove("desativado");
      });
      document.getElementById("carrossel-titulo").textContent = blocos[blocoAtual].titulo;
      carregarJogos();
    });



    (function () {
      const TILT_MAX = 7;
      const SCALE_ON = 1.03;
      const SCALE_OFF = 1;

      document.querySelectorAll('.blocos-item').forEach(card => {
        const shine = card.querySelector('.card-shine');

        card.addEventListener('mousemove', e => {
          const rect = card.getBoundingClientRect();
          const px = (e.clientX - rect.left) / rect.width;
          const py = (e.clientY - rect.top) / rect.height;

          const rotY = (px - 0.5) * TILT_MAX * 2;
          const rotX = -(py - 0.5) * TILT_MAX * 2;

          card.style.transform =
            `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(${SCALE_ON})`;
          card.classList.add('tilting');

          if (shine) {
            shine.style.background = `radial-gradient(
          circle at ${px * 100}% ${py * 100}%,
          rgba(255,255,255,0.10) 0%,
          rgba(255,255,255,0.03) 45%,
          transparent            68%
        )`;
          }
        });

        card.addEventListener('mouseleave', () => {
          card.style.transform =
            `perspective(900px) rotateX(0deg) rotateY(0deg) scale(${SCALE_OFF})`;
          card.classList.remove('tilting');
        });
      });
    })();

    // ── Auth tabs ────────
    function mostrarLogin() {
      document.getElementById("div-login").style.display = "flex";
      document.getElementById("div-cadastro").style.display = "none";
      document.getElementById("tab-login").classList.add("active");
      document.getElementById("tab-cadastro").classList.remove("active");
    }

    function mostrarCadastro() {
      document.getElementById("div-login").style.display = "none";
      document.getElementById("div-cadastro").style.display = "flex";
      document.getElementById("tab-login").classList.remove("active");
      document.getElementById("tab-cadastro").classList.add("active");
    }

    // ── Alerta ───────────
    function mostrarMensagem(texto, tipo = "info", loading = false) {
      const div = document.getElementById("mensagem-alerta");
      div.className = `alerta alerta-${tipo}`;
      if (loading) {
        div.innerHTML = `<span class="alerta-spin">⟳</span> ${texto}`;
      } else {
        div.textContent = texto;
      }
      div.style.display = "flex";
      if (!loading) {
        setTimeout(() => { div.style.display = "none"; }, 3500);
      }
    }

    window.addEventListener("DOMContentLoaded", function () {
      const aviso = sessionStorage.getItem("avisoLogin");
      if (aviso) {
        alert(aviso);
        mostrarLogin();
        sessionStorage.removeItem("avisoLogin");
      }
    });

    function delay(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

    async function logar() {
      const email = document.getElementById("login-email").value;
      const senha = document.getElementById("login-senha").value;

      if (!email || !senha) {
        mostrarMensagem("Preencha todos os campos!", "erro");
        return;
      }

      mostrarMensagem("Realizando login…", "info", true);

      try {
        const res = await fetch("http://localhost:8080/usuarios/autenticar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ emailServer: email, senhaServer: senha })
        });

        const texto = await res.text();

        if (res.status === 200) {
          const usuario = JSON.parse(texto);
          sessionStorage.setItem("usuario", JSON.stringify(usuario));
          mostrarMensagem(`Bem-vindo(a), ${usuario.username}!`, "sucesso", true);
          await delay(1500);
          window.location.href = "/comunidade.html";

        } else {
          mostrarMensagem(texto, "erro");
        }

      } catch (e) {
        mostrarMensagem("Erro ao conectar com o servidor.", "erro");
      }
    }


    // ── Cadastro ───────────
    async function cadastrar() {
      // ── Coleta valores ─────
      const nome = document.getElementById("cadastro-nome").value.trim();
      const usuario = document.getElementById("cadastro-usuario").value.trim();
      const email = document.getElementById("cadastro-email").value.trim();
      const senha = document.getElementById("cadastro-senha").value;
      const confirmar = document.getElementById("cadastro-confirmar").value;
      const nascimento = document.getElementById("cadastro-nascimento").value;
      const jogo = document.getElementById("cadastro-jogo").value;
      const horas = document.getElementById("cadastro-horas").value;
      const plataforma = document.querySelector('input[name="plataforma"]:checked')?.value;
      const generos = [...document.querySelectorAll('.checkbox-group input:checked')].map(i => i.value);

      // ── Validação client-side ────────
      const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      const usuarioValido = /^[^\s]{3,20}$/.test(usuario);
      const nascimentoValido = nascimento !== '' && (() => {
        const nasc = new Date(nascimento);
        const limite = new Date();
        limite.setFullYear(limite.getFullYear() - 13);
        return nasc <= limite;
      })();

      const checks = [
        { id: 'cadastro-nome', ok: nome.length >= 3 },
        { id: 'cadastro-usuario', ok: usuarioValido },
        { id: 'cadastro-email', ok: emailValido },
        { id: 'cadastro-senha', ok: senha.length >= 6 },
        { id: 'cadastro-confirmar', ok: senha === confirmar },
        { id: 'cadastro-nascimento', ok: nascimentoValido },
        { id: 'cadastro-jogo', ok: jogo !== '' },
        { id: 'cadastro-horas', ok: horas !== '' && Number(horas) >= 0 && Number(horas) <= 99999 },
      ];

      checks.forEach(({ id, ok }) => {
        const field = document.getElementById(id)?.closest('.field');
        if (field) field.classList.toggle('invalido', !ok);
      });

      const marcarGrupo = (seletor, valido) => {
        const field = document.querySelector(seletor)?.closest('.field');
        if (field) field.classList.toggle('invalido', !valido);
      };

      marcarGrupo('input[name="plataforma"]', !!plataforma);
      marcarGrupo('.checkbox-group input', generos.length > 0);

      const tudoValido = checks.every(c => c.ok) && !!plataforma && generos.length > 0;
      if (!tudoValido) {
        document.querySelector('.field.invalido')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }

      // ── Envio ────
      mostrarMensagem("Realizando cadastro…", "info", true);

      try {
        const res = await fetch("http://localhost:8080/usuarios/cadastrar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            emailServer: email,
            senhaServer: senha,
            nomeServer: usuario,
            nomeCompleto: nome,
            nascimentoServer: nascimento,
            plataformaServer: plataforma,
            generosServer: generos,
            jogoServer: jogo,
            horasServer: horas,
          })
        });

        const texto = await res.text();

        if (res.status === 201) {
          mostrarMensagem(texto, "sucesso");
          await delay(1500);
          mostrarLogin();
        } else {
          mostrarMensagem(texto, "erro");
        }

      } catch (e) {
        mostrarMensagem("Erro ao conectar com o servidor.", "erro");
      }
    }

    async function carregarJogos() {
      const select = document.getElementById("cadastro-jogo");
      try {
        const res = await fetch("http://localhost:8080/jogos");
        const jogos = await res.json();
        select.innerHTML = '<option value="" disabled selected>Selecione um jogo</option>';
        jogos.forEach(jogo => {
          const opt = document.createElement("option");
          opt.value = jogo.id;
          opt.textContent = jogo.nome;
          select.appendChild(opt);
        });
      } catch {
        select.innerHTML = '<option value="" disabled selected>Erro ao carregar jogos</option>';
      }
    }
  