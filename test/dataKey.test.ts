import * as assert from "power-assert";
import * as mocha from "mocha";

import { DataKey } from "../src/datakey";

describe("Generatorのテスト", () => {
  it("DataKeyが生成できる", async () => {
    const dk = await DataKey.generate("alias/forTest", { region: "us-east-1" });
  });
});