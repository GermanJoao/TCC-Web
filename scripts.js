const { jsPDF } = window.jspdf;

document.addEventListener("DOMContentLoaded", () => {
    const lista = document.getElementById("curriculos");

    function carregarCurriculos() {
        lista.innerHTML = "";
        const curriculos = JSON.parse(localStorage.getItem("curriculos") || "[]");

        if (curriculos.length === 0) {
            lista.innerHTML = `
                <div class="vazio">
                    <img src="abelha.png" alt="Abelha" class="abelha">
                    <p>Não tem nada aqui ainda.</p>
                </div>
                <button id="btnAdicionar" class="btn">+ Novo Currículo</button>
            `;
            document.getElementById("btnAdicionar").addEventListener("click", novoCurriculo);
            return;
        }

        curriculos.forEach((c, i) => {
            const card = document.createElement("div");
            card.classList.add("card");

            card.innerHTML = `
                <div class="card-header">
                    <img src="abelha.png" alt="Foto">
                    <div>
                        <h3>${c.nome}</h3>
                        <span>${c.email} | ${c.telefone}</span>
                    </div>
                </div>
                <div class="card-info">
                    <strong>Resumo:</strong> ${c.resumo || "—"}
                </div>
                <div class="card-info extra" style="display:none;">
                    <p><strong>Experiência:</strong> ${c.experiencia || "—"}</p>
                    <p><strong>Habilidades:</strong> ${c.habilidades || "—"}</p>
                </div>
                <div class="toggle-btn">▼ Ver mais</div>
                <button class="edit-btn" onclick="editarCurriculo(${i})">Editar</button>
                <div style="margin-top:10px; display:flex; gap:8px; justify-content:flex-end;">
                    <button class="btn cancelar" onclick="excluirCurriculo(${i})">Excluir</button>
                    <button class="btn salvar" onclick="exportarPDF(${i})">Exportar</button>
                </div>
            `;

            // toggle de expandir
            const toggle = card.querySelector(".toggle-btn");
            const extra = card.querySelector(".extra");
            toggle.addEventListener("click", () => {
                if (extra.style.display === "none") {
                    extra.style.display = "block";
                    toggle.textContent = "▲ Ver menos";
                    card.classList.add("expandido");
                } else {
                    extra.style.display = "none";
                    toggle.textContent = "▼ Ver mais";
                    card.classList.remove("expandido");
                }
            });

            lista.appendChild(card);
        });

        // botão de adicionar currículo sempre aparece no fim
        const btn = document.createElement("button");
        btn.textContent = "+ Novo Currículo";
        btn.className = "btn";
        btn.addEventListener("click", novoCurriculo);
        lista.appendChild(btn);
    }

    function novoCurriculo() {
        const nome = prompt("Digite o nome:");
        const email = prompt("Digite o email:");
        const telefone = prompt("Digite o telefone:");
        const resumo = prompt("Digite um resumo:");
        const experiencia = prompt("Digite a experiência:");
        const habilidades = prompt("Digite as habilidades:");

        if (!nome) return;

        const curriculos = JSON.parse(localStorage.getItem("curriculos") || "[]");
        curriculos.push({ nome, email, telefone, resumo, experiencia, habilidades });
        localStorage.setItem("curriculos", JSON.stringify(curriculos));
        carregarCurriculos();
    }

    window.editarCurriculo = function (id) {
        const curriculos = JSON.parse(localStorage.getItem("curriculos") || "[]");
        const c = curriculos[id];

        const nome = prompt("Nome:", c.nome);
        const email = prompt("Email:", c.email);
        const telefone = prompt("Telefone:", c.telefone);
        const resumo = prompt("Resumo:", c.resumo);
        const experiencia = prompt("Experiência:", c.experiencia);
        const habilidades = prompt("Habilidades:", c.habilidades);

        curriculos[id] = { nome, email, telefone, resumo, experiencia, habilidades };
        localStorage.setItem("curriculos", JSON.stringify(curriculos));
        carregarCurriculos();
    };

    window.excluirCurriculo = function (id) {
        const curriculos = JSON.parse(localStorage.getItem("curriculos") || "[]");
        curriculos.splice(id, 1);
        localStorage.setItem("curriculos", JSON.stringify(curriculos));
        carregarCurriculos();
    };

    window.exportarPDF = function (id) {
        const curriculos = JSON.parse(localStorage.getItem("curriculos") || "[]");
        const c = curriculos[id];
        const doc = new jsPDF();
        doc.text(`Nome: ${c.nome}`, 10, 10);
        doc.text(`Email: ${c.email}`, 10, 20);
        doc.text(`Telefone: ${c.telefone}`, 10, 30);
        doc.text(`Resumo: ${c.resumo}`, 10, 40);
        doc.text(`Experiência: ${c.experiencia}`, 10, 60);
        doc.text(`Habilidades: ${c.habilidades}`, 10, 80);
        doc.save(`${c.nome}_curriculo.pdf`);
    };

    carregarCurriculos();
});
