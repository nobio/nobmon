/**
 * This handler does litrally nothing :-)
 */
export class ConsoleLogHandler {
  // implement interface of Handler (sorry, no super class etc.)
  send(data) {
    if (!Array.isArray(data)) {
      throw new Error(`Data must be an array. ${JSON.stringify(data)}`);
    }
    data.forEach((point) => {
      console.log(`  Topic: ${point.topic}.${point.name}: ${point.value}`);
    });
  }
}
