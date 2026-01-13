

// adds a way to murge objects and their childn objects together recursively 
Object.assign(Object, {
    murge: (first, second) => {
        search(first, second);
        return first;

        function search(first, second) {
            Object.entries(second).forEach(([key, value]) => {
                if (!first[key])
                    first[key] = value;
                else if (typeof (value) === 'object')
                    search(first[key], value);
            });
        }
    }
});




Object.assign(Object, {
    assignByVal: (target, ...sources) => {

        // loops through the sources your wanting to assign to the target, if they are objects. 
        for (const source of sources) {
            if (source && typeof source == "object") {
                for (const [key, value] of Object.entries(source)) {
                    // loops through the entries and copies them, creating instances of the class prototypes etc as it goes. 
                    target[key] = deepAssign(target[key], value);
                }
            }
        }
        return target;



        function deepAssign(target, source) {
            // if its null or a primitive. (will assign to object, or if at parent level wont overwrite target)

            if (source === null || typeof source !== "object") {
                return source;
            }

            if (Array.isArray(source)) {
                // preserve subclass
                const out = new source.constructor(...source);
                return out;
            }

            // Objects / class instances (non-array)
            if (!target || Object.getPrototypeOf(target) !== Object.getPrototypeOf(source)) {
                target = Object.create(Object.getPrototypeOf(source));
            }

            for (const [key, value] of Object.entries(source)) {
                target[key] = deepAssign(target[key], value);
            }

            return target;
        }
    }
});




export function Instantiate(...components) { return Object.assign({}, ...components); }




