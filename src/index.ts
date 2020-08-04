import {
  loadPackageDefinition,
  Server,
  ServerCredentials,
  ServerWritableStream,
  ServiceDefinition,
} from "@grpc/grpc-js";
import { load } from "@grpc/proto-loader";
import { path } from "ramda";

const watchX = (stream: ServerWritableStream<unknown, unknown>): void => {
  stream.write({});

  stream.once("cancelled", (): void => {
    console.info("cancelled");
  });
};

export const start = async (): Promise<Server> => {
  const server = new Server();

  const packageDefinition = await load("bundle.json");

  const packages = loadPackageDefinition(packageDefinition);

  const serviceDefinition = path<ServiceDefinition>(
    ["test", "X", "service"],
    packages
  );

  server.addService(serviceDefinition!, { watchX: watchX });

  await new Promise(
    (resolve: () => void, reject: (error: Error) => void): void => {
      server.bindAsync(
        `0.0.0.0:8888`,
        ServerCredentials.createInsecure(),
        (error: Error | null): void => {
          if (error !== null) {
            console.error(error);

            reject(error);
          }

          resolve();
        }
      );
    }
  );

  server.start();

  return server;
};
