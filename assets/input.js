export var input = {
    ArrowUp: 0,
    ArrowDown: 0,
    ArrowLeft: 0,
    ArrowRight: 0,
    mouseX: 0,
    mouseY: 0,
    moveHorizontal : 0, 
    moveVertical : 0, 
    lookHorizontal : 0, 
    lookVertical: 0,
};


document.addEventListener("keydown", (event) => {
    if (input[event.code] != undefined) {
        input[event.code] = 1;
    }
    else console.log(`missed ${event.code}`);
});
document.addEventListener("keyup", (event) => {
    if (input[event.code] != undefined) {
        input[event.code] = 0;
    }
})




const allCanvas = document.querySelectorAll("canvas");
export function EnableCanvasLock() {
    allCanvas.forEach(canvas => {
        canvas.addEventListener("click", canvas.requestPointerLock);
        document.addEventListener("mousemove", HandleLockedMouse);
    });
}
export function DisableCanvasLock() {
    allCanvas.forEach(canvas => {
        canvas.removeEventListener("click", canvas.requestPointerLock);
        document.removeEventListener("mousemove", HandleLockedMouse);
    });
}
function HandleLockedMouse(e) {
    const canvas = e.target;
    //console.log(canvas);

    if (document.pointerLockElement === canvas) {
        input.mouseX = e.movementX;
        input.mouseY = e.movementY;
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
    input.mouseX = ((e.clientX - rect.left) - halfW) / halfW;
    input.mouseY = (halfH - (e.clientY - rect.top)) / halfH;
}


export function Enable2DMouse() {
    // early exit so were not impeading on any locked cursor stuff
    allCanvas.forEach(canvas => canvas.addEventListener("mousemove", HandleUnlockedMouse));
}

export function Disable2DMouse() {
    // early exit so were not impeading on any locked cursor stuff
    allCanvas.forEach(canvas => canvas.removeEventListener("mousemove", HandleUnlockedMouse));
}





const deadzone = 0.05;

export function HandleControllers() {
    const gamepads = navigator.getGamepads();
    if(gamepads[0]){
        const pad = gamepads[0]; 
        Object.assign(pad,  Object.keys(gamepadProfiles).includes(pad.id)? gamepadProfiles[pad.id]: gamepadProfiles["standard"]);
        

        const mh = pad.moveHorizontal(); 
        const mv = pad.moveVertical(); 
        const lh = pad.lookHorizontal(); 
        const lv = pad.lookVertical(); 

        // adds deadzone margin to prevent stick drift
        input.moveHorizontal = Math.abs(mh) > deadzone ? mh : 0;
        input.moveVertical = Math.abs(mv) > deadzone ? mv : 0;
        input.lookHorizontal = Math.abs(lh) > deadzone ? lh : 0;
        input.lookVertical = Math.abs(lv) > deadzone ? lv : 0;
    }
}




const gamepadProfiles = {
    "054c-0ce6-DualSense Wireless Controller" : {
        moveHorizontal(){ return this.axes[0]}, 
        moveVertical(){ return this.axes[1]}, 
        lookHorizontal(){ return this.axes[2]}, 
        lookVertical(){ return this.axes[5]}, 
    }, 
    "3537-0102-GameSir-X2 Pro-Xbox": {
         moveHorizontal(){ return this.axes[0] - 1}, 
        moveVertical(){ return this.axes[1] - 1}, 
        lookHorizontal(){ return this.axes[2] - 1}, 
        lookVertical(){ return this.axes[5] - 1}, 
    },
    "standard": {
        moveHorizontal(){ return this.axes[0]}, 
        moveVertical(){ return this.axes[1]}, 
        lookHorizontal(){ return this.axes[2]}, 
        lookVertical(){ return this.axes[3]}, 
    }
}