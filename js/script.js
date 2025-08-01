// === Constants ===
const API = {
  BASE: "https://hp-api.onrender.com/api",
  PATHS: {
    CHARACTER: "/character",
    CHARACTERS: "/characters",
    HOUSE: "/house",
    SPELLS: "/spells",
    STAFF: "/staff",
    STUDENTS: "/students",
  },
};
const CLASS_INVISIBLE = "invisible";
const HOUSES = {
  GRYFFINDOR: "GRYFFINDOR",
  HUFFLEPUFF: "HUFFLEPUFF",
  RAVENCLAW: "RAVENCLAW",
  SLYTHERIN: "SLYTHERIN",
};
const PAGE_NAME = {
  CERTAIN_HOUSE_CHARACTERS: "certain-house-characters.html",
  STAFF: "hogwarts-staff.html",
  STUDENTS: "hogwarts-students.html",
};
const PAGINATION = {
  PER_PAGE: 8,
};

// === DOM elements ===
const charsList = document.getElementById("chars-list");
const houseSwitchEl = document.querySelector(".house-switch");
const loadingEl = document.querySelector(".hogwarts-characters-loading");
const showCharactersBtn = document.getElementById("show-characters");
const statusEl = document.querySelector(".hogwarts-characters-status");
const statusErrorEl = document.querySelector(".hogwarts-characters-error");
const tabsListEl = document.querySelector(".tabs");

// === Controller ===
showCharactersBtn &&
  showCharactersBtn.addEventListener("click", () => {
    const isVisible = !hasClass(charsList, CLASS_INVISIBLE);

    if (isVisible) {
      charsList.classList.add(CLASS_INVISIBLE);
    } else {
      charsList.classList.remove(CLASS_INVISIBLE);
    }

    showCharactersBtn.textContent = `${
      isVisible ? "Show" : "Hide"
    } all characters`;
  });

ctrlRenderCharacterPages();

// === API ===
function apiUrl({ characterId = "", house = "" } = {}) {
  const {
    BASE,
    PATHS: { CHARACTER, CHARACTERS, HOUSE, STAFF, STUDENTS },
  } = API;
  const characters = `${BASE}${CHARACTERS}`;

  return {
    character: `${BASE}${CHARACTER}/${characterId}`,
    characters,
    houseCharacters: `${characters}${HOUSE}/${house.toLowerCase()}`,
    staff: `${characters}${STAFF}`,
    students: `${characters}${STUDENTS}`,
  };
}

async function fetchRun({ errorMessage = "", url = "", onResult = null } = {}) {
  try {
    const response = await fetch(url);

    if (response.status !== 200) {
      throw new Error(errorMessage || "Bad API request");
    }

    const result = await response.json();

    return {
      result: typeof onResult === "function" ? onResult(result) : result,
    };
  } catch (e) {
    return { error: e.message };
  }
}

function fetchHouseCharactersData(house = "") {
  return fetchRun({
    errorMessage: `Bad loading ${capitalizeFirstLetter(house)} characters %-(`,
    url: apiUrl({ house }).houseCharacters,
    onResult: (s) => s.slice(0, PAGINATION.PER_PAGE),
  });
}

function fetchStaffData() {
  return fetchRun({
    errorMessage: "Bad loading staff %-(",
    url: apiUrl().staff,
    onResult: (s) => s.slice(0, PAGINATION.PER_PAGE),
  });
}

function fetchStudentsData() {
  return fetchRun({
    errorMessage: "Bad loading students :-(",
    url: apiUrl().students,
    onResult: (s) => s.slice(0, PAGINATION.PER_PAGE),
  });
}

// === Control ===
function ctrlRenderCharacterPages() {
  const { certainHouseCharacters, staff, students } = checkPage();
  let promiseData;

  if (certainHouseCharacters) {
    const statusHouseNameEl = document.querySelector(
      ".hogwarts-characters-status__house-name"
    );
    const { house } = searchParamsGet();
    const houseActive = house || HOUSES.GRYFFINDOR;

    promiseData = fetchHouseCharactersData(houseActive);
    renderHouseSwitchItems(houseActive);

    statusHouseNameEl &&
      (statusHouseNameEl.innerHTML = capitalizeFirstLetter(house));
  }
  if (staff) {
    promiseData = fetchStaffData();
  }
  if (students) {
    promiseData = fetchStudentsData();
  }

  promiseData && promiseData.then(uiOnCharactersDataFetched);
}

// === Render UI ===
function renderCharacterCard({
  alternateName = "",
  dateOfBirth = "",
  detailsHTML = "",
  house = "",
  image = "",
  name = "",
} = {}) {
  const infoUI = renderListItems({
    filterItems: (s) => Boolean(s),
    itemsData: [alternateName, house, dateOfBirth],
    mapToUi: (data) => `<p>${data}</p>`,
  });

  return `
    <article class="character">
      <div class="character__img">
        <img
          class="character__img-pic"
          src="${image || "./img/wizard-silhouette.jpeg"}"
          alt=""
        />
      </div>
      <div class="character__data">
        <p class="character__name">${name}</p>
        <div class="character__info">
          ${infoUI}
        </div>
        <p class="character__link">
          <a class="character__link-a" href="#">More info</a>
        </p>
      </div>
      <div class="character__details">
        <ul class="list-data">
          ${detailsHTML}
        </ul>
      </div>
    </article>`;
}

function renderCharacterDetailsItem({ label, value }) {
  return `
    <li>
      <span class="list-data__def">${label}:</span> ${value}
    </li>`;
}

