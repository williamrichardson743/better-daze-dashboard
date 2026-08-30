const baseUrl = process.env.BASE_URL?.replace(/\/$/, "");

if (!baseUrl) {
  console.error(
    "BASE_URL is required, for example: BASE_URL=https://preview.example.com node scripts/verify-public-routes.mjs"
  );
  process.exit(1);
}

const routes = [
  "/",
  "/inventory",
  "/services",
  "/story",
  "/learn",
  "/join",
  "/legal",
];

let failed = false;
for (const route of routes) {
  const url = `${baseUrl}${route}`;
  try {
    const response = await fetch(url, { redirect: "follow" });
    const body = await response.text();
    const routePasses =
      response.ok &&
      /<title>[^<]*Better Daze/i.test(body) &&
      /<div id="root"><\/div>/i.test(body);
    console.log(`${routePasses ? "PASS" : "FAIL"} ${response.status} ${url}`);
    if (!routePasses) failed = true;
  } catch (error) {
    console.error(
      `FAIL request ${url}: ${error instanceof Error ? error.message : String(error)}`
    );
    failed = true;
  }
}

try {
  const shop = await fetch("https://shop.better-daze-sf.com", {
    redirect: "follow",
  });
  console.log(
    `${shop.ok ? "PASS" : "FAIL"} ${shop.status} OND Shopify handoff`
  );
  if (!shop.ok) failed = true;
} catch (error) {
  console.error(
    `FAIL OND Shopify handoff: ${error instanceof Error ? error.message : String(error)}`
  );
  failed = true;
}

process.exit(failed ? 1 : 0);
