const fetch = require("node-fetch"); // node 18+ has native fetch, but just in case we are in an older env, we can use http or native fetch

async function run() {
  const url = "https://accounts.zoho.me/oauth/v2/token";
  const params = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: "1000.NAHBCCYF5C9B3Z3YS2URAQ4TG7O76V",
    client_secret: "088b65381f7f30dfb801ff3f901e1af2c7adef11e5",
    code: "1000.3874253ac1db8eed4d02bad5b499f200.42125b59a0dec796216a7cd3475b0d4c"
  });

  try {
    const res = await fetch(`${url}?${params.toString()}`, { method: 'POST' });
    const data = await res.json();
    console.log(JSON.stringify(data, null, 2));
  } catch(e) {
    console.error(e);
  }
}
run();
