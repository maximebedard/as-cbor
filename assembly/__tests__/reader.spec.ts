import {Decoder, Visitor, Value} from "../";

function hexEncodedValue(s: string): Value {
  const buffer = s.split(" ")
    .map<u8>((byte) => { return parseInt(byte, 16) as u8; })
    .buffer;

  const decoder = new Decoder(buffer);
  return decoder.parseValue(new Visitor());
}

describe("Decoder", () => {
  it("decodes", () => {
    expect(hexEncodedValue("00").toU64()).toBe(0); // 0
    expect(hexEncodedValue("01").toU64()).toBe(1); // 1
    expect(hexEncodedValue("0a").toU64()).toBe(10); // 10
    expect(hexEncodedValue("17").toU64()).toBe(23); // 23
    expect(hexEncodedValue("18 18").toU64()).toBe(24); // 24
    expect(hexEncodedValue("18 19").toU64()).toBe(25); // 25
    expect(hexEncodedValue("18 64").toU64()).toBe(100); // 100
    expect(hexEncodedValue("19 03 e8").toU64()).toBe(1000); // 1000
    expect(hexEncodedValue("1a 00 0f 42 40").toU64()).toBe(1000000); // 1000000
    hexEncodedValue("1b 00 00 00 e8 d4 a5 10 00"); // 1000000000000
    hexEncodedValue("1b ff ff ff ff ff ff ff ff"); // 18446744073709551615
    hexEncodedValue("c2 49 01 00 00 00 00 00 00 00 00"); // 18446744073709551616
    hexEncodedValue("3b ff ff ff ff ff ff ff ff"); // -18446744073709551616
    hexEncodedValue("c3 49 01 00 00 00 00 00 00 00 00"); // -18446744073709551617
    hexEncodedValue("20"); // -1
    hexEncodedValue("29"); // -10
    hexEncodedValue("38 63"); // -100
    hexEncodedValue("39 03 e7"); // -1000
    hexEncodedValue("f9 00 00"); // 0.0
    hexEncodedValue("f9 80 00"); // -0.0
    hexEncodedValue("f9 3c 00"); // 1.0
    hexEncodedValue("fb 3f f1 99 99 99 99 99 9a"); // 1.1
    hexEncodedValue("f9 3e 00"); // 1.5
    hexEncodedValue("f9 7b ff"); // 65504.0
    hexEncodedValue("fa 47 c3 50 00"); // 100000.0
    hexEncodedValue("fa 7f 7f ff ff"); // 3.4028234663852886e+38
    hexEncodedValue("fb 7e 37 e4 3c 88 00 75 9c"); // 1.0e+300
    hexEncodedValue("f9 00 01"); // 5.960464477539063e-8
    hexEncodedValue("f9 04 00"); // 0.00006103515625
    hexEncodedValue("f9 c4 00"); // -4.0
    hexEncodedValue("fb c0 10 66 66 66 66 66 66"); // -4.1
    hexEncodedValue("f9 7c 00"); // Infinity
    hexEncodedValue("f9 7e 00"); // NaN
    hexEncodedValue("f9 fc 00"); // -Infinity
    hexEncodedValue("fa 7f 80 00 00"); // Infinity
    hexEncodedValue("fa 7f c0 00 00"); // NaN
    hexEncodedValue("fa ff 80 00 00"); // -Infinity
    hexEncodedValue("fb 7f f0 00 00 00 00 00 00"); // Infinity
    hexEncodedValue("fb 7f f8 00 00 00 00 00 00"); // NaN
    hexEncodedValue("fb ff f0 00 00 00 00 00 00"); // -Infinity
    hexEncodedValue("f4"); // false
    hexEncodedValue("f5"); // true
    hexEncodedValue("f6"); // null
    hexEncodedValue("f7"); // undefined
    hexEncodedValue("f0"); // simple(16)
    hexEncodedValue("f8 18"); // simple(24)
    hexEncodedValue("f8 ff"); // simple(255)
    hexEncodedValue("c0 74 32 30 31 33 2d 30 33 2d 32 31 54 32 30 3a 30 34 3a 30 30 5a"); // 0("2013-03-21T20:04:00Z")
    hexEncodedValue("c1 1a 51 4b 67 b0"); // 1(1363896240)
    hexEncodedValue("c1 fb 41 d4 52 d9 ec 20 00 00"); // 1(1363896240.5)
    hexEncodedValue("d7 44 01 02 03 04"); // 23(h'01020304')
    hexEncodedValue("d8 18 45 64 49 45 5446"); // 24(h'6449455446')
    hexEncodedValue("d8 20 76 68 74 74 70 3a 2f 2f 77 77 77 2e 65 78 61 6d 70 6c 65 2e 63 6f 6d"); // 32("http://www.example.com")
    hexEncodedValue("40"); // h''
    hexEncodedValue("44 01 02 03 04"); // h'01020304'
    hexEncodedValue("60"); // ""
    hexEncodedValue("61 61"); // "IETF"
    hexEncodedValue("62 22 5c"); // "\"\\"
    hexEncodedValue("62 c3 bc"); // "\u00fc"
    hexEncodedValue("63 e6 b0 b4"); // "\u6c34"
    hexEncodedValue("64 f0 90 85 91"); // "\ud800\udd51"
    hexEncodedValue("80"); // []
    hexEncodedValue("83 01 02 03"); // [1, 2, 3]
    hexEncodedValue("83 01 82 02 03 82 04 05"); // [1, [2, 3], [4, 5]]
    hexEncodedValue("98 19 01 02 03 04 05 06 07 08 09 0a 0b 0c 0d 0e 0f 10 11 12 13 14 15 16 17 18 18 18 19"); // [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25]
    hexEncodedValue("a0"); // {}
    hexEncodedValue("a2 01 02 03 04"); // {1: 2, 3: 4}
    hexEncodedValue("a2 61 61 01 61 62 82 02 03"); // {"a": 1, "b": [2, 3]}
    hexEncodedValue("82 61 61 a1 61 62 61 63"); // ["a", {"b": "c"}]
    hexEncodedValue("a5 61 61 61 41 61 62 61 42 61 63 61 43 61 64 61 44 61 65 61 45"); // {"a": "A", "b": "B", "c":"C", "d": "D", "e": "E"}
    hexEncodedValue("5f 42 01 02 43 03 04 05 ff"); // (_ h'0102', h'030405')
    hexEncodedValue("7f 65 73 74 72 65 61 64 6d 69 6e 67 ff"); // (_ "strea", "ming")
    hexEncodedValue("9f ff"); // [_ ]
    hexEncodedValue("9f 01 82 02 03 9f 04 05 ff ff"); // [_ 1, [2, 3], [_ 4, 5]]
    hexEncodedValue("9f 01 82 02 03 82 04 05 ff"); // [_ 1, [2, 3], [4, 5]]
    hexEncodedValue("83 01 82 02 03 9f 04 05 ff"); // [1, [2, 3], [_ 4, 5]]
    hexEncodedValue("83 01 9f 02 03 ff 82 04 05"); // [1, [_ 2, 3], [4, 5]]
    hexEncodedValue("9f 01 02 03 04 05 06 07 08 09 0a 0b 0c 0d 0e 0f 10 11 12 13 14 15 16 17 18 18 18 19 ff") // [_ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25]
    hexEncodedValue("bf 61 61 01 61 62 9f 02 03 ff ff"); // {_ "a": 1, "b": [_ 2, 3]}
    hexEncodedValue("82 61 61 bf 61 62 61 63 ff"); // ["a", {_ "b": "c"}]
    hexEncodedValue("bf 63 46 75 6e f5 63 41 6d 74 21 ff"); // {_ "Fun": true, "Amt": -2}
  });
});

describe("Value", () => {
  it("bool", () => {
    const v1 = Value.boolValue(true);

    expect(v1.isNull()).toBe(false);
    expect(v1.isBool()).toBe(true);
    expect(v1.asBool()!.v).toBe(true);

    const v2 = Value.boolValue(false);

    expect(v2.isNull()).toBe(false);
    expect(v2.isBool()).toBe(true);
    expect(v2.asBool()!.v).toBe(false);
  });

  it("number", () => {

  });

  it("null", () => {
    const v = Value.nullValue();
    expect(v.isNull()).toBe(true);
  });
});
