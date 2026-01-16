// button mapping
const deadzone = 0.04;
const gamepadProfiles = {
    "standard": {
        // indices for the button layout
        axes: {
            lHorizontal: 0,
            lVertical: 1,
            rHorizontal: 2,
            rVertical: 3,
        },
        mapAxes: (axis, value) => Math.abs(value) > deadzone ? value : 0,  // adds a deadzone
        buttons: {
            dpadUp: 12,
            dpadDown: 13,
            dpadLeft: 14,
            dpadRight: 15,
            x: 0,
            y: 3,
            a: 1,
            b: 2,
            back: 8,
            start: 9,
            l1: 4,
            l2: 6,
            l3: 11,
            r1: 5,
            r2: 7,
            r3: 11,
        }
    },
    "3537-0102-GameSir-X2 Pro-Xbox": {
        axes: {
            lHorizontal: 0,
            lVertical: 1,
            rHorizontal: 2,
            rVertical: 5,
        },
        //(0 -> 2) not -1 -> 1 so need the -1 to push it into range
        mapAxes: (axis, value) => {

            value -= 1; //  ["lHorizontal","lVertical", "rHorizontal"].includes(axis)? 1: 0; 


            return Math.abs(value) > deadzone ? value : 0;
            // adds a deadzone
        },
        buttons: {
            dpadUp: 12,
            dpadDown: 13,
            dpadLeft: 14,
            dpadRight: 15,
            x: 0,
            y: 3,
            a: 1,
            b: 2,
            back: 8,
            start: 9,
            l1: 4,
            l2: 6,
            l3: 11,
            r1: 5,
            r2: 7,
            r3: 11,
        }
    },
    "054c-0ce6-DualSense Wireless Controller": {
        axes: {
            lHorizontal: 0,
            lVertical: 1,
            rHorizontal: 2,
            rVertical: 5,
        },
        buttons: {
            dpadUp: 12,
            dpadDown: 13,
            dpadLeft: 14,
            dpadRight: 15,
            x: 0,
            y: 3,
            a: 1,
            b: 2,
            back: 8,
            start: 9,
            l1: 4,
            l2: 6,
            l3: 11,
            r1: 5,
            r2: 7,
            r3: 11,
        }
    },
}










// target is our formatted controller input
class InputTarget {
    constructor() {
        // makes sure it has defaults so we dont get any errors if we are missing a button. 
        this.addBindingsFromDeviceProfile(gamepadProfiles["standard"]);
    }


    removeDevice = (device) => this.devices.remove(device);
    addDevice(device) {
        console.log("adding device");
        this.devices.push(device);
        this.addBindingsFromDeviceProfile(device.profile);
        // add fields
    }

    addBindingsFromDeviceProfile(profile) {
        // adds new axes bindings 
        if (profile.axes) {
            for (const [field] of Object.entries(profile.axes)) {
                const alias = InputTarget.inputProfile.axes[field]; // checks if theres an alias for this field.
                console.log(field, alias, ` already exists: ${this[field] != null || this[alias] != null}`);
                if (this[field] != null || this[alias] != null) continue; // skips field if it already exist
                Object.defineProperty(this, alias || field, {
                    enumerable: true,
                    get() {
                        // returns the value from the device with the greatest value 
                        // (this targets the generated properties which have deadzones and offsets that are factored in when it provides it here)
                        var value = 0;
                        for (const device of this.devices) {
                            if (Object.hasOwn(device, field) && Math.abs(device[field]) > Math.abs(value))
                                value = device[field];
                        }
                        return value;
                    }
                });
            }
        }
        // adds new button bindings. 
        if (profile.buttons) {
            for (const [field] of Object.entries(profile.buttons)) {
                const alias = InputTarget.inputProfile.buttons[field]; // checks if theres an alias for this field. 
                console.log(field, alias, ` already exists: ${this[field] != null || this[alias] != null}`);
                if (this[field] != null || this[alias] != null) continue; // skips field if it already exist
                Object.defineProperty(this, alias || field, {
                    enumerable: true,
                    get() {
                        // returns the value from the device with the greatest value 
                        var value = 0;
                        for (const device of this.devices) {
                            if (Object.hasOwn(device, field))
                                value = Math.max(value, device[field]);
                        }
                        return value;
                    }
                });
            }
        }
    }



