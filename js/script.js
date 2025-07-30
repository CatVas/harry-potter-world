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
const PAGE_NAME = {
  STAFF: "",
  STUDENTS: "hogwarts-students.html",
};
const PAGINATION = {
  PER_PAGE: 8,
};

const showCharactersBtn = document.getElementById("show-characters");
const charsList = document.getElementById("chars-list");

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

const pageName = checkPage();

if (pageName.students) {
  fetchStudentsData().then(({ error = "", students = [] }) => {
    const loadingEl = document.querySelector(".hogwarts-characters-loading");
    const statusEl = document.querySelector(".hogwarts-characters-status");
    const statusErrorEl = document.querySelector(".hogwarts-characters-error");
    const tabsListEl = document.querySelector(".tabs");

    loadingEl.remove();

    if (students.length < 1 && !error) {
      statusEl.classList.remove("invisible");
    }
    if (error) {
      statusErrorEl.textContent = error;
      statusErrorEl.classList.remove("invisible");
    }
    if (error || students.length < 1) {
      tabsListEl.remove();

      return;
    }

    const itemsHTML = students
      .map(
        ({
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
          const detailsHTML = [
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
          ]
            .filter(({ value }) => Boolean(value))
            .map(
              ({ label, value }) => `
            <li>
              <span class="list-data__def">${label}:</span> ${value}
            </li>`
            )
            .join("");

          return `<li class="tabs__item">
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
                  <p>${alternateName}</p>
                  <p>${house}</p>
                  <p>${dateOfBirth}</p>
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
            </article>
          </li>`;
        }
      )
      .join("");

    tabsListEl.innerHTML = itemsHTML;
  });
}

function apiUrl({ characterId = "" } = {}) {
  const {
    BASE,
    PATHS: { CHARACTER, CHARACTERS, STUDENTS },
  } = API;
  const characters = `${BASE}${CHARACTERS}`;

  return {
    character: `${BASE}${CHARACTER}/${characterId}`,
    characters,
    students: `${characters}${STUDENTS}`,
  };
}

function capitalizeFirstLetter(str = "") {
  return str.length > 0 ? str.charAt(0).toUpperCase() + str.slice(1) : "";
}

function checkPage() {
  const { STUDENTS } = PAGE_NAME;

  return { students: location.pathname.indexOf(STUDENTS) > -1 };
}

async function fetchStudentsData() {
  const url = apiUrl().students;

  try {
    const response = await fetch(url);

    if (response.status !== 200) {
      throw new Error("Bad fetching students");
    }

    const result = await response.json();
    const students = result.slice(0, PAGINATION.PER_PAGE);

    return { students };
  } catch (e) {
    return { error: e.message };
  }
}

function hasClass(el = null, className = "") {
  return el.classList.contains(className);
}

function wandStringify({ core = "", length = 0, wood = "" } = {}) {
  return `Wood: ${wood}, core: ${core}, length: ${length}`;
}
