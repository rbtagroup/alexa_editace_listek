(function () {
  const STORAGE_KEY = "alexa-menu-editor-draft";
  const draftMode = new URLSearchParams(window.location.search).get("draft") === "1";
  const data = loadMenuData();
  data.groups = Array.isArray(data.groups) ? data.groups.filter((group) => group.published !== false) : [];
  const root = document.querySelector("#menu-root");
  const tabs = document.querySelector("#group-tabs");
  const search = document.querySelector("#menu-search");
  const emptyState = document.querySelector("#empty-state");
  const address = document.querySelector("#contact-address");

  let activeGroup = data.groups[0] ? data.groups[0].id : "";
  let query = "";

  function loadMenuData() {
    const fallback = {
      currency: "Kč",
      contact: { address: [] },
      groups: []
    };

    if (!draftMode) return window.ALEXA_MENU || fallback;

    try {
      const draft = window.localStorage.getItem(STORAGE_KEY);
      return draft ? JSON.parse(draft) : (window.ALEXA_MENU || fallback);
    } catch (error) {
      return window.ALEXA_MENU || fallback;
    }
  }

  function showDraftNotice() {
    if (!draftMode) return;
    const notice = document.createElement("div");
    notice.className = "draft-notice";
    notice.textContent = "Pracovní náhled z editoru";
    document.body.prepend(notice);
  }

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
    button.textContent = group.shortTitle || group.title;
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
    if (!group) {
      root.replaceChildren();
      emptyState.hidden = false;
      return;
    }
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
    const contact = data.contact || { address: [] };
    address.replaceChildren(
      ...(contact.address || []).map((line) => {
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

  showDraftNotice();
  renderContact();
  render();
})();
