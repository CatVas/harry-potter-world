const CLASS_INVISIBLE = "invisible";

const showCharactersBtn = document.getElementById("show-characters");
const charsList = document.getElementById("chars-list");

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

function hasClass(el = null, className = "") {
  return el.classList.contains(className);
}