    // list of devices trying to write to this input
    devices = [];

    // aliases for the controller inputs it will fetch. 
    static inputProfile = {
        axes: {
            lHorizontal: "moveHorizontal",
            lVertical: "moveVertical",
            rHorizontal: "lookHorizontal",
            rVertical: "lookVertical",
        },
        buttons: {
            x: "interact",
        }
    }
}

// device is per controller
class GamepadDevice {
    inputTarget;
    profile;
    gamepadIndex;
    constructor(gamepad) {
        // stores the gamepad in a dictionary
        gamepads[gamepad.index] = gamepad;
        this.gamepadIndex = gamepad.index;
        // fetches gamepad layout profile based on its name if its not using the standard mapping
        this.profile = gamepad.mapping != "standard" && Object.keys(gamepadProfiles).includes(gamepad.id) ? gamepadProfiles[gamepad.id] : gamepadProfiles["standard"];


    }

    bindProperties() {
        // looks through the buttons and axes in this gamepads profile.
        // if there is a known alias we will bind input to the alias instead (allows us to call input.shoot instead of input.r2) etc. 
        // then we create the properties on the target, making their getter return the value of the button or axis it represents.  

        if (this.profile.mapAxes == null)
            this.profile.mapAxes = gamepadProfiles["standard"].mapAxes; 

        for (const [label, index] of Object.entries(this.profile.axes))
            Object.defineProperty(this, label, {
                enumerable: true, get() {
                    return this.profile.mapAxes(label, gamepads[this.gamepadIndex].axes[index]);
                    
                }
            });

        for (const [label, index] of Object.entries(this.profile.buttons))
            Object.defineProperty(this, label, { enumerable: true, get() { return gamepads[this.gamepadIndex].buttons[index].value; } });
    }

    connect(target) {
        // limits this gamepad to 1 target/user
        if (this.inputTarget) this.disconnect();
        this.inputTarget = target;
        // adds it to the device list of the user. 

        this.inputTarget.addDevice(this);
        console.log("connecting device", this, "to", target);
        this.bindProperties();


    }
    disconnect = () => this.inputTarget.removeDevice();
}


class MouseKeyboardDevice {
    bindProperties() {

        // looks through the buttons and axes in this gamepads profile.
        // if there is a known alias we will bind input to the alias instead (allows us to call input.shoot instead of input.r2) etc. 
        // then we create the properties on the target, making their getter return the value of the button or axis it represents.  
        for (const label of Object.keys(this.profile.axes))
            Object.defineProperty(this, label, { get() { return this.profile.axes[label](); } });

        for (const label of Object.keys(this.profile.buttons))
            Object.defineProperty(this, label, { get() { return this.profile.buttons[label](); } });
    }
    connect(target) {
        // limits this gamepad to 1 target/user
        if (this.inputTarget) this.disconnect();
        this.inputTarget = target;
        // adds it to the device list of the user. 
        this.inputTarget.addDevice(this);
        this.bindProperties();
    }
    disconnect = () => this.inputTarget.removeDevice();

    // buffer for the keys pressed, needs to be initialised for all its listening for 
    pressed = {
        ArrowUp: 0,
        ArrowDown: 0,
        ArrowLeft: 0,
        ArrowRight: 0,
    }
    _mouseX = 0;
    _mouseY = 0;

    // allows the mapping of inputs to this
    profile = {
        axes: {
            lHorizontal: () => this.pressed.ArrowRight - this.pressed.ArrowLeft,
            lVertical: () => this.pressed.ArrowDown - this.pressed.ArrowUp,
            rHorizontal: () => 0,
            rVertical: () => 0,
            mouseX: () => this._mouseX,
            mouseY: () => this._mouseY,
        },
        buttons: {
        }
    }
}



// currently configured to use 'input' as if there is only one player. 
// with a bit of code you should be able to bind create and bind new controllers to new users if you wanted a multiplayer game.  
export const users = [new InputTarget()];
export const [input] = users;
window.input = input;

const gamepads = {}; // the source of all gamepad state, is updated everyframe with the new state.  






