//'use strict';

// -------------------LIB------------------ //
const EntryEngine = require("./lib/A2B_PPCmint");

// -------------------ENVIRONMENT------------------ //

// -------------------handler------------ //
exports.handler = async (event) => {
  const msg = event.Records[0].body;
  const queue = event.Records[0].eventSourceARN;

  console.log("msg:", msg);
  console.log("queue:", queue);

  const json = JSON.parse(msg);
  console.log("json:", json);

  const from_addr = json.from_addr;
  console.log("address:", from_addr);

  await EntryEngine.mintPPC(from_addr);
};
