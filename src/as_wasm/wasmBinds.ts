
//@ts-ignore
@external("env", "logf")
declare function logf(val: f32): f32;
/// intended use case
// use ts as unity might a c# file, monobehavior, that can have modules attached to it, 
// for drawing/rendering, you use an external call, passing the buffers or whatever 
// this way cpu heavy tasks like handling/concatinating buffers etc can be processed on the wasm side. 


// called from main.js atm (lets me test logf) to see if its working 

export function run(): void {
  const out: f32 = logf(67); // Calls the 'logf' function from the 'env' module in the host
  console.log(out.toString());
}