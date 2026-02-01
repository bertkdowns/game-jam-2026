
import { Time } from "./time";

export class Manager {
    static frameUpdateEvent = [Time.Update,Manager.HandleObjectInit];
    static init = [];

    static Update() { for (const fn of Manager.frameUpdateEvent) fn(); }


    static AddUpdateEvents = (list) => Manager.frameUpdateEvent = Manager.frameUpdateEvent.concat(list);
    static AddUpdateEvent = (event) => Manager.frameUpdateEvent.push(event);

    static StartUpdateLoop() {
        Manager.AddUpdateEvent(() => requestAnimationFrame(Manager.Update)),
            Manager.Update();
    }
    static HandleObjectInit() {
        //console.log(`manager length is ${Manager.init.length}`);
        for (const obj of Manager.init) {
            for (const init of obj.initList) init.bind(obj)();
            obj.Start?.();
        }
        Manager.init = [];
    }
    static PushObjectInit(obj) {
        //console.log(`added ${obj} to init list`);
        Manager.init.push(obj);
    }
}
