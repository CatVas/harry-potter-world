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
    const tabsListEl = document.querySelector(".tabs");

    if (error || students.length < 1) {
      tabsListEl.remove();

      return;
    }

    const itemsHTML = students
      .map(
        ({
          alternateName = "",
          dateOfBirth = "",
          house = "",
          image = "",
          name = "",
        } = {}) => `
        <li class="tabs__item">
          <article class="character">
            <div class="character__img">
              <img
                class="character__img-pic"
                src="${image}"
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
          </article>
        </li>`
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
    const students = result
      .slice(0, PAGINATION.PER_PAGE)
      .map(
        ({
          alternate_names = [],
          dateOfBirth = "",
          house = "",
          id = "",
          image = "",
          name = "",
        } = {}) => ({
          alternateName: alternate_names[0] || "",
          dateOfBirth,
          house,
          id,
          image,
          name,
        })
      );

    return { students };
  } catch (e) {
    return { error: e.message };
  }
}

function hasClass(el = null, className = "") {
  return el.classList.contains(className);
}
