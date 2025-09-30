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

// ===== EXPORTAR PDF ESTILO PROFISSIONAL DARK MODE =====
window.exportarPDF = function (id) {
    const curriculos = JSON.parse(localStorage.getItem("curriculos") || "[]");
    const c = curriculos[id];
    const doc = new jsPDF("p", "mm", "a4");

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    let y = 70; // começa abaixo do espaço reservado pra foto

    // ===== FUNÇÃO AUXILIAR PARA SEÇÕES =====
    function addSection(titulo, conteudo) {
        if (!conteudo) return;

        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.setTextColor("#daa7f6"); // secondary
        doc.text(titulo, margin, y);
        y += 6;

        doc.setDrawColor("#daa7f6"); // secondary
        doc.setLineWidth(0.8);
        doc.line(margin, y, pageWidth - margin, y);
        y += 8;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);
        doc.setTextColor("#eae9fc"); // text

        const linhas = doc.splitTextToSize(conteudo, pageWidth - 2 * margin);
        doc.text(linhas, margin, y);
        y += linhas.length * 6 + 12;
    }

    // ===== FUNDO ESCURO =====
    doc.setFillColor("#010104"); // fundo dark
    doc.rect(0, 0, pageWidth, pageHeight, "F");

    // ===== FOTO (RECORTE CIRCULAR) =====
    const fotoSize = 50; // tamanho da foto em mm
    if (c.foto) {
        const img = new Image();
        img.src = c.foto;
        img.onload = function () {
            const canvasSize = 300; // resolução maior pra evitar pixelização
            const canvas = document.createElement("canvas");
            canvas.width = canvasSize;
            canvas.height = canvasSize;
            const ctx = canvas.getContext("2d");

            // recorte circular
            ctx.beginPath();
            ctx.arc(canvasSize / 2, canvasSize / 2, canvasSize / 2, 0, Math.PI * 2, true);
            ctx.closePath();
            ctx.clip();

            ctx.drawImage(img, 0, 0, canvasSize, canvasSize);

            const circularImg = canvas.toDataURL("image/png");

            // adiciona no PDF no topo
            doc.addImage(circularImg, "PNG", pageWidth / 2 - fotoSize / 2, 10, fotoSize, fotoSize);

            // ajusta y inicial do texto abaixo da foto
            y = 10 + fotoSize + 15;

            adicionarConteudoEExportar();
        };
    } else {
        adicionarConteudoEExportar();
    }

    function adicionarConteudoEExportar() {
        // ===== NOME =====
        doc.setFont("helvetica", "bold");
        doc.setFontSize(22);
        doc.setTextColor("#ffbb00"); // primary
        const nomeQuebrado = doc.splitTextToSize(c.nome || "Seu Nome Completo", pageWidth - 2 * margin);
        doc.text(nomeQuebrado, pageWidth / 2, y, { align: "center" });
        y += nomeQuebrado.length * 8;

        // ===== CONTATO =====
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor("#eae9fc"); // text
        let contatos = [];
        if (c.email) contatos.push(`Email: ${c.email}`);
        if (c.telefone) contatos.push(`Tel: ${c.telefone}`);
        if (c.idade) contatos.push(`${c.idade} anos`);
        if (c.local) contatos.push(c.local);

        if (contatos.length > 0) {
            const contatosQuebrados = doc.splitTextToSize(contatos.join("  |  "), pageWidth - 2 * margin);
            doc.text(contatosQuebrados, pageWidth / 2, y, { align: "center" });
            y += contatosQuebrados.length * 6 + 5;

            doc.setDrawColor("#ff8400"); // accent
            doc.setLineWidth(0.5);
            doc.line(margin, y, pageWidth - margin, y);
            y += 15;
        }

        // ===== SEÇÕES =====
        addSection("Objetivo", c.objetivo);
        addSection("Experiência", c.experiencia);
        addSection("Estudando", c.formacao || c.estudando);
        addSection("Habilidades", c.habilidades);
        addSection("Destaques", c.excelencia);

        // ===== SALVAR PDF =====
        doc.save(`${c.nome || "curriculo"}_curriculo.pdf`);
    }
};

    carregarCurriculos();
});

function fecharModal() {
    document.getElementById("modal").style.display = "none";
}
