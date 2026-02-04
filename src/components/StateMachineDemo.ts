import { input } from "@engine_core/input";
import { State, StateList, StateOption, StateMachine, GenericStateMachine, Events } from "./StateMachine";



// 
export class DemoEntity implements GenericStateMachine<typeof DemoEntity> {

  stateMachine: StateMachine<this, typeof DemoEntity>;


  constructor() {
    this.stateMachine = new StateMachine(this);
  }

  // setter for state allows some transformation before updating the state
  set state(newState: StateOption) { this.stateMachine.currentState = newState };
  get state(): Events | undefined { return this.stateMachine.currentState };
  get stateName(): string | undefined { return this.stateMachine.stateName };


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
  static whileIdle(this: DemoEntity) {
    //console.log("running idle (everyframe), presss up to jump");
    if (input.ArrowUp) {
      this.state = DemoEntity.STATES.jump;
    }
  }
  static onJump(this: DemoEntity) {
    // waits then transitions to falling 
    console.log("started jump, setting timeout");
    setTimeout(() => {
      console.log("jump timout completed ");
      this.state = DemoEntity.STATES.fall;
    }, 1000);
  }

  static onFall(this: DemoEntity) {
    // waits then transitions to idle 
    console.log("started falling");
    setTimeout(() => {
      console.log("fall timeout completed");
      this.state = DemoEntity.STATES.idle;
    }, 2000);
  }
}