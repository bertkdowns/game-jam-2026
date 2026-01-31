import { characters } from "./Character.js";
import { CHARACTERS } from "./constants.js"

export function renderAccusations() {
  document.getElementById("modal").style.display = "none";
  document.getElementById("AccusationModal").style.display = "block";
  let accusationsDiv = document.getElementById("Accusations");
  accusationsDiv.innerHTML = "";


  for (let charac of Object.values(characters)) {
    if (charac.name === CHARACTERS.TUTORIAL_CHARACTER || charac.name === CHARACTERS.KING) {
      continue; // Skip tutorial character and king
    }
    let div = document.createElement("div");

    let node = document.createElement("img");
    node.src = charac.characterImage;
    node.style.width = "100px";
    node.style.cursor = "pointer";
    div.className = "flex flex-row items-center gap-2 text-white"
    node.onclick = () => {
      charac.accused = !charac.accused;
      renderAccusations();
    }
    if (charac.accused) {
      node.style.border = "2px solid red";
    }
    div.appendChild(node);
    accusationsDiv.appendChild(div);

    let span = document.createElement("span");
    span.innerText = charac.name;
    div.appendChild(span);

  }

  document.getElementById("SubmitAccusations").onclick = () => {
    // TODO: Handle accusations
  }


}