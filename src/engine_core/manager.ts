
import { Time } from "./time";
import type { SceneObject } from "./scene";

type Event = () => void;

export class Manager {
    static frameUpdateEvent = [Time.Update, Manager.HandleObjectInit];
    static init: SceneObject[] = [];

    static Update() { for (const fn of Manager.frameUpdateEvent) fn(); }


    static AddUpdateEvents = (list: Event[]) => list.forEach((event) => Manager.frameUpdateEvent.push(event));
    static AddUpdateEvent = (event: Event) => Manager.frameUpdateEvent.push(event);

    static StartUpdateLoop() {
        Manager.AddUpdateEvent(() => requestAnimationFrame(Manager.Update)),
            Manager.Update();
    }
    static HandleObjectInit() {
        //console.log(`manager length is ${Manager.init.length}`);
        for (const obj of Manager.init) {
            for (const init of obj.initList) {
                init.bind(obj)();
            }
            obj.Start?.();
        }
        Manager.init = [];
    }
    static PushObjectInit(obj: SceneObject) {
        //console.log(`added ${obj} to init list`);
        Manager.init.push(obj);
    }
}
