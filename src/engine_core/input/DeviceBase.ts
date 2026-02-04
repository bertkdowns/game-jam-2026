import { Input } from ".";
// Base INPUT_DEVICE CLASS

export class InputDeviceBase {

  profile: Input.DeviceProfile = { axes: {}, buttons: {} };
  inputTarget?: Input.InputTarget;

  connect(target: Input.InputTarget) {
    // limits this gamepad to 1 target/user
    if (this.inputTarget) this.disconnect();
    this.inputTarget = target;
    // adds it to the device list of the user.

    this.inputTarget.addDevice(this);
    console.log("connecting device", this, "to", target);
    this.bindProperties();
  }
  disconnect = () => this.inputTarget?.removeDevice(this);
  bindProperties() { }
}
