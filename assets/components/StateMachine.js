import { input } from "../engine_core/input.js";
// - an implementation of a finite state machine, with entry and exit functions called when switching state. 


export class StateSystem {
    entity;
    currentState;
    constructor(entity) {
        this.entity = entity;
    }

    set(newState) {
         if (!(newState == undefined || newState instanceof State || (newState = DemoEntity.STATES[newState]))) {
            console.error(`state ${newState} is not a valid state`);
            return;
        }
        // switches to the current state, exiting the old state first. 
        console.log("setting to state ", newState?.name);
        this.currentState?.onExit?.(this.entity);
        newState?.onStart?.(this.entity);
        this.currentState = newState;
    }
    call(targetEvent) {
        this.currentState?.events[targetEvent]?.(this.entity);
    }
}
// organises the event params
export class State {
    constructor(name, { onStart, onExit, ...events }) {
        this.name = name; // helps when debugging
        this.onStart = onStart;
        this.onExit = onExit;
        this.events = events;
    }
}
export class StateList {
    // assigns the states as read-only values. 
    // these values can be accessed via their index or key
    // (this allows you to set state to [0] to return the first state as a default value)
    constructor(states) {
        Object.entries(states).map(([key, value], index) => {
            Object.defineProperty(this, key, {
                get() { return value },
            });
            Object.defineProperty(this, index, {
                get() { return value },
            });
        });
    }
}

// 
export class DemoEntity {
   
    skillSystem = new StateSystem(this);

    // setter for state allows some transformation before updating the state
    set state(newState) { this.skillSystem.set(newState) };
    get state() { return this.skillSystem.currentState };


    /// static as DemoEntity.STATES being able to be accessed outside of any object 
    /// allows us to create functions in other entities and set our state with the correct label   
    static STATES = new StateList({
        idle: new State("idle", {
            onStart: () => { console.log(`switching to idle`) },
            onExit: () => { console.log(`finishing idle`) },
            onEvent: e => e.whileIdle(e),
        }),
        jump: new State("jump", {
            onStart: e => e.onJump(e),
            onExit: () => { console.log("end of jump"); },
        }),
        fall: new State("fall", {
            onStart: e => e.onFall(e),
            onExit: () => { console.log("stopped falling"); },
        }),
    });

    // extends functions here so that STATES remains readable
    whileIdle() {
        //console.log("running idle (everyframe), presss up to jump");
        if (input.ArrowUp) {
            this.state = DemoEntity.STATES.jump;
        }
    }
    onJump(e) {
        // waits then transitions to falling 
        console.log("started jump, setting timeout", e);

        setTimeout(function() {
            console.log("jump timout completed ");
            e.state = DemoEntity.STATES.fall;
        }, 1000);
    }
    onFall(e) {
        // waits then transitions to idle 
        console.log("started falling");
        setTimeout(function() {
            console.log("fall timeout completed");
            e.state = DemoEntity.STATES.idle;
            
        }, 2000);
    }
}