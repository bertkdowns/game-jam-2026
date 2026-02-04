import { Input } from ".";
import { InputDeviceBase } from "./DeviceBase";
import { gamepadProfiles, aliasMap } from "./inputProfiles";

// input target is setup so that it exposes the buttons/aliases directly on inputTarget
// which makes it simpler to reference.

// target is our formatted controller input assigned per user
export class InputTarget {
  constructor() {
    // makes sure it has defaults so we dont get any errors if we are missing a button.
    this.addBindingsFromDeviceProfile(gamepadProfiles["standard"]);
  }

  // list of devices trying to write to this input (allows multiple controllers to talk to a single user)
  devices: InputDeviceBase[] = [];

  [key: string]: any;

  addDevice(device: InputDeviceBase) {
    console.log(`adding input device: ${device.constructor?.name}`);
    this.devices.push(device);
    this.addBindingsFromDeviceProfile(device.profile);
    // add fields
  }

  removeDevice = (device: InputDeviceBase) =>
    (this.devices = this.devices.filter((d) => d !== device));

  addBindingsFromDeviceProfile(profile: Input.DeviceProfile) {
    // adds new axes bindings
    if (profile.axes) {
      for (const [field] of Object.entries(profile.axes)) {
        const alias: any = aliasMap.axes[field]; // checks if theres an alias for this field.
        //console.log(field, alias, ` already exists: ${this[field] != null || this[alias] != null}`);
        if (this[field] != null || this[alias] != null) continue; // skips field if it already exist
        Object.defineProperty(this, alias || field, {
          enumerable: true,
          get() {
            // returns the value from the device with the greatest value
            // (this targets the generated properties which have deadzones and offsets that are factored in when it provides it here)
            var value = 0;
            for (const device of this.devices) {
              if (
                Object.hasOwn(device, field) &&
                Math.abs(device[field]) > Math.abs(value)
              )
                value = device[field];
            }
            return value;
          },
        });
      }
    }
    // adds new button bindings.
    if (profile.buttons) {
      for (const [field] of Object.entries(profile.buttons)) {
        const alias = aliasMap.buttons[field]; // checks if theres an alias for this field.
        //console.log(field, alias, ` already exists: ${this[field] != null || this[alias] != null}`);
        if (this[field] != null || this[alias] != null) continue; // skips field if it already exist
        Object.defineProperty(this, alias || field, {
          enumerable: true,
          get() {
            // returns the value from the device with the greatest value
            var value = 0;
            for (const device of this.devices) {
              if (Object.hasOwn(device, field))
                value = Math.max(value, device[field]);
            }
            return value;
          },
        });
      }
    }
  }
}
