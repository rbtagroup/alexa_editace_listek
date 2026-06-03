(function () {
  const data = window.ALEXA_MENU;
  const root = document.querySelector("#menu-root");
  const tabs = document.querySelector("#group-tabs");
  const search = document.querySelector("#menu-search");
  const emptyState = document.querySelector("#empty-state");
  const address = document.querySelector("#contact-address");

  let activeGroup = data.groups[0].id;
  let query = "";

  const normalize = (value) =>
    value
      .toLocaleLowerCase("cs-CZ")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

  const priceLabel = (item) => {
    if (!item.price || item.price === "-") return "-";
    return item.price.includes("Kč") ? item.price : `${item.price} ${data.currency}`;
  };

  function createTab(group) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "tab";
    button.dataset.group = group.id;
    button.textContent = group.title;
    button.setAttribute("aria-pressed", group.id === activeGroup ? "true" : "false");
    button.addEventListener("click", () => {
      activeGroup = group.id;
      query = "";
      search.value = "";
      render();
      document.querySelector(".menu-stage").scrollIntoView({ behavior: "smooth", block: "start" });
    });
    return button;
  }

  function renderTabs() {
    tabs.replaceChildren(...data.groups.map(createTab));
  }

  function sectionMatches(section, normalizedQuery) {
    if (!normalizedQuery) return section.items;

    return section.items.filter((item) => {
      const haystack = normalize(`${section.title} ${item.name} ${item.volume} ${item.price}`);
      return haystack.includes(normalizedQuery);
    });
  }

  function renderSection(section, filteredItems) {
    const sectionNode = document.createElement("section");
    sectionNode.className = "menu-section";

    const title = document.createElement("h2");
    title.textContent = section.title;
    sectionNode.append(title);

    const list = document.createElement("div");
    list.className = "menu-list";

    filteredItems.forEach((item) => {
      const row = document.createElement("article");
      row.className = "menu-row";

      const name = document.createElement("h3");
      name.textContent = item.name;

      const volume = document.createElement("span");
      volume.className = "volume";
      volume.textContent = item.volume || "";

      const price = document.createElement("strong");
      price.className = "price";
      price.textContent = priceLabel(item);

      row.append(name, volume, price);
      list.append(row);
    });

    sectionNode.append(list);
    return sectionNode;
  }

  function render() {
    const group = data.groups.find((item) => item.id === activeGroup) || data.groups[0];
    const normalizedQuery = normalize(query.trim());
    const sections = group.sections
      .map((section) => ({
        section,
        items: sectionMatches(section, normalizedQuery)
      }))
      .filter(({ items }) => items.length > 0);

    renderTabs();
    root.replaceChildren(...sections.map(({ section, items }) => renderSection(section, items)));
    emptyState.hidden = sections.length !== 0;
  }

  function renderContact() {
    address.replaceChildren(
      ...data.contact.address.map((line) => {
        const span = document.createElement("span");
        span.textContent = line;
        return span;
      })
    );
  }

  search.addEventListener("input", (event) => {
    query = event.target.value;
    render();
  });

  renderContact();
  render();
})();
