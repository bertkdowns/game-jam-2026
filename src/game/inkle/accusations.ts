import { Character, characters, CHARACTERS } from "./Character";

export function renderAccusations() {
  const modal = document.getElementById("modal") as HTMLElement;
  const accusationModal = document.getElementById("AccusationModal") as HTMLElement;
  const accusationsDiv = document.getElementById("Accusations") as HTMLElement;
  const submitBtn = document.getElementById("SubmitAccusations") as HTMLElement;


  modal.style.display = "none";
  accusationModal.style.display = "block";
  accusationsDiv.innerHTML = "";


  for (let charac of Object.values(characters)) {
    if (charac.name === CHARACTERS.TUTORIAL_CHARACTER || charac.name === CHARACTERS.KING) {
      continue; // Skip tutorial character and king
    }
    let div = document.createElement("div");

    let node = document.createElement("img");
    node.src = charac.imageSrc;
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

  submitBtn.onclick = () => {
    // TODO: Handle accusations
    showBackgroundOverlay()

    // if king is dead
    if (false)
      setTimeout(() => { hideBackgroundOverlay(); renderResults() }, 2000);
    else
      renderResults();

  }
}

function showBackgroundOverlay() {

}
function hideBackgroundOverlay() {

}


export function renderResults() {
  const modal = document.getElementById("modal") as HTMLElement;
  const accusationModal = document.getElementById("AccusationModal") as HTMLElement;
  const accusationsDiv = document.getElementById("AccusationModal") as HTMLElement;
  modal.style.display = "none";
  accusationModal.style.display = "block";
  accusationsDiv.innerHTML = `
  <div class="text-white m-auto text-center">
    <h2>Assasins:</h2>
    <div class="h-400 flex flex-row justify-center" id="badguys"></div>
    <h2>Innocents:</h2>
    <div class="h-400 flex flex-row justify-center" id="goodguys"></div>

     <div id="finalText" ></div>
    </div>

  </div>
  `
  const badddies = [
    characters[CHARACTERS.STABLEMASTER],
    characters[CHARACTERS.JESTER],
    characters[CHARACTERS.HEAD_ENGINEER],
  ]
  const gooddies = [
    characters[CHARACTERS.HEADCHEF],
    characters[CHARACTERS.VISITING_BARON],
    characters[CHARACTERS.JUDGE],
    characters[CHARACTERS.BISHOP],
    characters[CHARACTERS.STEWARD],
    characters[CHARACTERS.GENERAL],
    characters[CHARACTERS.MAYOR],
  ]
  PopulateBadGuyElement(badddies);
  PopulateGoodGuyElement(gooddies);

  const aliveVillians = badddies.filter(b => !b.accused).length;
  const aliveInnocents = gooddies.filter(g => !g.accused).length;
  const deadInnocents = gooddies.filter(g => g.accused).length;
  const deadVillians = badddies.filter(b => b.accused).length;

  const finalText = document.getElementById("finalText") as HTMLElement;
  finalText.innerHTML = `
  ${aliveVillians === 0 ? "No villians were left alive" : `You killed ${deadVillians} villians, but ${aliveVillians} were left alive.`}<br/>
  ${deadInnocents === 0 ? "No innocents were harmed" : `You accidentally killed ${deadInnocents} innocents, while ${aliveInnocents} survived.`} <br/>
  ${aliveVillians === 0 && deadInnocents === 0 ? "<strong>You successfully saved the kingdom!</strong>" : ""}
  `;
}



function PopulateBadGuyElement(badddies: Character[]) {
  let badguys = document.getElementById("badguys");
  if (!badguys)
    throw new Error("element id 'badguys' not found");

  for (const bad of badddies) {
    badguys.appendChild(image(bad.accused, 300, bad.imageSrc));
  }
}

function PopulateGoodGuyElement(gooddies: Character[]) {
  let goodguys = document.getElementById("goodguys");
  if (!goodguys)
    throw new Error("element id 'goodguys' not found");

  for (const good of gooddies) {
    goodguys.appendChild(image(good.accused, 200, good.imageSrc));
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



