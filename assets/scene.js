export class Scene {
    heirachy = {}

    ForAllObjects(call) {
        searchChildrenOf(this.heirachy);
        function searchChildrenOf(parent) {
            Object.values(parent).forEach((obj) => {
                call(obj);
                if (obj.children)
                    searchChildrenOf(obj);
            });
        }
    }
}