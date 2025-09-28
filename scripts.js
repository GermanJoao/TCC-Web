const { jsPDF } = window.jspdf;

document.addEventListener("DOMContentLoaded", () => {
    const lista = document.getElementById("curriculos");
    const btnNovo = document.getElementById("novoCurriculo");
    const modal = document.getElementById("modal");
    const form = document.getElementById("formCurriculo");
    const fotoInput = document.getElementById("foto");
    const preview = document.getElementById("previewFoto");

    let fotoBase64 = "";

    // Preview da imagem ao selecionar
    fotoInput.addEventListener("change", () => {
        const file = fotoInput.files[0];
        if (!file) return;
        const ext = file.name.split(".").pop().toLowerCase();
        if (ext === "gif" || ext === "bmp") {
            alert("GIF e BMP não são permitidos. Use JPG, PNG ou WebP.");
            fotoInput.value = "";
            preview.style.display = "none";
            fotoBase64 = "";
            return;
        }

        const reader = new FileReader();
        reader.onload = e => {
            fotoBase64 = e.target.result;
            preview.src = fotoBase64;
            preview.style.display = "block";
        };
        reader.readAsDataURL(file);
    });

    function carregarCurriculos() {
        lista.innerHTML = "";
        const curriculos = JSON.parse(localStorage.getItem("curriculos") || "[]");

        if (curriculos.length === 0) {
            lista.innerHTML = `
                <div class="vazio">
                    <img src="abelha.png" alt="Abelha" class="abelha">
                </div>
            `;
            return;
        }

        curriculos.forEach((c, i) => {
            const card = document.createElement("div");
            card.classList.add("card");

            card.innerHTML = `
                <div class="card-header">
                    <img src="${c.foto || "abelha.png"}" alt="Foto">
                    <div>
                        <h3>${c.nome}</h3>
                        <span>${c.idade ? c.idade + " anos | " : ""}${c.email} | ${c.telefone}</span>
                    </div>
                </div>
                <div class="card-info">
                    <p><strong>Excelência:</strong> ${c.excelencia || "—"}</p>
                    <p><strong>Estudando:</strong> ${c.estudando || "—"}</p>
                    <p><strong>Objetivo:</strong> ${c.objetivo || "—"}</p>
                </div>
                <div class="card-info extra" style="display:none;">
                    <p><strong>Experiência:</strong> ${c.experiencia || "—"}</p>
                    <p><strong>Habilidades:</strong> ${c.habilidades || "—"}</p>
                </div>
                <div class="toggle-btn">▼ Ver mais</div>
                <div style="margin-top:10px; display:flex; gap:8px; justify-content:flex-end;">
                    <button class="btn editar" onclick="editarCurriculo(${i})">Editar</button>
                    <button class="btn cancelar" onclick="excluirCurriculo(${i})">Excluir</button>
                    <button class="btn salvar" onclick="exportarPDF(${i})">Exportar</button>
                </div>
            `;

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
        fotoBase64 = "";
        preview.style.display = "none";
        modal.style.display = "block";
    });

    form.addEventListener("submit", e => {
        e.preventDefault();
        const curriculos = JSON.parse(localStorage.getItem("curriculos") || "[]");
        const id = document.getElementById("curriculoId").value;
        const novo = {
            foto: fotoBase64,
            nome: document.getElementById("nome").value,
            idade: document.getElementById("idade").value,
            email: document.getElementById("email").value,
            telefone: document.getElementById("telefone").value,
            excelencia: document.getElementById("excelencia").value,
            estudando: document.getElementById("estudando").value,
            objetivo: document.getElementById("objetivo").value,
            experiencia: document.getElementById("experiencia").value,
            habilidades: document.getElementById("habilidades").value,
        };
        if (id === "") curriculos.push(novo);
        else curriculos[id] = novo;
        localStorage.setItem("curriculos", JSON.stringify(curriculos));
        fecharModal();
        carregarCurriculos();
    });

    window.editarCurriculo = function (id) {
        const curriculos = JSON.parse(localStorage.getItem("curriculos") || "[]");
        const c = curriculos[id];
        document.getElementById("curriculoId").value = id;
        document.getElementById("nome").value = c.nome || "";
        document.getElementById("idade").value = c.idade || "";
        document.getElementById("email").value = c.email || "";
        document.getElementById("telefone").value = c.telefone || "";
        document.getElementById("excelencia").value = c.excelencia || "";
        document.getElementById("estudando").value = c.estudando || "";
        document.getElementById("objetivo").value = c.objetivo || "";
        document.getElementById("experiencia").value = c.experiencia || "";
        document.getElementById("habilidades").value = c.habilidades || "";
        fotoBase64 = c.foto || "";
        if (fotoBase64) {
            preview.src = fotoBase64;
            preview.style.display = "block";
        } else preview.style.display = "none";
        modal.style.display = "block";
    };

    window.excluirCurriculo = function (id) {
        const curriculos = JSON.parse(localStorage.getItem("curriculos") || "[]");
        curriculos.splice(id, 1);
        localStorage.setItem("curriculos", JSON.stringify(curriculos));
        carregarCurriculos();
    };

// ===== EXPORTAR PDF BÁSICO E PROFISSIONAL =====
window.exportarPDF = function (id) {
    const curriculos = JSON.parse(localStorage.getItem("curriculos") || "[]");
    const c = curriculos[id];
    const doc = new jsPDF();

    // ===== NOME NO TOPO =====
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(0, 0, 0);
    doc.text(c.nome || "Nome", 105, 20, { align: "center" });

    // ===== FOTO =====
    if (c.foto) {
        doc.addImage(c.foto, "PNG", 160, 10, 40, 40);
        // borda circular simples
        doc.setDrawColor(100, 100, 100);
        doc.setLineWidth(0.8);
        doc.circle(180, 30, 20, "S");
    }

    // ===== INFORMAÇÕES DE CONTATO =====
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    let y = 40;
    if (c.idade) doc.text(`Idade: ${c.idade} anos`, 10, y);
    if (c.email) { y += 7; doc.text(`Email: ${c.email}`, 10, y); }
    if (c.telefone) { y += 7; doc.text(`Telefone: ${c.telefone}`, 10, y); }

    // ===== LINHA DIVISÓRIA =====
    y += 10;
    doc.setDrawColor(150, 150, 150);
    doc.setLineWidth(0.5);
    doc.line(10, y, 200, y);
    y += 10;

    // ===== SEÇÕES =====
    const campos = [
        { label: "Objetivo", value: c.objetivo },
        { label: "Experiência", value: c.experiencia },
        { label: "Habilidades", value: c.habilidades },
        { label: "Estudos", value: c.estudando },
        { label: "Destaques", value: c.excelencia },
    ];

    campos.forEach(campo => {
        if (!campo.value) return;

        // título da seção
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.text(campo.label, 10, y);

        // conteúdo da seção
        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);
        const linhas = doc.splitTextToSize(campo.value, 190);
        doc.text(linhas, 10, y + 6);
        y += linhas.length * 6 + 10;
    });

    // ===== SALVAR PDF =====
    doc.save(`${c.nome || "curriculo"}_curriculo.pdf`);
};

    carregarCurriculos();
});

function fecharModal() {
    document.getElementById("modal").style.display = "none";
}
