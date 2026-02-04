
export interface GenericStateMachine<C extends GenericStateMachineClass = GenericStateMachineClass> {
    stateMachine: StateMachine<this, C>;
    // setter for state allows some transformation before updating the state
    set state(newState: StateOption);
    get state(): Events | undefined;
    get stateName(): string | undefined;
}
interface GenericStateMachineClass {
    new(...args: any[]): GenericStateMachine<GenericStateMachineClass>;
    STATES: StateList;
}

export type StateOption = State | string | number | undefined;
type Event = (...args: any[]) => any;
export interface Events {
    [key: string]: Event | undefined,
    onStart?: Event,
    onExit?: Event,
};



// - an implementation of a finite state machine, with entry and exit functions called when switching state. 
export class StateMachine<E extends GenericStateMachine<C>, C extends GenericStateMachineClass> {
    entity: E;
    entityClass: C;

    constructor(entity: E) {
        this.entity = entity;
        this.entityClass = entity.constructor as C;
    }

    _currentState: State | undefined;
    set currentState(newState: StateOption) {
        this.set(newState);
    }
    get currentState(): Events {
        return this._currentState?.events || {};
    }
    get stateName(): string | undefined {
        return this._currentState?.name;
    }

    set(newState: StateOption) {
        //console.log(this, this.entity.constructor);
        if (!(newState == undefined || newState instanceof State || (newState = this.entityClass.STATES[newState] as State))) {
            console.error(`state ${newState} is not a valid state`);
            return;
        }

        // switches to the current state, exiting the old state first. 
        console.log(`setting ${this.entity.constructor.name} to state: ${newState?.name}`);
        this._currentState?.events?.onExit?.bind(this.entity)();
        newState?.events?.onStart?.bind(this.entity)();
        this._currentState = newState;
    }

    call(targetEvent: string, ...params: any[]) {
        this.currentState[targetEvent]?.bind(this.entity)(...params);
    }
}




// organises the event params
export class State {
    name: string;
    events: Events;

    constructor(name: string, events: Events) {
        this.name = name; // helps when debugging
        this.events = events;
    }
}
export class StateList {
    [key: string]: any; // Allows the dynamic properties

    // assigns the states as read-only values. 
    // these values can be accessed via their index or key
    // (this allows you to set state to [0] to return the first state as a default value)
    constructor({ ...states }) {
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