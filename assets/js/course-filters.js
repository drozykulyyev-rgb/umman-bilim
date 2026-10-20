document.querySelectorAll("[data-filter]").forEach(
  (b) =>
    (b.onclick = () => {
      document
        .querySelectorAll("[data-filter]")
        .forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
      document
        .querySelectorAll("[data-group]")
        .forEach(
          (c) =>
            (c.hidden =
              b.dataset.filter !== "Все курсы" &&
              c.dataset.group !== b.dataset.filter),
        );
    }),
);
