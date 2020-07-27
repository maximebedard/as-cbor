import {Encoder} from "../";

describe("Encoder", () => {
  it("write", () => {
    const w = new Encoder();
    w.writeU8(1, 1);
    w.writeU16(1, 1);
    w.writeU32(1, 1);
    w.writeU64(1, 1);
    w.writeI8(1);
    w.writeI16(1);
    w.writeI32(1);
    w.writeI64(1);
    w.writeF32(1.0);
    w.writeF64(1.0);
    w.writeBool(true);
    w.writeBool(false);

    expect(w.buffer).toStrictEqual([].buffer);
  });
});
