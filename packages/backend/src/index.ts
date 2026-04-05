import app from "./app.js";
import { env } from "./config/env.js";
import { startEventListener } from "./services/event-listener.service.js";
import { logger } from "./utils/logger.js";

async function main() {
  const port = Number(env.PORT);

  app.listen(port, () => {
    logger.info(`API Market Gateway listening on port ${port}`);
  });

  try {
    await startEventListener();
  } catch (error) {
    logger.warn(
      { error },
      "Event listener failed to start (contract may not be deployed yet)"
    );
  }
}

main().catch((err) => {
  logger.error(err, "Fatal error");
  process.exit(1);
});
