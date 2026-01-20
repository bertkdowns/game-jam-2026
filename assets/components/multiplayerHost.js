// imports are for creating the sprites/gameobjects 
import { SpriteDependencies, renderer } from "../../main.js";
import { Instantiate } from "../engine_core/utils.js";


// using jacobsmith3204:jacobbox as a middleman to stream comunication between instances.


// this one acting as a host and others acting as clients
var multiplayerHost = undefined;

export class MultiplayerHost {
    constructor(target) {
        // regex to match target ip address and makes it a ws ipaddress, has a fallback port
        const targetWSIP = target.replace(/^(?:\w+:\/\/)?(localhost)(?::(\d+))?$/, (_, h, p) => `wss://${h}:${p ?? 8000}/socket`);

        // connects to target and binds the event functions
        const socket = new WebSocket(targetWSIP);
        socket.addEventListener("open", this.onSocketOpen.bind(this));
        socket.addEventListener("close", this.onSocketClose.bind(this));
        socket.addEventListener("message", this.onSocketMessage.bind(this));
    }
    // INITIAL HOST REQUEST TO SETUP A TARGET IN JACOBBOX FOR THE CLIENTS TO CONNECT TO
    onSocketOpen(e) {
        console.log(e);
        const socket = e.target;
        // using jacobbox server middleware to connect the games. 
        const hostInitialsationMessage = {
            type: "hostInitialisation", message: {
                gameType: "webgpu",
                maxPlayers: 10,
                minPlayers: 2,
            }
        };
        socket.send(JSON.stringify(hostInitialsationMessage));
    }
    onSocketClose(e) {
        console.log(`Host socket has closed`, e);
    }

    // MESSAGES FROM THE USERS ETC 
    onSocketMessage(e) {
        console.log(e);
        // should be in json format
        const data = JSON.parse(e.data) || { type: "parseError" };
        switch (data.type) {
            // after onSocketOpen, the server will provide an initialation message with the gameID
            case "initialisation":
                displayHostGameData(data.message);
                this.StartHost(e.target);  // should load the current scene
                break;
            // whenever a client joins, add them and return with an initialisation message. 
            case "join":
                this.AddUser(data.message, e.target);
                break;
            // whenever a client sends their data (position)
            case "syncClient":
                this.SyncClient(data.message);
                break;
            default:
                console.log(`error, message: ${e.data} wasn't caught`);
                break;
        }
    }




    StartHost(socket) {
        const scene = window.scene;
        // adds an object to the heirachy (so it can be updateded every frame)
        // the update gets all gameobjects added to its synced class, itterates building a message. 
        // then pushes it to all clients attached to the jacobbox server. 

        // clients will then decode the message, (ignoring the items it has control over) and write the synced values to the object. 
        multiplayerHost = scene.heirachy["multiplayerHost"] = {
            // starts with itself in the synced list (since the host doesnt sync the same as the clients)
            synced: { host: scene.heirachy["player"] },
            Update
        };


        function Update() {
            const clients = {}
            const messageToAllClients = {
                type: "sync",
                message: {
                    clients
                }
            };

            // for each clients in synced, adds the clients data (ie: position) to the message
            for (const [clientID, client] of Object.entries(multiplayerHost.synced))
                clients[clientID] = { position: client.position };
            PushToClients(messageToAllClients);
            //console.log("HOST sending sync message: ", message);
        }

        function PushToClients(message) {
            socket.send(JSON.stringify({ type: "toAllClients", message }));
        }
    }


    AddUser(message, socket) {
        const name = message["name"];
        const clientID = message["id"];

        const newUser = CreateNewUser(clientID);
        console.log(`added user: ${name}(${clientID})`, newUser);

        const messageToNewClient = {
            type: "toClient",
            clientID,
            message: {
                type: "initialisation",
                message: { clientID }
            },
        };
        socket.send(JSON.stringify(messageToNewClient));


        function CreateNewUser(clientID) {
            const newUser = Instantiate(SpriteDependencies, { texture: window.playerTexture });
            newUser.init(renderer.device);
            scene.heirachy[clientID] = multiplayerHost.synced[clientID] = newUser;
            return newUser;
        }
    }


    SyncClient({ clientID, position }) {
        multiplayerHost.synced[clientID].position = position;
    }
}



// adds the textboxes on the html page for hosting a game
function displayHostGameData({ gameID }) {
    const label = document.createElement("input");
    label.type = "text";
    label.readOnly = true;
    label.value = gameID;
    label.addEventListener("click", (e) => {
        e.preventDefault();
        navigator.clipboard.writeText(gameID).then(() => {
            label.value = `${gameID}: copied to clipboard`;
            setTimeout(() => label.value = gameID, 2000);
        })
    });
    document.body.appendChild(label);
}

function addJacobBoxHostConnectionForm() {
    const form = document.createElement("form");
    const input = document.createElement("input");
    const submitBtn = document.createElement("input");

    input.type = "text";
    input.placeholder = "ipaddress";
    submitBtn.type = "submit";
    submitBtn.value = "connect";

    // sets defaults 
    input.value = "localhost";


    form.addEventListener("submit", (event) => {
        event.preventDefault();
        new MultiplayerHost(input.value);
    });
    form.innerText = "host";
    form.appendChild(input);
    form.appendChild(submitBtn);
    document.body.appendChild(form);
}
addJacobBoxHostConnectionForm();




