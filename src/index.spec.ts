import { start } from ".";
import {
  loadPackageDefinition,
  makeClientConstructor,
  credentials,
  ClientReadableStream,
} from "@grpc/grpc-js";
import { load } from "@grpc/proto-loader";
import { path } from "ramda";

type ClassType<Type> = Type extends new (...args: any[]) => infer InferredType
  ? InferredType
  : never;
type ServiceClientConstructor = ReturnType<typeof makeClientConstructor>;
export type ServiceClient = ClassType<ServiceClientConstructor>;

export const getServiceClient = async (): Promise<ServiceClient> => {
  const packageDefinition = await load("bundle.json");

  const packages = loadPackageDefinition(packageDefinition);

  const ServiceClientConstructor = path<ServiceClientConstructor>(
    ["test", "X"],
    packages
  );

  const client = new ServiceClientConstructor!(
    `0.0.0.0:8888`,
    credentials.createInsecure()
  );

  return client;
};

it.each([true, false])(
  "xxxx",
  async (invokeCancelSecondTime: boolean): Promise<void> => {
    const server = await start();

    const client = await getServiceClient();
    const stream: ClientReadableStream<unknown> = client.watchX();

    await new Promise((resolve: (data: unknown) => void): void => {
      stream.on("data", (data: unknown): void => {
        try {
          stream.cancel();
        } catch {
          if (invokeCancelSecondTime) {
            stream.cancel();
          }
        }

        resolve(data);
      });
    });

    await new Promise((resolve: () => void): void => {
      server.tryShutdown(resolve);
    });
  }
);
