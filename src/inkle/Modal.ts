import {
  StateSystem,
  State,
  StateList,
} from "../components/StateMachine";



export class Modal {
  constructor() {
    this.skillSystem = new StateSystem(this);
    // Initialize state after DOM is ready to ensure hideModal can find the element
    const initClose = () => {
      this.state = "close";
      // Also explicitly hide it to ensure it's closed
      Modal.hideModal();
    };
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", initClose);
    } else {
      // DOM already loaded, but use setTimeout to ensure it's fully ready
      setTimeout(initClose, 0);
    }
  }
  skillSystem: StateSystem;

  // setter for state allows some transformation before updating the state
  set state(newState: number | string) {
    this.skillSystem.set(newState);
  }
  get state() {
    return this.skillSystem.currentState;
  }
  get stateName() {
    return this.skillSystem.stateName;
  }

  static STATES = new StateList({
    open: new State("open", {
      onStart: this.showModal,
    }),
    close: new State("close", {
      onStart: this.hideModal,
    }),
  });

  static showModal() {
    const modal = document.querySelector("#modal") as HTMLElement;
    if (modal) modal.style.display = "flex";
  }
  static hideModal() {
    const modal = document.querySelector("#modal") as HTMLElement;
    if (modal) modal.style.display = "none";
  }
}

export const modal = new Modal();

export function openModal() {
  modal.state = "open";
}

export function closeModal() {
  modal.state = "close";
}
