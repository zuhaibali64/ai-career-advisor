/**
 * script.js
 * ---------------------------------------------------------
 * AI Career Advisor — client-side application logic.
 *
 * Sections:
 *   1. Theme toggle (dark/light, persisted to localStorage)
 *   2. Starfield canvas background
 *   3. Skill input (tags, suggestions, keyboard handling)
 *   4. Matching engine (skills -> ranked careers)
 *   5. Rendering (recommendation, career grid, roadmap, gap chart)
 *   6. PDF report generation (jsPDF)
 *   7. Misc helpers (toast, scroll reveal)
 *
 * No build step, no backend — everything runs in the browser
 * so this deploys as-is to GitHub Pages.
 * ---------------------------------------------------------
 */

(function () {
  "use strict";

  /* ===========================================================
     1. THEME TOGGLE
     =========================================================== */
  const root = document.body;
  const themeToggle = document.getElementById("themeToggle");
  const STORAGE_THEME_KEY = "aica-theme";

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    themeToggle.setAttribute("aria-pressed", theme === "light");
    themeToggle.setAttribute(
      "aria-label",
      theme === "light" ? "Switch to dark mode" : "Switch to light mode"
    );
    localStorage.setItem(STORAGE_THEME_KEY, theme);
  }

  // Initialize from saved preference, falling back to system preference
  (function initTheme() {
    const saved = localStorage.getItem(STORAGE_THEME_KEY);
    if (saved) {
      applyTheme(saved);
    } else {
      const prefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;
      applyTheme(prefersLight ? "light" : "dark");
    }
  })();

  themeToggle.addEventListener("click", () => {
    const current = root.getAttribute("data-theme");
    applyTheme(current === "dark" ? "light" : "dark");
  });

  /* ===========================================================
     2. STARFIELD CANVAS BACKGROUND
     ---------------------------------------------------------
     Lightweight ambient particle field. Purely decorative;
     pauses when tab is hidden to save battery/CPU.
     =========================================================== */
  const canvas = document.getElementById("starfield");
  const ctx = canvas.getContext("2d");
  let stars = [];
  let animFrame = null;
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function resizeCanvas() {
    canvas.width = window.innerWidth * devicePixelRatio;
    canvas.height = window.innerHeight * devicePixelRatio;
    canvas.style.width = window.innerWidth + "px";
    canvas.style.height = window.innerHeight + "px";
    ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    initStars();
  }

  function initStars() {
    const count = Math.min(120, Math.floor((window.innerWidth * window.innerHeight) / 12000));
    stars = Array.from({ length: count }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() * 1.4 + 0.3,
      baseAlpha: Math.random() * 0.5 + 0.2,
      twinkleSpeed: Math.random() * 0.02 + 0.005,
      phase: Math.random() * Math.PI * 2,
    }));
  }

  function drawStars(time) {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    const isLight = root.getAttribute("data-theme") === "light";
    ctx.fillStyle = isLight ? "20, 24, 50" : "255, 255, 255";

    stars.forEach((s) => {
      const twinkle = Math.sin(time * s.twinkleSpeed + s.phase) * 0.3 + 0.7;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${isLight ? "20,24,50" : "255,255,255"}, ${s.baseAlpha * twinkle})`;
      ctx.fill();
    });

    animFrame = requestAnimationFrame(drawStars);
  }

  if (!prefersReducedMotion) {
    resizeCanvas();
    animFrame = requestAnimationFrame(drawStars);
    window.addEventListener("resize", resizeCanvas);

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        cancelAnimationFrame(animFrame);
      } else {
        animFrame = requestAnimationFrame(drawStars);
      }
    });
  }

  /* ===========================================================
     3. SKILL INPUT — tags, suggestions, keyboard handling
     =========================================================== */
  const skillForm = document.getElementById("skillForm");
  const skillInput = document.getElementById("skillInput");
  const skillTagsEl = document.getElementById("skillTags");
  const suggestedChipsEl = document.getElementById("suggestedChips");
  const analyzeBtn = document.getElementById("analyzeBtn");
  const clearBtn = document.getElementById("clearBtn");

  /** Selected skills, stored lower-case for matching, displayed title-case. */
  let selectedSkills = []; // array of strings (lowercase, canonical)

  /** Acronyms that should stay fully uppercase instead of being title-cased. */
  const KNOWN_ACRONYMS = new Set([
    "sql", "html", "css", "aws", "gcp", "api", "ui", "ux", "ci/cd",
    "nlp", "seo", "siem", "mlops", "r"
  ]);

  function titleCase(str) {
    return str
      .split(" ")
      .map((word) => {
        const lower = word.toLowerCase();
        if (KNOWN_ACRONYMS.has(lower)) return lower.toUpperCase();
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      })
      .join(" ");
  }

  function renderSkillTags() {
    skillTagsEl.innerHTML = "";
    selectedSkills.forEach((skill) => {
      const tag = document.createElement("span");
      tag.className = "skill-tag";
      tag.innerHTML = `${titleCase(skill)} <button type="button" aria-label="Remove ${titleCase(skill)}">&times;</button>`;
      tag.querySelector("button").addEventListener("click", () => removeSkill(skill));
      skillTagsEl.appendChild(tag);
    });
    analyzeBtn.disabled = selectedSkills.length === 0;
  }

  function addSkill(raw) {
    const skill = raw.trim().toLowerCase().replace(/\s+/g, " ");
    if (!skill) return;
    if (selectedSkills.includes(skill)) {
      showToast(`"${titleCase(skill)}" is already added`);
      return;
    }
    selectedSkills.push(skill);
    renderSkillTags();
    renderSuggestedChips();
  }

  function removeSkill(skill) {
    selectedSkills = selectedSkills.filter((s) => s !== skill);
    renderSkillTags();
    renderSuggestedChips();
  }

  function renderSuggestedChips() {
    suggestedChipsEl.innerHTML = "";
    // Show featured chips not yet selected, capped at 8
    const pool = (selectedSkills.length === 0 ? FEATURED_SKILL_CHIPS : ALL_SKILLS.map(titleCase));
    const available = pool.filter((s) => !selectedSkills.includes(s.toLowerCase())).slice(0, 8);
    available.forEach((skill) => {
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "chip";
      chip.textContent = skill;
      chip.addEventListener("click", () => addSkill(skill));
      suggestedChipsEl.appendChild(chip);
    });
  }

  // Handle form submit (Enter key) and comma-separated entry
  skillForm.addEventListener("submit", (e) => {
    e.preventDefault();
    processInputValue();
  });

  skillInput.addEventListener("keydown", (e) => {
    if (e.key === ",") {
      e.preventDefault();
      processInputValue();
    }
  });

  function processInputValue() {
    const raw = skillInput.value;
    if (!raw.trim()) return;
    // Support pasting a comma-separated list in one go
    raw.split(",").forEach((part) => {
      if (part.trim()) addSkill(part);
    });
    skillInput.value = "";
    skillInput.focus();
  }

  clearBtn.addEventListener("click", () => {
    selectedSkills = [];
    renderSkillTags();
    renderSuggestedChips();
    skillInput.value = "";
    skillInput.focus();
    hideResults();
  });

  renderSuggestedChips(); // initial paint

  /* ===========================================================
     4. MATCHING ENGINE
     ---------------------------------------------------------
     Simple, transparent weighted scoring:
       - exact match on a coreSkill   -> +10
       - exact match on niceToHave    -> +4
       - partial / substring match    -> half credit
     Score is normalized to a 0-100 percentage against the
     career's maximum possible score, so cards are comparable
     across careers with different list lengths.
     =========================================================== */
  function scoreCareer(career, userSkills) {
    const CORE_WEIGHT = 10;
    const NICE_WEIGHT = 4;
    let score = 0;
    const maxScore = career.coreSkills.length * CORE_WEIGHT + career.niceToHave.length * NICE_WEIGHT;
    const matchedCore = [];
    const matchedNice = [];

    career.coreSkills.forEach((skill) => {
      const hit = userSkills.some((u) => u === skill || skill.includes(u) || u.includes(skill));
      if (hit) {
        score += CORE_WEIGHT;
        matchedCore.push(skill);
      }
    });

    career.niceToHave.forEach((skill) => {
      const hit = userSkills.some((u) => u === skill || skill.includes(u) || u.includes(skill));
      if (hit) {
        score += NICE_WEIGHT;
        matchedNice.push(skill);
      }
    });

    const percent = maxScore === 0 ? 0 : Math.round((score / maxScore) * 100);

    return {
      career,
      percent,
      matchedCore,
      matchedNice,
      missingCore: career.coreSkills.filter((s) => !matchedCore.includes(s)),
    };
  }

  function runMatchingEngine(userSkills) {
    return CAREER_DB
      .map((career) => scoreCareer(career, userSkills))
      .sort((a, b) => b.percent - a.percent);
  }

  /* ===========================================================
     5. RENDERING
     =========================================================== */
  const resultsSection = document.getElementById("results");
  const emptyHint = document.getElementById("emptyHint");
  const recommendationPanel = document.getElementById("recommendationPanel");
  const careerGrid = document.getElementById("careerGrid");
  const roadmapStagesEl = document.getElementById("roadmapStages");
  const gapChartEl = document.getElementById("gapChart");

  let lastMatches = []; // cached for PDF export

  function hideResults() {
    resultsSection.hidden = true;
    emptyHint.hidden = false;
  }

  function showResults() {
    resultsSection.hidden = false;
    emptyHint.hidden = true;
  }

  function renderRecommendation(top) {
    const { career, percent, matchedCore } = top;
    recommendationPanel.innerHTML = `
      <div class="rec-badge" aria-hidden="true">${career.icon}</div>
      <div>
        <h3 class="rec-title">${career.title}</h3>
        <p class="rec-match">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1v12M1 7h12" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>
          ${percent}% skill match
        </p>
        <p class="rec-desc">${career.blurb}</p>
        <div class="rec-meta">
          <span>Typical range: <strong>${career.avgSalaryRange}</strong></span>
          <span>Skills matched: <strong>${matchedCore.length}/${career.coreSkills.length}</strong></span>
        </div>
      </div>
    `;
  }

  function renderCareerGrid(matches) {
    careerGrid.innerHTML = "";
    const top5 = matches.slice(0, 6);
    const RADIUS = 18;
    const CIRC = 2 * Math.PI * RADIUS;

    top5.forEach((m, i) => {
      const { career, percent, matchedCore, matchedNice } = m;
      const offset = CIRC - (percent / 100) * CIRC;

      const card = document.createElement("article");
      card.className = "career-card";
      card.style.animationDelay = `${i * 70}ms`;

      const allSkillChips = [
        ...career.coreSkills.map((s) => ({ s, matched: matchedCore.includes(s) })),
        ...career.niceToHave.slice(0, 3).map((s) => ({ s, matched: matchedNice.includes(s) })),
      ].slice(0, 7);

      card.innerHTML = `
        <div class="career-card-head">
          <span class="career-icon" aria-hidden="true">${career.icon}</span>
          <h3>${career.title}</h3>
          <div class="match-ring" role="img" aria-label="${percent} percent match">
            <svg width="44" height="44" viewBox="0 0 44 44">
              <circle class="match-ring-track" cx="22" cy="22" r="${RADIUS}"></circle>
              <circle class="match-ring-fill" cx="22" cy="22" r="${RADIUS}"
                stroke-dasharray="${CIRC}" stroke-dashoffset="${CIRC}"></circle>
            </svg>
            <span class="match-ring-label">${percent}%</span>
          </div>
        </div>
        <p>${career.blurb}</p>
        <div class="career-skill-list">
          ${allSkillChips
            .map(
              ({ s, matched }) =>
                `<span class="mini-chip${matched ? " is-matched" : ""}">${titleCase(s)}</span>`
            )
            .join("")}
        </div>
        <div class="career-card-footer">
          <span>Salary range</span>
          <strong>${career.avgSalaryRange}</strong>
        </div>
      `;
      careerGrid.appendChild(card);

      // Animate the ring fill in on next frame (after element is in DOM)
      requestAnimationFrame(() => {
        const fill = card.querySelector(".match-ring-fill");
        requestAnimationFrame(() => {
          fill.style.strokeDashoffset = String(offset);
        });
      });
    });
  }

  function renderRoadmap(topCareer) {
    roadmapStagesEl.innerHTML = "";
    topCareer.roadmap.forEach((stage, i) => {
      const li = document.createElement("li");
      li.className = "roadmap-stage";
      li.style.animationDelay = `${i * 90}ms`;
      li.innerHTML = `
        <span class="stage-dot" aria-hidden="true"></span>
        <span class="stage-num">STAGE ${String(i + 1).padStart(2, "0")}</span>
        <h4>${stage.stage}</h4>
        <span class="stage-duration">${stage.duration}</span>
        <p>${stage.focus}</p>
      `;
      roadmapStagesEl.appendChild(li);
    });
  }

  function renderGapChart(top3) {
    gapChartEl.innerHTML = "";
    top3.forEach((m, i) => {
      const row = document.createElement("div");
      row.className = "gap-row";
      row.innerHTML = `
        <span class="gap-label">${m.career.title}</span>
        <div class="gap-bar-track">
          <div class="gap-bar-fill" style="transition-delay:${i * 120}ms" data-percent="${m.percent}"></div>
        </div>
      `;
      gapChartEl.appendChild(row);
    });
    // Trigger fill animation after paint
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        gapChartEl.querySelectorAll(".gap-bar-fill").forEach((bar) => {
          bar.style.width = bar.dataset.percent + "%";
        });
      });
    });
  }

  /* ===========================================================
     6. ANALYZE FLOW
     =========================================================== */
  const analyzeBtnEl = document.getElementById("analyzeBtn");

  analyzeBtnEl.addEventListener("click", () => {
    if (selectedSkills.length === 0) return;

    analyzeBtnEl.classList.add("is-loading");
    analyzeBtnEl.disabled = true;

    // Small artificial delay so the "AI thinking" moment registers —
    // matching itself is instant, but a flash with no feedback feels broken.
    setTimeout(() => {
      const matches = runMatchingEngine(selectedSkills);
      lastMatches = matches;

      renderRecommendation(matches[0]);
      renderCareerGrid(matches);
      renderRoadmap(matches[0].career);
      renderGapChart(matches.slice(0, 5));

      showResults();
      announce(`Analysis complete. Top match: ${matches[0].career.title} at ${matches[0].percent} percent.`);

      analyzeBtnEl.classList.remove("is-loading");
      analyzeBtnEl.disabled = false;

      document.getElementById("results").scrollIntoView({ behavior: "smooth", block: "start" });
    }, 700);
  });

  /* ===========================================================
     7. PDF REPORT GENERATION (jsPDF)
     =========================================================== */
  const downloadBtn = document.getElementById("downloadPdfBtn");

  downloadBtn.addEventListener("click", () => {
    if (lastMatches.length === 0) {
      showToast("Run an analysis first");
      return;
    }
    downloadBtn.classList.add("is-loading");
    downloadBtn.disabled = true;

    // Defer to next tick so the loading state paints before the (synchronous) PDF build
    setTimeout(() => {
      try {
        generatePdfReport(lastMatches, selectedSkills);
        showToast("Report downloaded");
      } catch (err) {
        console.error(err);
        showToast("Couldn't generate the PDF — try again");
      } finally {
        downloadBtn.classList.remove("is-loading");
        downloadBtn.disabled = false;
      }
    }, 50);
  });

  function generatePdfReport(matches, userSkills) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 48;
    let y = 64;

    const ACCENT = [124, 92, 255];
    const TEXT_DARK = [22, 26, 46];
    const TEXT_MUTED = [110, 116, 145];

    // --- Header ---
    doc.setFillColor(...ACCENT);
    doc.circle(margin + 8, y - 6, 8, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(...TEXT_DARK);
    doc.text("AI Career Advisor — Report", margin + 26, y);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...TEXT_MUTED);
    doc.text(`Generated ${new Date().toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}`, margin + 26, y + 14);
    y += 40;

    doc.setDrawColor(225, 225, 235);
    doc.line(margin, y, pageWidth - margin, y);
    y += 28;

    // --- Skills entered ---
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(...TEXT_DARK);
    doc.text("Skills entered", margin, y);
    y += 16;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...TEXT_MUTED);
    const skillsLine = userSkills.map(titleCase).join("  ·  ");
    const skillsWrapped = doc.splitTextToSize(skillsLine, pageWidth - margin * 2);
    doc.text(skillsWrapped, margin, y);
    y += skillsWrapped.length * 13 + 20;

    // --- Top recommendation ---
    const top = matches[0];
    doc.setFillColor(248, 248, 252);
    doc.roundedRect(margin, y, pageWidth - margin * 2, 86, 8, 8, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(...TEXT_DARK);
    doc.text(`Top match: ${top.career.title}`, margin + 16, y + 24);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...ACCENT);
    doc.text(`${top.percent}% skill match  ·  ${top.career.avgSalaryRange}`, margin + 16, y + 40);
    doc.setTextColor(...TEXT_MUTED);
    const blurbWrapped = doc.splitTextToSize(top.career.blurb, pageWidth - margin * 2 - 32);
    doc.text(blurbWrapped, margin + 16, y + 56);
    y += 86 + 28;

    // --- Career matches table ---
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(...TEXT_DARK);
    doc.text("Matched careers", margin, y);
    y += 18;

    matches.slice(0, 6).forEach((m) => {
      checkPageBreak(28);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(...TEXT_DARK);
      doc.text(m.career.title, margin, y);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...TEXT_MUTED);
      doc.text(`${m.percent}%`, pageWidth - margin - 30, y);

      // mini bar
      const barX = margin;
      const barY = y + 5;
      const barW = pageWidth - margin * 2 - 50;
      doc.setFillColor(235, 235, 242);
      doc.roundedRect(barX, barY, barW, 5, 2, 2, "F");
      doc.setFillColor(...ACCENT);
      doc.roundedRect(barX, barY, Math.max(4, (barW * m.percent) / 100), 5, 2, 2, "F");
      y += 24;
    });

    y += 14;

    // --- Learning roadmap ---
    checkPageBreak(40);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(...TEXT_DARK);
    doc.text(`Learning roadmap — ${top.career.title}`, margin, y);
    y += 20;

    top.career.roadmap.forEach((stage, i) => {
      checkPageBreak(34);
      doc.setFillColor(...ACCENT);
      doc.circle(margin + 4, y - 3, 3, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(...TEXT_DARK);
      doc.text(`${i + 1}. ${stage.stage}  (${stage.duration})`, margin + 16, y);
      y += 13;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      doc.setTextColor(...TEXT_MUTED);
      const focusWrapped = doc.splitTextToSize(stage.focus, pageWidth - margin * 2 - 16);
      doc.text(focusWrapped, margin + 16, y);
      y += focusWrapped.length * 12 + 10;
    });

    // --- Footer on every page ---
    const pageCount = doc.internal.getNumberOfPages();
    for (let p = 1; p <= pageCount; p++) {
      doc.setPage(p);
      doc.setFontSize(8);
      doc.setTextColor(...TEXT_MUTED);
      doc.text(
        "AI Career Advisor · Generated client-side · Not professional career counseling",
        margin,
        doc.internal.pageSize.getHeight() - 24
      );
      doc.text(String(p), pageWidth - margin, doc.internal.pageSize.getHeight() - 24, { align: "right" });
    }

    function checkPageBreak(needed) {
      if (y + needed > doc.internal.pageSize.getHeight() - 50) {
        doc.addPage();
        y = 56;
      }
    }

    doc.save("ai-career-advisor-report.pdf");
  }

  /* ===========================================================
     8. MISC HELPERS — toast + a11y live region
     =========================================================== */
  let toastTimer = null;
  function showToast(message) {
    let toast = document.querySelector(".toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.className = "toast";
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 2400);
  }

  const srAnnounce = document.getElementById("srAnnounce");
  function announce(message) {
    srAnnounce.textContent = message;
  }
})();
