/* eslint-disable import/prefer-default-export */
/* eslint-disable no-console */
/**
 * This handler does litrally nothing :-)
 */
export class NOPHander {
  // implement interface of Handler (sorry, no super class etc.)
  // eslint-disable-next-line class-methods-use-this
  send(data) {
    console.log(`No Operation Handler\n${data}`);
  }
}
