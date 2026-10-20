(async () => {
  const data = await fetch(window.UMMAN_PREVIEW_BASE + "data/content.json").then((r) => r.json());
  const esc = (s) =>
    String(s ?? "").replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
  const U = window.umman,
    t = (s) => U.t(s),
    local = (v) => v?.[U.lang] || t(v?.ru || "");
  const path = "/" + location.pathname.slice(window.UMMAN_PREVIEW_BASE.length);
  let formRendered = false;
  function renderPage() {
    if (path === "/courses/") {
      const grid = document.querySelector(".course-grid");
      grid.dataset.native = "";
      grid.innerHTML = data.courses
        .map(
          (c, i) =>
            `<article class="course-card" data-group="${esc(c.group)}">${c.image ? `<img src="${c.image}" alt="${esc(local(c.title))}" class="layout-6">` : ""}<div class="course-mark"><span>${esc(t(c.group))}</span><b>${String(i + 1).padStart(2, "0")}</b></div><h2>${esc(local(c.title))}</h2><p>${esc(local(c.summary))}</p><a href="/courses/${encodeURIComponent(c.id)}/">${esc(t("Подробнее о курсе ↗"))}</a></article>`,
        )
        .join("");
      const active = document.querySelector("[data-filter][aria-pressed=true]");
      if (active) active.click();
    } else if (path.startsWith("/courses/")) {
      const id = decodeURIComponent(path.split("/")[2]),
        c = data.courses.find((c) => c.id === id),
        main = document.querySelector("main");
      main.dataset.native = "";
      if (!c) {
        main.innerHTML =
          '<div class="wrap detail"><h1>' +
          esc(
            {
              ru: "Курс недоступен",
              tk: "Kurs elýeterli däl",
              en: "Course unavailable",
            }[U.lang],
          ) +
          '</h1><a href="/courses/">' +
          esc(t("← Все курсы")) +
          "</a></div>";
        return;
      }
      document.title = local(c.title) + " — UMMAN";
      main.innerHTML = `<article class="wrap detail"><div class="crumb"><a href="/courses/">${esc(t("Курсы"))}</a> / ${esc(t(c.group))}</div><h1>${esc(local(c.title))}</h1><p class="detail-lead">${esc(local(c.summary))}</p><div class="detail-layout"><div>${c.image ? `<img src="${c.image}" alt="${esc(local(c.title))}" class="layout-7">` : ""}<h2>${esc(t("О направлении"))}</h2><p class="layout-8">${esc(local(c.body))}</p><a class="back-link" href="/courses/">${esc(t("← Все курсы"))}</a></div><aside class="detail-aside"><h2>${esc(t("Хотите записаться?"))}</h2><p>${esc(t("Открытые группы, уровень подготовки, стоимость и время занятий уточняйте в центре."))}</p><a class="gold-button" href="/enrollment/?course=${encodeURIComponent(c.id)}">${esc(t("Записаться на курс ↗"))}</a><p><a href="tel:+99371909910">+993 71 90-99-10</a></p></aside></div></article>`;
    } else if (path === "/" || path === "/umman-style.html") {
      const grid = document.querySelector(".news .grid");
      grid.dataset.native = "";
      grid.innerHTML = data.news
        .map(
          (n) =>
            `<article class="card">${n.image ? `<img src="${n.image}" alt="${esc(local(n.title))}" class="layout-9">` : `<div class="poster"><span class="poster-brand">UMMAN</span><span class="poster-title">${esc(local(n.title))}</span><span class="poster-foot">BILIM MERKEZI</span></div>`}<div class="meta">${esc(n.date)}</div><h3>${esc(local(n.title))}</h3><p>${esc(local(n.summary))}</p>${local(n.body) ? `<p class="layout-10">${esc(local(n.body))}</p>` : ""}${n.link ? `<a class="text-link" href="${esc(n.link)}" target="_blank" rel="noopener">${esc(t("Открыть публикацию ↗"))}</a>` : ""}</article>`,
        )
        .join("");
      const note = document.querySelector(".news .note");
      if (note) note.remove();
    } else if (path === "/enrollment/") {
      const box = document.querySelector(
        "#application fieldset:nth-of-type(2) .choices",
      );
      if (box) {
        const selected = new Set(
          [...box.querySelectorAll(":checked")].map((x) => x.dataset.id),
        );
        const requested = new URLSearchParams(location.search).get("course");
        box.dataset.native = "";
        box.innerHTML = data.courses
          .map(
            (c) =>
              `<label class="choice"><input type="checkbox" name="Курсы" data-id="${esc(c.id)}" value="${esc(c.title.ru)}" ${selected.has(c.id) || (!formRendered && requested === c.id) ? "checked" : ""}><span>${esc(local(c.title))}</span></label>`,
          )
          .join("");
        formRendered = true;
        const review = document.getElementById("review");
        if (review) review.hidden = true;
      }
    }
  }
  function render() {
    renderPage();
    document.querySelectorAll('a[href^="/"]').forEach(link => {
      link.href = window.UMMAN_PREVIEW_BASE + link.getAttribute('href').slice(1);
    });
  }
  render();
  window.addEventListener("languagechange", render);
  if (path === "/enrollment/") {
    const f = document.getElementById("application"),
      date = document.getElementById("visit-date");
    date.oninput = () => {
      date.setCustomValidity("");
      if (
        date.value &&
        [0, 6].includes(new Date(date.value + "T12:00:00").getDay())
      )
        date.setCustomValidity(
          {
            ru: "Выберите день с понедельника по пятницу.",
            tk: "Duşenbeden anna gününe çenli bir güni saýlaň.",
            en: "Choose a day from Monday to Friday.",
          }[U.lang],
        );
    };
    f.addEventListener(
      "submit",
      (e) => {
        e.preventDefault();
        e.stopImmediatePropagation();
        const courses = f.querySelectorAll('input[name="Курсы"]:checked');
        if (!courses.length) {
          alert(
            {
              ru: "Выберите хотя бы один курс.",
              tk: "Iň bolmanda bir kurs saýlaň.",
              en: "Select at least one course.",
            }[U.lang],
          );
          return;
        }
        const groups = {};
        for (const [k, v] of new FormData(f)) {
          if (v) (groups[k] ??= []).push(v);
        }
        const labels = {
            Имя: ["Имя", "Ady", "First name"],
            Фамилия: ["Фамилия", "Familiýasy", "Last name"],
            "Дата рождения": [
              "Дата рождения",
              "Doglan senesi",
              "Date of birth",
            ],
            Класс: ["Класс", "Synpy", "Grade"],
            Родитель: ["Родитель", "Ene-ata", "Parent"],
            Телефон: ["Телефон", "Telefon", "Phone"],
            "Дополнительный телефон": [
              "Дополнительный телефон",
              "Goşmaça telefon",
              "Additional phone",
            ],
            Курсы: ["Курсы", "Kurslar", "Courses"],
            "Время занятий": ["Время занятий", "Sapak wagty", "Class time"],
            "Дни занятий": ["Дни занятий", "Sapak günleri", "Class days"],
            "Цель обучения": ["Цель обучения", "Okuw maksady", "Learning goal"],
            "Дата визита": ["Дата визита", "Geljek senesi", "Visit date"],
            "Время визита": ["Время визита", "Geljek wagty", "Visit time"],
            Комментарий: ["Комментарий", "Goşmaça maglumat", "Comments"],
          },
          i = ["ru", "tk", "en"].indexOf(U.lang),
          review = document.getElementById("review");
        review.dataset.native = "";
        review.textContent =
          {
            ru: "Проверьте анкету",
            tk: "Anketany barlaň",
            en: "Review your application",
          }[U.lang] +
          "\n\n" +
          Object.entries(groups)
            .map(([k, v]) => (labels[k]?.[i] || k) + ": " + v.map(t).join(", "))
            .join("\n") +
          "\n\n" +
          t(
            "Наш администратор свяжется с вами, чтобы уточнить детали и подтвердить время визита.",
          ) +
          "\n\n" +
          {
            ru: "Предварительный просмотр: анкета не отправлена, почта ещё не подключена.",
            tk: "Öňünden syn: anketa iberilmedi, e-poçta entek birikdirilmedi.",
            en: "Preview only: the application has not been sent. Email delivery is not connected yet.",
          }[U.lang];
        review.hidden = false;
        review.scrollIntoView({ behavior: "smooth" });
      },
      true,
    );
  }
})();