function renderCharacterTabsItem({
  alternateName = "",
  dateOfBirth = "",
  detailsHTML = "",
  house = "",
  image = "",
  name = "",
} = {}) {
  return `
    <li class="tabs__item">
      ${renderCharacterCard({
        alternateName,
        dateOfBirth,
        detailsHTML,
        house,
        image,
        name,
      })}
    </li>`;
}

function renderHouseSwitchItems(house) {
  const onItemClick = (house) => {
    searchParamsSet({ house: house.toLowerCase() });
  };

  const items = renderListItems({
    itemsData: Object.keys(HOUSES).map((key) => HOUSES[key]),
    mapToUi: (houseCurrent) =>
      `<li
        class="house-switch__item ${
          houseCurrent.toLowerCase() === house.toLowerCase()
            ? "house-switch__item--active"
            : ""
        }"
        data-house="${houseCurrent}"
      >
        <img alt="" class="house-switch__item-logo" src="./img/logo-${houseCurrent.toLowerCase()}.svg">
        ${houseCurrent}
      </li>`,
  });

  houseSwitchEl && (houseSwitchEl.innerHTML = items);
  houseSwitchEl.childNodes.forEach((li) => {
    li.addEventListener("click", () => {
      onItemClick(li.dataset.house);
    });
  });
}

function renderListItems({
  filterItems = () => true,
  itemsData = [],
  mapToUi = () => {},
} = {}) {
  return itemsData.filter(filterItems).map(mapToUi).join("");
}

function renderTabsList({ items = [] } = {}) {
  const itemsHTML = renderListItems({
    itemsData: items,
    mapToUi: ({
      actor = "",
      alive = false,
      alternate_names = [],
      ancestry = "",
      dateOfBirth = "",
      eyeColour = "",
      gender = "",
      hairColour = "",
      hogwartsStaff = false,
      hogwartsStudent = false,
      house = "",
      image = "",
      name = "",
      patronus = "",
      species = "",
      wand = {},
      wizard = false,
      yearOfBirth = 0,
    } = {}) => {
      const alternateName = alternate_names[0] || "";
      const detailsHTML = renderListItems({
        filterItems: ({ value }) => Boolean(value),
        itemsData: [
          { label: "Name", value: name },
          { label: "Alternate names", value: alternate_names.join(", ") },
          { label: "Species", value: capitalizeFirstLetter(species) },
          { label: "Gender", value: capitalizeFirstLetter(gender) },
          { label: "House", value: house },
          { label: "Date of birth", value: dateOfBirth },
          { label: "Year of birth", value: yearOfBirth },
          { label: "Wizard", value: capitalizeFirstLetter(`${wizard}`) },
          { label: "Ancestry", value: capitalizeFirstLetter(ancestry) },
          { label: "Eye colour", value: capitalizeFirstLetter(eyeColour) },
          { label: "Hair colour", value: capitalizeFirstLetter(hairColour) },
          { label: "Wand", value: wandStringify(wand) },
          { label: "Patronus", value: capitalizeFirstLetter(patronus) },
          {
            label: "Hogwarts student",
            value: capitalizeFirstLetter(`${hogwartsStudent}`),
          },
          {
            label: "Hogwarts staff",
            value: capitalizeFirstLetter(`${hogwartsStaff}`),
          },
          { label: "Actor", value: actor },
          { label: "Alive", value: capitalizeFirstLetter(`${alive}`) },
        ],
        mapToUi: renderCharacterDetailsItem,
      });

      return renderCharacterTabsItem({
        alternateName,
        dateOfBirth,
        detailsHTML,
        house,
        image,
        name,
      });
    },
  });

  tabsListEl && (tabsListEl.innerHTML = itemsHTML);
}

// === UI logic ===
function uiOnCharactersDataFetched({ error = "", result = [] }) {
  uiStatusesOnCharactersFetch({ error, result });

  if (error || result.length < 1) {
    tabsListEl && tabsListEl.remove();

    return;
  }

  renderTabsList({ items: result });
}

function uiStatusesOnCharactersFetch({ error = "", result = [] }) {
  loadingEl && loadingEl.remove();

  if (result.length < 1 && !error) {
    statusEl && statusEl.classList.remove("invisible");
  }
  if (error && statusErrorEl) {
    statusErrorEl.textContent = error;
    statusErrorEl.classList.remove("invisible");
  }
}

// === Utils ===
function capitalizeFirstLetter(str = "") {
  return str.length > 0
    ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
    : "";
}

function checkPage() {
  const {
    CERTAIN_HOUSE_CHARACTERS = "",
    STAFF = "",
    STUDENTS = "",
  } = PAGE_NAME;

  return {
    certainHouseCharacters: ifPagePathContains(CERTAIN_HOUSE_CHARACTERS),
    staff: ifPagePathContains(STAFF),
    students: ifPagePathContains(STUDENTS),
  };
}

function hasClass(el = null, className = "") {
  return el.classList.contains(className);
}

function ifPagePathContains(pathPart = "") {
  return location.pathname.indexOf(pathPart) > -1;
}

function searchParamsFromObj(params = {}) {
  return (
    "?" +
    Object.keys(params)
      .map((key) => `${key}=${params[key]}`)
      .join("&")
  );
}

function searchParamsGet() {
  const { search } = location;

  if (!search || search[0] !== "?") {
    return {};
  }

  return search
    .slice(1)
    .split("&")
    .reduce((acc, curr) => {
      const [label, value] = curr.split("=");

      acc[label] = value;

      return acc;
    }, {});
}

function searchParamsSet(params = {}) {
  const current = searchParamsGet();

  Object.keys(params).forEach((key) => {
    current[key] = params[key];
  });

  location.search = searchParamsFromObj(current);
}

function wandStringify({ core = "", length = 0, wood = "" } = {}) {
  return `Wood: ${wood}, core: ${core}, length: ${length}`;
}
