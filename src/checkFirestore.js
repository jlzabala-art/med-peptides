/* eslint-disable no-undef */
import { getProtocolTemplate } from './repositories/protocolRepository.js';

async function check() {
  try {
    const data = await getProtocolTemplate('weight-management-structured-12w');
    if (data) {
      console.log("RECOMMENDED SUPPLEMENTS:");
      console.log(JSON.stringify(data.recommended_supplements || data.recommendedSupplements, null, 2));
    } else {
      console.log("Protocol template weight-management-structured-12w not found!");
    }
  } catch (err) {
    console.error(err);
  }
  process.exit(0);
}

check();
