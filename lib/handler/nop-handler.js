/**
 * This handler does litrally nothing :-)
 */
export class NOPHander {
  // implement interface of Handler (sorry, no super class etc.)
  send(data) {
    console.log(`No Operation Handler\n${data}`);
  }
}
