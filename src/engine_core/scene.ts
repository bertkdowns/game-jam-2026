

export type SceneObject = {
    initList: (() => void)[];
    Start?: () => void;
    Update?: () => void;
}



type objInvocation = (obj: SceneObject) => any;

export class Scene {
    heirachy: Record<string, SceneObject> = {}

    ForAllObjects(call: objInvocation) {
        searchChildrenOf(this.heirachy);
        function searchChildrenOf(parent: SceneObject | object) {
            for (const obj of Object.values(parent)) {
                call(obj);
                if (obj.children)
                    searchChildrenOf(obj);
            };
        }
    }

    static HandleUpdate(scene: Scene) {
        scene.ForAllObjects(obj => {
            obj.Update?.();
        });
    }
}