console.log("adding mouse and keyboard");

// adds mouse and keyboard device to 'input' (user 1)
const MKBDevice = new MouseKeyboardDevice();
MKBDevice.connect(input);














export function InputUpdate() {
    // updates the gamepad values 
    for (const pad of navigator.getGamepads()) {
        if (pad) gamepads[pad.index] = pad;
    }
}
export function InputLateUpdate() {
    if (document.pointerLockElement) {
        MKBDevice._mouseX = 0;
        MKBDevice._mouseY = 0;
    }
}


// connection & disconnection 
window.addEventListener("gamepadconnected", (e) => {
    console.log(`Gamepad ${e.gamepad.id} connected at index ${e.gamepad.index}: ${e.gamepad.buttons.length} buttons, ${e.gamepad.axes.length} axes.`);

    // creates a new inputDevice then binds it to its desired user
    const gamepad = new GamepadDevice(e.gamepad);
    gamepad.connect(input);
    console.log("here");
});

window.addEventListener("gamepaddisconnected", (e) => {
    // disconnects the device then deletes its entry in gamepads
    gamepads[e.gamepad.index].disconnect();
    delete gamepads[e.gamepad.index];
});



// ====  MOUSE INPUT   ====
const allCanvas = document.querySelectorAll("canvas");

export const Enable2DMouse = () => allCanvas.forEach(canvas => canvas.addEventListener("mousemove", HandleUnlockedMouse));
export const Disable2DMouse = () => allCanvas.forEach(canvas => canvas.removeEventListener("mousemove", HandleUnlockedMouse));
Enable2DMouse();


export const EnableCanvasLock = () => allCanvas.forEach(canvas => {
    canvas.addEventListener("click", canvas.requestPointerLock);
    document.addEventListener("mousemove", HandleLockedMouse);
});

export const DisableCanvasLock = () => allCanvas.forEach(canvas => {
    canvas.removeEventListener("click", canvas.requestPointerLock);
    document.removeEventListener("mousemove", HandleLockedMouse);
});

function HandleLockedMouse(e) {
    const canvas = e.target;
    //console.log(canvas);

    if (document.pointerLockElement === canvas) {
        MKBDevice._mouseX = e.movementX;
        MKBDevice._mouseY = e.movementY;
    }
}
function HandleUnlockedMouse(e) {
    const canvas = e.target;
    //console.log(canvas);

    if (document.pointerLockElement)
        return;
    const rect = canvas.getBoundingClientRect();
    const halfW = canvas.width / 2;
    const halfH = canvas.height / 2;

    MKBDevice._mouseX = ((e.clientX - rect.left) - halfW) / halfW;
    MKBDevice._mouseY = (halfH - (e.clientY - rect.top)) / halfH;
}



// KEYBOARD INPUT 
document.addEventListener("keydown", (event) => {
    if (MKBDevice.pressed[event.code] != undefined) {
        MKBDevice.pressed[event.code] = 1;
    }
    else console.log(`missed ${event.code}`);
});
document.addEventListener("keyup", (event) => {
    if (MKBDevice.pressed[event.code] != undefined) {
        MKBDevice.pressed[event.code] = 0;
    }
})














//#region /* console button detector */
const last = {
    axes: {},
    buttons: {},
}
// call this function from the console to help figure out button bindings
window.detectGameadChanges = () => {
    detectGameadChanges();
    // makes it repeat 10 times per second 
    setInterval(() => navigator.getGamepads().map(detectGameadChanges), 100);
};

function detectGameadChanges(gamepad) {
    if (gamepad == null) return;
    for (const key in gamepad.axes) {
        if (last.axes[key] != gamepad.axes[key]) console.warn(`axis ${key} changed from ${last.axes[key]} to ${gamepad.axes[key]}`);
        last.axes[key] = gamepad.axes[key];
    }
    for (const key in gamepad.buttons) {
        if (last.buttons[key] != gamepad.buttons[key].value) console.warn(`button ${key} changed from ${last.buttons[key]} to ${gamepad.buttons[key].value}`);
        last.buttons[key] = gamepad.buttons[key].value;
    }
}
//#endregion /* console button detector */

