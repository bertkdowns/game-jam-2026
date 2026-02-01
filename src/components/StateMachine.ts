import { input } from "../engine_core/input";
// - an implementation of a finite state machine, with entry and exit functions called when switching state. 


// - an implementation of a finite state machine, with entry and exit functions called when switching state. 
export class StateSystem {
    entity;

    _currentState = null;
    set currentState(newState) {
        this._currentState = newState;
    }
    get currentState() {
        return this._currentState?.events;
    } 
    
    get stateName() {
        return this._currentState?.name;
    }



    constructor(entity) {
        this.entity = entity;
    }

    set(newState) {
        //console.log(this, this.entity.constructor);
        if (!(newState == undefined || newState instanceof State || (newState = this.entity.constructor.STATES[newState]))) {
            console.error(`state ${newState} is not a valid state`);
            return;
        }
        // switches to the current state, exiting the old state first. 
        console.log("setting to state ", newState?.name);
        this._currentState?.onExit?.bind(this.entity)();
        newState?.onStart?.bind(this.entity)();
        this.currentState = newState;

    }
    call(targetEvent, ...params) {
        this.currentState[targetEvent]?.bind(this.entity)(...params);
    }
}


// organises the event params
export class State {
    constructor(name, { onStart = undefined, onExit = undefined, ...events }) {
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
    constructor() {
        this.stateSystem = new StateSystem(this);
        this.state = 0;
    }
    stateSystem;

    // setter for state allows some transformation before updating the state
    set state(newState) { this.stateSystem.set(newState) };
    get state() { return this.stateSystem.currentState };


    /// static as DemoEntity.STATES being able to be accessed outside of any object 
    /// allows us to create functions in other entities and set our state with the correct label   
    static STATES = new StateList({
        idle: new State("idle", {
            onStart: function () { console.log(`switching to idle`) },
            onExit: function () { console.log(`finishing idle`) },
            onEvent: this.whileIdle,
        }),
        jump: new State("jump", {
            onStart: this.onJump,
            onExit: function () { console.log("end of jump"); },
        }),
        fall: new State("fall", {
            onStart: this.onFall,
            onExit: function () { console.log("stopped falling"); },
        }),
    });

    // extends functions here so that STATES remains readable
    static whileIdle() {
        //console.log("running idle (everyframe), presss up to jump");
        if (input.ArrowUp) {
            this.state = DemoEntity.STATES.jump;
        }
    }
    static onJump() {

        // waits then transitions to falling 
        console.log("started jump, setting timeout");

        setTimeout(function () {
            console.log("jump timout completed ");
            this.state = DemoEntity.STATES.fall;
        }, 1000);
    }
    static onFall() {
        // waits then transitions to idle 
        console.log("started falling");
        setTimeout(function () {
            console.log("fall timeout completed");
            this.state = DemoEntity.STATES.idle;

        }, 2000);
    }
}