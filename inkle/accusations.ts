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
    renderResults();
  }


}

export function renderResults() {

  document.getElementById("modal").style.display = "none";
  document.getElementById("AccusationModal").style.display = "block";

  document.getElementById("Accusations").innerHTML = `
  <div>
    <h2 class="text-white text-2xl mb-4">Results</h2>
    <h2>Assasins:</h2>
    <div class="w-full h-400 flex flex-row justify-center" id="badguys"></div>
    <h2>Innocents:</h2>
    <div class="w-full h-400 flex flex-row" id="goodguys"></div>
    </div>
  </div>
  `
  const badddies = [
    characters[CHARACTERS.STABLEMASTER],
    characters[CHARACTERS.HEAD_ENGINEER],
    characters[CHARACTERS.JESTER],
  ]
  const gooddies = [
    characters[CHARACTERS.HEADCHEF],
    characters[CHARACTERS.VISISING_BARRON],
    characters[CHARACTERS.JUDGE],
    characters[CHARACTERS.BISHOP],
    characters[CHARACTERS.STEWARD],
    characters[CHARACTERS.GENERAL],
    characters[CHARACTERS.MAYOR],
  ]
  let badguys = document.getElementById("badguys");
  for (let bad of badddies) {
    badguys.appendChild(image(bad.accused, 300, bad.characterImage));
  }
  let goodguys = document.getElementById("goodguys");
  for (let good of gooddies) {
    goodguys.appendChild(image(good.accused, 200, good.characterImage));
  }



}

function image(dead: boolean, size: number, srcImage: string) {
  // Returns a dead or alive image icon of given size
  let div = document.createElement("div");
  div.style.position = "relative";
  div.style.width = `${size}px`;
  div.style.height = `${size}px`;

  const imgBase = document.createElement("img");
  imgBase.style.width = "100%";
  imgBase.style.height = "100%";
  imgBase.style.display = "block";

  if (dead) {
    const imgOverlay = document.createElement("img");
    imgOverlay.style.position = "absolute";
    imgOverlay.style.top = "0";
    imgOverlay.style.left = "0";
    imgOverlay.style.width = "100%";
    imgOverlay.style.height = "100%";
    imgOverlay.style.pointerEvents = "none";
    div.appendChild(imgOverlay);
    imgOverlay.src = "assets/dead.png"
  }

  imgBase.src = srcImage

  div.appendChild(imgBase);

  return div;
}