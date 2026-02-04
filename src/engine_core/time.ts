export class Time {
    static deltaTime = 1;
    static lastTime = Date.now() / 1000;
    static getCurrentTime() { return Date.now() / 1000 };
    static Update() {
        const currentTime = Time.getCurrentTime(); // time in seconds 
        Time.deltaTime = currentTime - Time.lastTime;
        Time.lastTime = currentTime;
    }
}