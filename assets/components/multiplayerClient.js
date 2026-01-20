// imports are for creating the sprites/gameobjects 
import { SpriteDependencies, renderer } from "../../main.js";
import { Instantiate } from "../engine_core/utils.js";

var gameID, name, currentClientID = "";
var multiplayerClient = undefined;

export function BeginClient(target, id, username) {
    gameID = id;
    name = username;
    // regex to match target ip address and makes it a ws ipaddress, has a fallback port
    const targetWSIP = target.replace(/^(?:\w+:\/\/)?(localhost)(?::(\d+))?$/, (_, h, p) => `wss://${h}:${p ?? 8000}/socket`);

    // connects to target and binds the event functions
    const socket = new WebSocket(targetWSIP);
    socket.addEventListener("open", onSocketOpen);
    socket.addEventListener("close", onSocketClose);
    socket.addEventListener("message", onSocketMessage);
}

// INITIAL REQUEST TO JOIN THE GAME
function onSocketOpen(e) {
    console.log(e);
    const socket = e.target;

    // creates the client 
    multiplayerClient = scene.heirachy["multiplayerClient"] = { synced: [] };
    // using jacobbox server middleware to connect the games.
    const clientInitialsationMessage = {
        type: "clientInitialisation", message: { name, gameID }
    };
    socket.send(JSON.stringify(clientInitialsationMessage));
    
}
function onSocketClose(e) {
    console.log("client socket has been closed", e);
}











// ONLY MESSAGES FROM THE SERVER
function onSocketMessage(e) {

    // should be in json format
    const data = JSON.parse(e.data) || { type: "parseError" };
    switch (data.type) {
        case "initialisation":
            StartClient(data.message, e.target);  // should load the current scene
            break;
        case "sync":
            SyncClients(data.message);
            break;
        default:
            console.log(e);
            console.log(`error, message: ${e.data} wasn't caught`);
            break;
    }
}







function StartClient({ clientID }, socket) {
    console.log("multiplayer client started, clientID:", clientID);
    currentClientID = clientID;
    const scene = window.scene;
    // adds an object to the heirachy (so it can be updateded every frame)
    // on message from the client decodes the message itterating through through the synced objects and updates their values, 
    // adding new users when needed. 
    multiplayerClient.Update = Update;
    function Update() {
        // writes to host with the clients position. 
        const position = [...scene.heirachy["player"].position];
        const messageToHost = {
            type: "syncClient",
            message: { clientID, position, }
        }
        //console.log("sending position", messageToHost);
        SendToHost(messageToHost);
    }
    function SendToHost(message) {
        socket.send(JSON.stringify({ type: "toHost", message }));
    }
}



function SyncClients({ clients }) {
    // removes this from the list of entries
    delete clients[currentClientID];
    
    for (const [clientID, client] of Object.entries(clients)) {
        // updates the position of the client
        var user = multiplayerClient.synced[clientID] || CreateNewUser(clientID);
        user.position = client.position;
    }
}




function CreateNewUser(clientID) {
    const newUser = Instantiate(SpriteDependencies, { texture: window.playerTexture });
    newUser.init(renderer.device);
    scene.heirachy[clientID] = multiplayerClient.synced[clientID] = newUser;
    return newUser;
}


































// adds the textboxes on the html page for joining a game
function addJacobBoxConnectionForm() {
    const form = document.createElement("form");
    const ipAddressInput = document.createElement("input");
    const gameIDInput = document.createElement("input");
    const usernameInput = document.createElement("input");
    const submitBtn = document.createElement("input");

    ipAddressInput.type = "text";
    ipAddressInput.placeholder = "ipaddress";
    ipAddressInput.style = "width:10em";
    submitBtn.type = "submit";
    submitBtn.value = "connect";
    usernameInput.type = "text";
    usernameInput.placeholder = "username";
    gameIDInput.type = "text";
    gameIDInput.placeholder = "gameID";
    gameIDInput.style = "width: 6em";


    // sets defaults
    ipAddressInput.value = "localhost";
    usernameInput.value = "defaultUser";

    form.addEventListener("submit", (event) => {
        event.preventDefault();
        BeginClient(ipAddressInput.value, gameIDInput.value, usernameInput.value);
    });

    form.innerText = "join";
    form.appendChild(ipAddressInput);
    form.appendChild(gameIDInput);
    form.appendChild(usernameInput);
    form.appendChild(submitBtn);

    document.body.appendChild(form);
}
addJacobBoxConnectionForm();




