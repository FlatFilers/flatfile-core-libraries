import { FlatfileListener } from "@flatfile/listener";
import { recordHook } from "@flatfile/plugin-record-hook";

const regex = /^[a-zA-Z0-9\s.\-_,']+$/;

export const useListner = (): ((client: FlatfileListener) => void) => {
  console.log("USE LISTENER HOOK");
  return (client: FlatfileListener) => {
    console.log("TEST TEST");
    client.use(
      recordHook("test", (record) => {
        console.log({ record });
        record.validate(
          "code",
          (value) => {
            console.log(value);
            return value !== null && regex.test(value.toString());
          },
          "Invalid code, allowed characters are: a-z, A-Z, 0-9, space, ., -, _, ', and ,"
        );

        return record;
      })
    );
  };
};
