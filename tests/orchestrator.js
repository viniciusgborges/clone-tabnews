import retry from "async-retry";

async function waitForAllServices() {
  await waitForWebServer();

  async function waitForWebServer() {
    const url = `${process.env.WEB_SERVER_URL}/api/v1/status`;

    // why: without this guard an undefined var makes every retry fail silently for ~100s.
    if (!process.env.WEB_SERVER_URL) {
      throw Error("WEB_SERVER_URL não definida em .env.development");
    }

    return retry(fetchStatusPage, {
      retries: 100,
      maxTimeout: 1000,
    });

    async function fetchStatusPage() {
      const response = await fetch(url);

      if (!response.ok) {
        throw Error(`Servidor web não respondeu OK em ${url}`);
      }
    }
  }
}

export default {
  waitForAllServices,
};
