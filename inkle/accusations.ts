import { characters } from "./characters.js";

export function renderAccusations() {
  document.getElementById("AccusationModal").style.display = "block";
  let accusationsDiv = document.getElementById("Accusations");
  accusationsDiv.innerHTML = "";


  for (let charac of Object.values(characters)) {
    let node = document.createElement("img");
    node.src = charac.characterImage;
    node.style.width = "50px";
    node.style.cursor = "pointer";
    node.onclick = () => {
      charac.accused = !charac.accused;
      renderAccusations();
    }
    if (charac.accused) {
      node.style.border = "2px solid red";
    }
    accusationsDiv.appendChild(node);

  }

  document.getElementById("SubmitAccusations").onclick = () => {
    // TODO: Handle accusations
  }


}