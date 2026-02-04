import { AnymatchFn } from "vite";
import { Manager } from "./manager";
import type { SceneObject } from "./scene";



declare global {
    interface Object {
        murge: (first: object, second: object) => any;
        assignWithPropertiesRecursive: (target: any, ...sources: object[]) => any;
        assignWithProperties: (target: any, ...sources: object[]) => any;

    }
}
// adds a way to murge objects and their childn objects together recursively 
Object.assign(Object, {
    murge: (first: object, second: object) => {
        search(first, second);
        return first;

        function search(first: any, second: object) {
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
    assignWithPropertiesRecursive: (target: any, ...sources: object[]) => {

        // loops through the sources your wanting to assign to the target, if they are objects. 
        for (const source of sources) {
            if (source && typeof source == "object") {
                // adds entries 
                for (const [key, value] of Object.entries(source)) {
                    // loops through the entries and copies them, creating instances of the class prototypes etc as it goes. 
                    target[key] = deepAssign(target[key], value);
                }
                // adds getters and setters 
                Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));

                // adds prototype functions 
                const proto = Object.getPrototypeOf(source);
                for (const [key, descriptor] of Object.entries(Object.getOwnPropertyDescriptors(proto))) {
                    if (typeof descriptor.value === "function") {
                        Object.defineProperty(target, key, descriptor);
                    }
                }
            }
        }
        return target;


        function deepAssign(target: any, source: any): any {
            // primitives / null
            if (source === null || typeof source !== "object") {
                return source;
            }

            // arrays → recurse elements
            if (Array.isArray(source)) {
                return source.map(v => deepAssign(undefined, v));
            }

            // class instance → SHALLOW copy ONLY
            if (isClassInstance(source)) {
                const out = Object.create(Object.getPrototypeOf(source));

                for (const key of Object.keys(source)) {
                    out[key] = source[key]; // no recursion
                }

                return out;
            }

            // plain object → deep recurse
            if (!target || !isPlainObject(target)) {
                target = {};
            }

            for (const [key, value] of Object.entries(source)) {
                target[key] = deepAssign(target[key], value);
            }

            return target;
        }

    }
});

function isPlainObject(v: object): boolean {
    if (v === null || typeof v !== "object") return false;
    const proto = Object.getPrototypeOf(v);
    return proto === Object.prototype || proto === null;
}

function isClassInstance(v: object): boolean {
    return v !== null &&
        typeof v === "object" &&
        !isPlainObject(v) &&
        !Array.isArray(v);
}




Object.assign(Object, {
    assignWithProperties: (target: any, ...sources: object[]) => {

        // loops through the sources your wanting to assign to the target, if they are objects. 
        for (const source of sources) {
            if (source && typeof source == "object") {
                // adds entries 
                for (const [key, value] of Object.entries(source)) {
                    if (key.charAt(0) == '_') continue;
                    // loops through the entries and copies them, creating instances of the class prototypes etc as it goes. 
                    target[key] = value;
                }

                // adds getters and setters removes properties that are meant to be hidden (starting with '_')
                Object.entries(Object.getOwnPropertyDescriptors(source)).map(([key, property]) => {
                    if (key.charAt(0) != '_')
                        Object.defineProperty(target, key, property);
                });

                //Object.defineProperties(target,Object.getOwnPropertyDescriptors(source));

                // adds prototype functions 
                const proto = Object.getPrototypeOf(source);
                for (const [key, descriptor] of Object.entries(Object.getOwnPropertyDescriptors(proto))) {
                    if (typeof descriptor.value === "function") {
                        Object.defineProperty(target, key, descriptor);
                    }
                }
            }
        }
        return target;
    }
});

export function Instantiate(...components: object[]): any {
    const out = [];
    // allows components to be
    for (var c of components) {
        if (typeof c === "function")
            c = c();

        if (Array.isArray(c))
            out.push(...c);
        else
            out.push(c);
    }

    // look for init functions and turn them into an array
    const initList: (() => void)[] = [];
    for (const o of out) {
        if (typeof o["init"] === "function") {
            initList.push(o.init);
        }
    }

    const obj: SceneObject = Object.assignWithProperties({ initList }, ...out);
    // the first function in the Managers update loop initialises everything and also calls start. 
    Manager.PushObjectInit(obj);
    return obj;
}
