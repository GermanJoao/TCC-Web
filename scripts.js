const { jsPDF } = window.jspdf;

document.addEventListener("DOMContentLoaded", () => {
    const lista = document.getElementById("curriculos");
    const btnNovo = document.getElementById("novoCurriculo");
    const modal = document.getElementById("modal");
    const form = document.getElementById("formCurriculo");

    function carregarCurriculos() {
    lista.innerHTML = "";
    const curriculos = JSON.parse(localStorage.getItem("curriculos") || "[]");

    if (curriculos.length === 0) {
        lista.innerHTML = `
            <div class="vazio">
                <img src="abelha.png" alt="Abelha" class="abelha">
                <p>Não tem nada aqui ainda.</p>
            </div>
        `;
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
}


    btnNovo.addEventListener("click", () => {
        document.getElementById("curriculoId").value = "";
        form.reset();
        modal.style.display = "block";
    });

    form.addEventListener("submit", e => {
        e.preventDefault();
        const curriculos = JSON.parse(localStorage.getItem("curriculos") || "[]");
        const id = document.getElementById("curriculoId").value;
        const novo = {
            nome: document.getElementById("nome").value,
            email: document.getElementById("email").value,
            telefone: document.getElementById("telefone").value,
            resumo: document.getElementById("resumo").value,
            experiencia: document.getElementById("experiencia").value,
            habilidades: document.getElementById("habilidades").value,
        };
        if (id === "") {
            curriculos.push(novo);
        } else {
            curriculos[id] = novo;
        }
        localStorage.setItem("curriculos", JSON.stringify(curriculos));
        fecharModal();
        carregarCurriculos();
    });

    window.editarCurriculo = function (id) {
        const curriculos = JSON.parse(localStorage.getItem("curriculos") || "[]");
        const c = curriculos[id];
        document.getElementById("curriculoId").value = id;
        document.getElementById("nome").value = c.nome;
        document.getElementById("email").value = c.email;
        document.getElementById("telefone").value = c.telefone;
        document.getElementById("resumo").value = c.resumo;
        document.getElementById("experiencia").value = c.experiencia;
        document.getElementById("habilidades").value = c.habilidades;
        modal.style.display = "block";
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

function fecharModal() {
    document.getElementById("modal").style.display = "none";
}
