/* ===========================
   CV Builder — scripts.js
   =========================== */

(() => {
  const STORAGE_KEY = "cvb_resumes_v1";

  // ======= Helpers =======
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const byId = (id) => document.getElementById(id);
  const fmt = (s) => (s || "").trim();

  function loadResumes() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.error("Erro ao carregar localStorage", e);
      return [];
    }
  }
  function saveResumes(list) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }
  function upsertResume(resume) {
    const list = loadResumes();
    const idx = list.findIndex((r) => r.id === resume.id);
    if (idx >= 0) list[idx] = resume;
    else list.push(resume);
    saveResumes(list);
    return list;
  }
  function deleteResume(id) {
    const list = loadResumes().filter((r) => r.id !== id);
    saveResumes(list);
    return list;
  }

  // ======= UI: Tabs =======
  $$(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      $$(".tab-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      const target = btn.getAttribute("data-target");
      $$(".tab-section").forEach((sec) => sec.classList.remove("active"));
      $(target).classList.add("active");
    });
  });

  // ======= Elements =======
  const resumeList = byId("resumeList");
  const emptyState = byId("emptyState");
  const searchInput = byId("searchInput");
  const fab = byId("fab");

  // Modal
  const resumeModal = byId("resumeModal");
  const resumeForm = byId("resumeForm");
  const modalTitle = byId("modalTitle");
  const closeModalBtn = byId("closeModalBtn");
  const cancelBtn = byId("cancelBtn");
  const deleteDraftBtn = byId("deleteDraftBtn");

  const fId = byId("resumeId");
  const fName = byId("name");
  const fEmail = byId("email");
  const fPhone = byId("phone");
  const fSummary = byId("summary");
  const fExperience = byId("experience");
  const fSkills = byId("skills");

  // ======= Render =======
  function renderList(filterText = "") {
    const q = fmt(filterText).toLowerCase();
    const list = loadResumes().sort((a,b) => (b.updatedAt||0) - (a.updatedAt||0));
    resumeList.innerHTML = "";
    let visible = 0;

    for (const r of list) {
      const hay = [
        r.name, r.email, r.phone, r.summary,
        (r.skills || []).join(","),
        (r.experience || []).join(" ")
      ].join(" ").toLowerCase();

      if (q && !hay.includes(q)) continue;

      const card = document.createElement("article");
      card.className = "card";

      const h3 = document.createElement("h3");
      h3.textContent = r.name || "(Sem nome)";
      card.appendChild(h3);

      const muted = document.createElement("div");
      muted.className = "muted";
      muted.textContent = r.email || "";
      card.appendChild(muted);

      if (r.summary) {
        const p = document.createElement("p");
        p.textContent = r.summary;
        card.appendChild(p);
      }

      const chips = document.createElement("div");
      chips.className = "chips";
      (r.skills || []).slice(0, 8).forEach(sk => {
        const c = document.createElement("span");
        c.className = "chip";
        c.textContent = sk;
        chips.appendChild(c);
      });
      card.appendChild(chips);

      const actions = document.createElement("div");
      actions.className = "actions";

      const editBtn = document.createElement("button");
      editBtn.className = "btn";
      editBtn.textContent = "Editar";
      editBtn.addEventListener("click", () => openModal(r));
      actions.appendChild(editBtn);

      const pdfBtn = document.createElement("button");
      pdfBtn.className = "btn primary";
      pdfBtn.textContent = "Exportar PDF";
      pdfBtn.addEventListener("click", () => exportPDF(r));
      actions.appendChild(pdfBtn);

      const delBtn = document.createElement("button");
      delBtn.className = "btn warn";
      delBtn.textContent = "Excluir";
      delBtn.addEventListener("click", () => {
        if (confirm(`Excluir o currículo de "${r.name}"?`)) {
          deleteResume(r.id);
          renderList(searchInput.value);
        }
      });
      actions.appendChild(delBtn);

      card.appendChild(actions);
      resumeList.appendChild(card);
      visible++;
    }

    emptyState.classList.toggle("hidden", visible > 0);
  }

  // ======= Modal helpers =======
  function openModal(data = null) {
    if (data) {
      modalTitle.textContent = "Editar currículo";
      fId.value = data.id;
      fName.value = data.name || "";
      fEmail.value = data.email || "";
      fPhone.value = data.phone || "";
      fSummary.value = data.summary || "";
      fExperience.value = (data.experience || []).join("\n");
      fSkills.value = (data.skills || []).join(", ");
    } else {
      modalTitle.textContent = "Novo currículo";
      fId.value = "";
      resumeForm.reset();
    }
    resumeModal.showModal();
    fName.focus();
  }
  function closeModal() {
    resumeModal.close();
  }

  // ======= Events =======
  fab.addEventListener("click", () => openModal());
  closeModalBtn.addEventListener("click", closeModal);
  cancelBtn.addEventListener("click", closeModal);
  deleteDraftBtn.addEventListener("click", () => {
    resumeForm.reset();
    fId.value = "";
    fName.focus();
  });
  searchInput.addEventListener("input", (e) => renderList(e.target.value));

  resumeForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const id = fId.value ? Number(fId.value) : Date.now();
    const data = {
      id,
      name: fmt(fName.value),
      email: fmt(fEmail.value),
      phone: fmt(fPhone.value),
      summary: fmt(fSummary.value),
      experience: fmt(fExperience.value).split(/\n+/).filter(Boolean),
      skills: fmt(fSkills.value).split(",").map(s => s.trim()).filter(Boolean),
      updatedAt: Date.now()
    };
    upsertResume(data);
    closeModal();
    renderList(searchInput.value);
  });

  // ======= PDF =======
  function exportPDF(r) {
    if (!window.jspdf || !window.jspdf.jsPDF) {
      alert("Biblioteca jsPDF não carregou. Verifique sua conexão com a CDN.");
      return;
    }
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const margin = 48;
    let y = margin;

    function title(text) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.text(text, margin, y);
      y += 22;
    }
    function label(text) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text(text, margin, y);
      y += 16;
    }
    function para(text) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      const lines = doc.splitTextToSize(text, 515);
      for (const line of lines) {
        if (y > 780) { doc.addPage(); y = margin; }
        doc.text(line, margin, y);
        y += 16;
      }
      y += 6;
    }
    function list(items) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      for (const it of items) {
        const lines = doc.splitTextToSize("• " + it, 515);
        for (const line of lines) {
          if (y > 780) { doc.addPage(); y = margin; }
          doc.text(line, margin, y);
          y += 16;
        }
      }
      y += 6;
    }

    // Cabeçalho
    title(r.name || "Sem nome");
    if (r.email || r.phone) {
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.text([r.email || "", r.phone || ""].filter(Boolean).join("  •  "), margin, y);
      y += 18;
    }
    doc.setDrawColor(200);
    doc.line(margin, y, 595 - margin, y); y += 18;

    if (r.summary) {
      label("Resumo");
      para(r.summary);
    }
    if (r.experience && r.experience.length) {
      label("Experiência");
      list(r.experience);
    }
    if (r.skills && r.skills.length) {
      label("Habilidades");
      para(r.skills.join(", "));
    }

    const fname = (r.name || "curriculo").toLowerCase().replace(/[^\w\-]+/g, "_") + ".pdf";
    doc.save(fname);
  }

  // ======= Boot =======
  // Seed opcional (uma vez) para demonstrar
  (function seed() {
    const list = loadResumes();
    if (list.length === 0) {
      const demo = {
        id: Date.now(),
        name: "Alex Developer",
        email: "alex@example.com",
        phone: "(11) 99999-0000",
        summary: "Desenvolvedor Front‑end com foco em acessibilidade e performance.",
        experience: [
          "Front‑end — Tech Co (2023–2025) · React, PWAs, otimização de Core Web Vitals",
          "Estágio — Web Studio (2022–2023) · HTML, CSS, JS, prototipagem"
        ],
        skills: ["HTML", "CSS", "JavaScript", "React", "Git", "A11y"],
        updatedAt: Date.now()
      };
      saveResumes([demo]);
    }
  })();

  renderList();
})();