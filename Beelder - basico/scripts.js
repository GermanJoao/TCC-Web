const { jsPDF } = window.jspdf;

document.addEventListener("DOMContentLoaded", () => {
    const lista = document.getElementById("curriculos");
    const btnNovo = document.getElementById("novoCurriculo");
    const modal = document.getElementById("modal");
    const form = document.getElementById("formCurriculo");

    function carregarCurriculos() {
        lista.innerHTML = "";
        const curriculos = JSON.parse(localStorage.getItem("curriculos") || "[]");
        curriculos.forEach((c, i) => {
            const div = document.createElement("div");
            div.innerHTML = `
                <strong>${c.nome}</strong><br>
                ${c.email} | ${c.telefone}<br>
                <button onclick="editarCurriculo(${i})">Editar</button>
                <button onclick="excluirCurriculo(${i})">Excluir</button>
                <button onclick="exportarPDF(${i})">Exportar PDF</button>
            `;
            lista.appendChild(div);
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
