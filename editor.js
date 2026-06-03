(function () {
  const STORAGE_KEY = "alexa-menu-editor-draft";
  const sourceData = window.ALEXA_MENU || {
    updated: new Date().toISOString().slice(0, 10),
    currency: "Kč",
    contact: { address: [], phones: [], web: "" },
    groups: []
  };
  let menu = loadDraft();

  const root = document.querySelector("#groups-root");
  const output = document.querySelector("#output-field");
  const saveState = document.querySelector("#save-state");
  const itemCount = document.querySelector("#item-count");
  const updatedField = document.querySelector("#updated-field");
  const currencyField = document.querySelector("#currency-field");
  const webField = document.querySelector("#web-field");
  const addressField = document.querySelector("#address-field");
  const phonesField = document.querySelector("#phones-field");

  const today = () => new Date().toISOString().slice(0, 10);
  const clone = (value) => JSON.parse(JSON.stringify(value));
  const linesToArray = (value) => value.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const slugify = (value) => {
    const base = value
      .toLocaleLowerCase("cs-CZ")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    return base || `sekce-${Date.now()}`;
  };

  function readDraft() {
    try {
      return window.localStorage.getItem(STORAGE_KEY);
    } catch (error) {
      return null;
    }
  }

  function writeDraft() {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(menu));
      return true;
    } catch (error) {
      return false;
    }
  }

  function clearDraft() {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      // Some browsers block localStorage for local files or private windows.
    }
  }

  function loadDraft() {
    try {
      const stored = readDraft();
      return stored ? JSON.parse(stored) : clone(sourceData);
    } catch (error) {
      return clone(sourceData);
    }
  }

  function normalizeMenu() {
    menu.updated = menu.updated || today();
    menu.currency = menu.currency || "Kč";
    menu.contact = menu.contact || { address: [], phones: [], web: "" };
    menu.contact.address = Array.isArray(menu.contact.address) ? menu.contact.address : [];
    menu.contact.phones = Array.isArray(menu.contact.phones) ? menu.contact.phones : [];
    menu.groups = Array.isArray(menu.groups) ? menu.groups : [];

    menu.groups.forEach((group, groupIndex) => {
      group.id = group.id || slugify(group.title || `zalozka-${groupIndex + 1}`);
      group.title = group.title || "Nová záložka";
      group.sections = Array.isArray(group.sections) ? group.sections : [];
      group.sections.forEach((section) => {
        section.title = section.title || "Nová sekce";
        section.items = Array.isArray(section.items) ? section.items : [];
      });
    });
  }

  function serializeMenu() {
    normalizeMenu();
    return `window.ALEXA_MENU = ${JSON.stringify(menu, null, 2)};\n`;
  }

  function persist(message) {
    normalizeMenu();
    const stored = writeDraft();
    output.value = serializeMenu();
    updateCounters();
    saveState.textContent = message || (stored ? "Uloženo v prohlížeči" : "Pracovní uložení není dostupné");
  }

  function updateCounters() {
    const sections = menu.groups.reduce((sum, group) => sum + group.sections.length, 0);
    const items = menu.groups.reduce(
      (sum, group) => sum + group.sections.reduce((sectionSum, section) => sectionSum + section.items.length, 0),
      0
    );
    itemCount.textContent = `${menu.groups.length} záložky, ${sections} sekcí, ${items} položek`;
  }

  function bindInput(input, getter, setter) {
    input.value = getter() || "";
    input.addEventListener("input", () => {
      setter(input.value);
      persist();
    });
  }

  function moveItem(array, from, to) {
    if (to < 0 || to >= array.length) return;
    const [item] = array.splice(from, 1);
    array.splice(to, 0, item);
    render();
    persist("Přesunuto");
  }

  function makeButton(label, className, onClick) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = className;
    button.textContent = label;
    button.addEventListener("click", onClick);
    return button;
  }

  function makeField(label, value, onInput) {
    const wrapper = document.createElement("label");
    const text = document.createElement("span");
    const input = document.createElement("input");
    text.textContent = label;
    input.type = "text";
    input.value = value || "";
    input.addEventListener("input", () => {
      onInput(input.value);
      persist();
    });
    wrapper.append(text, input);
    return wrapper;
  }

  function renderItem(groupIndex, sectionIndex, item, itemIndex) {
    const row = document.createElement("div");
    row.className = "item-row";

    row.append(
      makeField("Název", item.name, (value) => {
        item.name = value;
      }),
      makeField("Objem", item.volume, (value) => {
        item.volume = value;
      }),
      makeField("Cena", item.price, (value) => {
        item.price = value;
      })
    );

    const actions = document.createElement("div");
    actions.className = "row-actions";
    const items = menu.groups[groupIndex].sections[sectionIndex].items;
    actions.append(
      makeButton("Nahoru", "ghost-button small", () => moveItem(items, itemIndex, itemIndex - 1)),
      makeButton("Dolů", "ghost-button small", () => moveItem(items, itemIndex, itemIndex + 1)),
      makeButton("Smazat", "danger-button small", () => {
        items.splice(itemIndex, 1);
        render();
        persist("Položka smazána");
      })
    );
    row.append(actions);
    return row;
  }

  function renderSection(groupIndex, section, sectionIndex) {
    const card = document.createElement("article");
    card.className = "section-card";

    const head = document.createElement("div");
    head.className = "section-head";
    head.append(makeField("Název sekce", section.title, (value) => {
      section.title = value;
    }));

    const group = menu.groups[groupIndex];
    const actions = document.createElement("div");
    actions.className = "card-actions";
    actions.append(
      makeButton("Přidat položku", "primary-button small", () => {
        section.items.push({ name: "Nová položka", volume: "", price: "" });
        render();
        persist("Položka přidána");
      }),
      makeButton("Sekce nahoru", "ghost-button small", () => moveItem(group.sections, sectionIndex, sectionIndex - 1)),
      makeButton("Sekce dolů", "ghost-button small", () => moveItem(group.sections, sectionIndex, sectionIndex + 1)),
      makeButton("Smazat sekci", "danger-button small", () => {
        if (section.items.length && !window.confirm("Smazat sekci včetně všech položek?")) return;
        group.sections.splice(sectionIndex, 1);
        render();
        persist("Sekce smazána");
      })
    );
    head.append(actions);

    const itemsRoot = document.createElement("div");
    itemsRoot.className = "items-root";
    section.items.forEach((item, itemIndex) => {
      itemsRoot.append(renderItem(groupIndex, sectionIndex, item, itemIndex));
    });

    card.append(head, itemsRoot);
    return card;
  }

  function renderGroup(group, groupIndex) {
    const card = document.createElement("article");
    card.className = "group-card";

    const head = document.createElement("div");
    head.className = "group-head";
    head.append(
      makeField("Název záložky", group.title, (value) => {
        group.title = value;
        group.id = slugify(value);
      }),
      makeField("ID v URL / datech", group.id, (value) => {
        group.id = slugify(value);
      })
    );

    const actions = document.createElement("div");
    actions.className = "card-actions";
    actions.append(
      makeButton("Přidat sekci", "primary-button small", () => {
        group.sections.push({ title: "Nová sekce", items: [] });
        render();
        persist("Sekce přidána");
      }),
      makeButton("Nahoru", "ghost-button small", () => moveItem(menu.groups, groupIndex, groupIndex - 1)),
      makeButton("Dolů", "ghost-button small", () => moveItem(menu.groups, groupIndex, groupIndex + 1)),
      makeButton("Smazat", "danger-button small", () => {
        if (group.sections.length && !window.confirm("Smazat celou záložku včetně sekcí a položek?")) return;
        menu.groups.splice(groupIndex, 1);
        render();
        persist("Záložka smazána");
      })
    );
    head.append(actions);

    const sectionsRoot = document.createElement("div");
    sectionsRoot.className = "sections-root";
    group.sections.forEach((section, sectionIndex) => {
      sectionsRoot.append(renderSection(groupIndex, section, sectionIndex));
    });

    card.append(head, sectionsRoot);
    return card;
  }

  function render() {
    normalizeMenu();
    updatedField.value = menu.updated;
    currencyField.value = menu.currency;
    webField.value = menu.contact.web || "";
    addressField.value = menu.contact.address.join("\n");
    phonesField.value = menu.contact.phones.join("\n");
    root.replaceChildren(...menu.groups.map(renderGroup));
    output.value = serializeMenu();
    updateCounters();
  }

  function syncGlobalFields() {
    bindInput(updatedField, () => menu.updated, (value) => {
      menu.updated = value;
    });
    bindInput(currencyField, () => menu.currency, (value) => {
      menu.currency = value;
    });
    bindInput(webField, () => menu.contact.web, (value) => {
      menu.contact.web = value;
    });
    bindInput(addressField, () => menu.contact.address.join("\n"), (value) => {
      menu.contact.address = linesToArray(value);
    });
    bindInput(phonesField, () => menu.contact.phones.join("\n"), (value) => {
      menu.contact.phones = linesToArray(value);
    });
  }

  async function copyOutput() {
    output.value = serializeMenu();
    output.select();
    try {
      if (!navigator.clipboard) throw new Error("Clipboard API není dostupné.");
      await navigator.clipboard.writeText(output.value);
      saveState.textContent = "Soubor zkopírován";
    } catch (error) {
      const copied = document.execCommand("copy");
      saveState.textContent = copied ? "Soubor zkopírován" : "Zkopírujte výstup ručně";
    }
  }

  function downloadOutput() {
    output.value = serializeMenu();
    const blob = new Blob([output.value], { type: "text/javascript;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "menu-data.js";
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    saveState.textContent = "Soubor stažen";
  }

  document.querySelector("#add-group").addEventListener("click", () => {
    menu.groups.push({
      id: `zalozka-${menu.groups.length + 1}`,
      title: "Nová záložka",
      sections: [{ title: "Nová sekce", items: [] }]
    });
    render();
    persist("Záložka přidána");
  });

  document.querySelector("#touch-date").addEventListener("click", () => {
    menu.updated = today();
    render();
    persist("Datum aktualizováno");
  });

  document.querySelector("#reset-work").addEventListener("click", () => {
    if (!window.confirm("Vrátit pracovní změny a načíst původní menu-data.js?")) return;
    clearDraft();
    menu = clone(sourceData);
    render();
    persist("Pracovní změny vráceny");
  });

  document.querySelector("#copy-data").addEventListener("click", copyOutput);
  document.querySelector("#download-data").addEventListener("click", downloadOutput);
  document.querySelector("#refresh-output").addEventListener("click", () => {
    output.value = serializeMenu();
    saveState.textContent = "Náhled obnoven";
  });

  normalizeMenu();
  syncGlobalFields();
  render();
  persist("Připraveno");
})();
