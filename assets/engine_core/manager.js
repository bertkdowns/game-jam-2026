export class Manager {
    static frameUpdateEvent = [];
    static Update() {for(const fn of Manager.frameUpdateEvent) fn();}


    static AddUpdateEvents = (list) => Manager.frameUpdateEvent = Manager.frameUpdateEvent.concat(list);
    static AddUpdateEvent = (event) => Manager.frameUpdateEvent.push(event);

    static StartUpdateLoop() {
        Manager.AddUpdateEvent(() => requestAnimationFrame(Manager.Update)),
            Manager.Update();
    }
}
