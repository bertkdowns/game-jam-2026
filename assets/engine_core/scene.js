export class Scene {
    heirachy = {}

    ForAllObjects(call) {
        searchChildrenOf(this.heirachy);
        function searchChildrenOf(parent) {
            for(const obj of Object.values(parent)){
                call(obj);
                if (obj.children)
                    searchChildrenOf(obj);
            };
        }
    }
}