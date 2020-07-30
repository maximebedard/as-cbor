import {Decoder, ValueVisitor, Value} from "../";

function hexEncodedValue(s: string): Value {
  const buffer = s.split(" ")
    .map<u8>((byte) => { return parseInt(byte, 16) as u8; })
    .buffer;

  const decoder = new Decoder(buffer);
  return decoder.parseValue(new ValueVisitor());
}

function bytesFromArray(bytes: Array<u8>): Uint8Array {
  const result = new Uint8Array(bytes.length);
  for(let i: i32 = 0; i < bytes.length; i += 1) {
    result[i] = bytes[i];
  }
  return result;
}

describe("Decoder", () => {
  describe("decode numbers", () => {
    it("as u64", () => {
      expect(hexEncodedValue("00").toU64()).toBe(0); // 0
      expect(hexEncodedValue("01").toU64()).toBe(1); // 1
      expect(hexEncodedValue("0a").toU64()).toBe(10); // 10
      expect(hexEncodedValue("17").toU64()).toBe(23); // 23
      expect(hexEncodedValue("18 18").toU64()).toBe(24); // 24
      expect(hexEncodedValue("18 19").toU64()).toBe(25); // 25
      expect(hexEncodedValue("18 64").toU64()).toBe(100); // 100
      expect(hexEncodedValue("19 03 e8").toU64()).toBe(1000); // 1000
      expect(hexEncodedValue("1a 00 0f 42 40").toU64()).toBe(1000000); // 1000000
      expect(hexEncodedValue("1b 00 00 00 e8 d4 a5 10 00").toU64()).toBe(1000000000000); // 1000000000000
      expect(hexEncodedValue("1b ff ff ff ff ff ff ff ff").toU64()).toBe(18446744073709551615); // 18446744073709551615
      // TODO: bignums
      // expect(hexEncodedValue("c2 49 01 00 00 00 00 00 00 00 00")).toBe(18446744073709551616); // 18446744073709551616
      // expect(hexEncodedValue("3b ff ff ff ff ff ff ff ff")).toBe(); // -18446744073709551616
      // expect(hexEncodedValue("c3 49 01 00 00 00 00 00 00 00 00")).toBe(); // -18446744073709551617

      expect(hexEncodedValue("20").asU64()).toBe(null); // -1
      expect(hexEncodedValue("29").asU64()).toBe(null); // -10
      expect(hexEncodedValue("38 63").asU64()).toBe(null); // -100
      expect(hexEncodedValue("39 03 e7").asU64()).toBe(null); // -1000
      // expect(hexEncodedValue("f9 00 00")).toBe(); // 0.0
      // expect(hexEncodedValue("f9 80 00")).toBe(); // -0.0
      // expect(hexEncodedValue("f9 3c 00")).toBe(); // 1.0
      // expect(hexEncodedValue("fb 3f f1 99 99 99 99 99 9a")).toBe(); // 1.1
      // expect(hexEncodedValue("f9 3e 00")).toBe(); // 1.5
      // expect(hexEncodedValue("f9 7b ff")).toBe(); // 65504.0
      // expect(hexEncodedValue("fa 47 c3 50 00")).toBe(); // 100000.0
      // expect(hexEncodedValue("fa 7f 7f ff ff")).toBe(); // 3.4028234663852886e+38
      // expect(hexEncodedValue("fb 7e 37 e4 3c 88 00 75 9c")).toBe(); // 1.0e+300
      // expect(hexEncodedValue("f9 00 01")).toBe(); // 5.960464477539063e-8
      // expect(hexEncodedValue("f9 04 00")).toBe(); // 0.00006103515625
      // expect(hexEncodedValue("f9 c4 00")).toBe(); // -4.0
      // expect(hexEncodedValue("fb c0 10 66 66 66 66 66 66")).toBe(); // -4.1
      // expect(hexEncodedValue("f9 7c 00")).toBe(); // Infinity
      // expect(hexEncodedValue("f9 7e 00")).toBe(); // NaN
      // expect(hexEncodedValue("f9 fc 00")).toBe(); // -Infinity
      // expect(hexEncodedValue("fa 7f 80 00 00")).toBe(); // Infinity
      // expect(hexEncodedValue("fa 7f c0 00 00")).toBe(); // NaN
      // expect(hexEncodedValue("fa ff 80 00 00")).toBe(); // -Infinity
      // expect(hexEncodedValue("fb 7f f0 00 00 00 00 00 00")).toBe(); // Infinity
      // expect(hexEncodedValue("fb 7f f8 00 00 00 00 00 00")).toBe(); // NaN
      // expect(hexEncodedValue("fb ff f0 00 00 00 00 00 00")).toBe(); // -Infinity
    });

    it("as i64", () => {
      // expect(hexEncodedValue("00").toI64()).toBe(0); // 0
      // expect(hexEncodedValue("01").toI64()).toBe(1); // 1
      // expect(hexEncodedValue("0a").toI64()).toBe(10); // 10
      // expect(hexEncodedValue("17").toI64()).toBe(23); // 23
      // expect(hexEncodedValue("18 18").toI64()).toBe(24); // 24
      // expect(hexEncodedValue("18 19").toI64()).toBe(25); // 25
      // expect(hexEncodedValue("18 64").toI64()).toBe(100); // 100
      // expect(hexEncodedValue("19 03 e8").toI64()).toBe(1000); // 1000
      // expect(hexEncodedValue("1a 00 0f 42 40").toI64()).toBe(1000000); // 1000000
      // expect(hexEncodedValue("1b 00 00 00 e8 d4 a5 10 00").toI64()).toBe(1000000000000); // 1000000000000
      // expect(hexEncodedValue("1b ff ff ff ff ff ff ff ff").toI64()).toBe(18446744073709551615); // 18446744073709551615
      // TODO: bignums
      // expect(hexEncodedValue("c2 49 01 00 00 00 00 00 00 00 00")).toBe(18446744073709551616); // 18446744073709551616
      // expect(hexEncodedValue("3b ff ff ff ff ff ff ff ff")).toBe(); // -18446744073709551616
      // expect(hexEncodedValue("c3 49 01 00 00 00 00 00 00 00 00")).toBe(); // -18446744073709551617

      expect(hexEncodedValue("20").toI64()).toBe(-1); // -1
      expect(hexEncodedValue("29").toI64()).toBe(-10); // -10
      expect(hexEncodedValue("38 63").toI64()).toBe(-100); // -100
      expect(hexEncodedValue("39 03 e7").toI64()).toBe(-1000); // -1000

      // TODO: f16
      // expect(hexEncodedValue("f9 00 00").toF64()).toBe(0.0); // 0.0
      // expect(hexEncodedValue("f9 80 00").toF64()).toBe(-0.0); // -0.0
      // expect(hexEncodedValue("f9 3c 00").toF64()).toBe(1.0); // 1.0
      // expect(hexEncodedValue("fb 3f f1 99 99 99 99 99 9a").toF64()).toBe(1.1); // 1.1
      // expect(hexEncodedValue("f9 3e 00").toF64()).toBe(1.5); // 1.5
      // expect(hexEncodedValue("f9 7b ff").toF64()).toBe(65504.0); // 65504.0
      // expect(hexEncodedValue("fa 47 c3 50 00").toF64()).toBe(100000.0); // 100000.0
      // expect(hexEncodedValue("fa 7f 7f ff ff").toF64()).toBe(3.4028234663852886e+38); // 3.4028234663852886e+38
      // expect(hexEncodedValue("fb 7e 37 e4 3c 88 00 75 9c").toF64()).toBe(1.0e+300); // 1.0e+300
      // expect(hexEncodedValue("f9 00 01")).toBe(); // 5.960464477539063e-8
      // expect(hexEncodedValue("f9 04 00")).toBe(); // 0.00006103515625
      // expect(hexEncodedValue("f9 c4 00")).toBe(); // -4.0
      // expect(hexEncodedValue("fb c0 10 66 66 66 66 66 66").toF64()).toBe(-4.1); // -4.1
      // expect(hexEncodedValue("f9 7c 00")).toBe(); // Infinity
      // expect(hexEncodedValue("f9 7e 00")).toBe(); // NaN
      // expect(hexEncodedValue("f9 fc 00")).toBe(); // -Infinity
      // expect(hexEncodedValue("fa 7f 80 00 00").toF64()).toBe(F64.POSITIVE_INFINITY); // Infinity
      // expect(hexEncodedValue("fa 7f c0 00 00").toF64()).toBe(F64.NaN); // NaN
      // expect(hexEncodedValue("fa ff 80 00 00").toF64()).toBe(F64.NEGATIVE_INFINITY); // -Infinity
      // expect(hexEncodedValue("fb 7f f0 00 00 00 00 00 00").toF64()).toBe(F64.POSITIVE_INFINITY); // Infinity
      // expect(hexEncodedValue("fb 7f f8 00 00 00 00 00 00").toF64()).toBe(F64.NaN); // NaN
      // expect(hexEncodedValue("fb ff f0 00 00 00 00 00 00").toF64()).toBe(F64.NEGATIVE_INFINITY); // -Infinity
    });

    it("as f64", () => {
      // expect(hexEncodedValue("00").toU64()).toBe(0); // 0
      // expect(hexEncodedValue("01").toU64()).toBe(1); // 1
      // expect(hexEncodedValue("0a").toU64()).toBe(10); // 10
      // expect(hexEncodedValue("17").toU64()).toBe(23); // 23
      // expect(hexEncodedValue("18 18").toU64()).toBe(24); // 24
      // expect(hexEncodedValue("18 19").toU64()).toBe(25); // 25
      // expect(hexEncodedValue("18 64").toU64()).toBe(100); // 100
      // expect(hexEncodedValue("19 03 e8").toU64()).toBe(1000); // 1000
      // expect(hexEncodedValue("1a 00 0f 42 40").toU64()).toBe(1000000); // 1000000
      // expect(hexEncodedValue("1b 00 00 00 e8 d4 a5 10 00").toU64()).toBe(1000000000000); // 1000000000000
      // expect(hexEncodedValue("1b ff ff ff ff ff ff ff ff").toU64()).toBe(18446744073709551615); // 18446744073709551615
      // TODO: bignums
      // expect(hexEncodedValue("c2 49 01 00 00 00 00 00 00 00 00")).toBe(18446744073709551616); // 18446744073709551616
      // expect(hexEncodedValue("3b ff ff ff ff ff ff ff ff")).toBe(); // -18446744073709551616
      // expect(hexEncodedValue("c3 49 01 00 00 00 00 00 00 00 00")).toBe(); // -18446744073709551617

      // expect(hexEncodedValue("20").asU64()).toBe(null); // -1
      // expect(hexEncodedValue("29").asU64()).toBe(null); // -10
      // expect(hexEncodedValue("38 63").asU64()).toBe(null); // -100
      // expect(hexEncodedValue("39 03 e7").asU64()).toBe(null); // -1000

      // TODO: f16
      // expect(hexEncodedValue("f9 00 00").toF64()).toBe(0.0); // 0.0
      // expect(hexEncodedValue("f9 80 00").toF64()).toBe(-0.0); // -0.0
      // expect(hexEncodedValue("f9 3c 00").toF64()).toBe(1.0); // 1.0
      expect(hexEncodedValue("fb 3f f1 99 99 99 99 99 9a").toF64()).toBe(1.1); // 1.1
      // expect(hexEncodedValue("f9 3e 00").toF64()).toBe(1.5); // 1.5
      // expect(hexEncodedValue("f9 7b ff").toF64()).toBe(65504.0); // 65504.0
      expect(hexEncodedValue("fa 47 c3 50 00").toF64()).toBe(100000.0); // 100000.0
      expect(hexEncodedValue("fa 7f 7f ff ff").toF64()).toBe(3.4028234663852886e+38); // 3.4028234663852886e+38
      expect(hexEncodedValue("fb 7e 37 e4 3c 88 00 75 9c").toF64()).toBe(1.0e+300); // 1.0e+300
      // expect(hexEncodedValue("f9 00 01")).toBe(); // 5.960464477539063e-8
      // expect(hexEncodedValue("f9 04 00")).toBe(); // 0.00006103515625
      // expect(hexEncodedValue("f9 c4 00")).toBe(); // -4.0
      expect(hexEncodedValue("fb c0 10 66 66 66 66 66 66").toF64()).toBe(-4.1); // -4.1
      // expect(hexEncodedValue("f9 7c 00")).toBe(); // Infinity
      // expect(hexEncodedValue("f9 7e 00")).toBe(); // NaN
      // expect(hexEncodedValue("f9 fc 00")).toBe(); // -Infinity
      expect(hexEncodedValue("fa 7f 80 00 00").toF64()).toBe(F64.POSITIVE_INFINITY); // Infinity
      // expect(hexEncodedValue("fa 7f c0 00 00").toF64()).toBe(F64.NaN); // NaN
      expect(hexEncodedValue("fa ff 80 00 00").toF64()).toBe(F64.NEGATIVE_INFINITY); // -Infinity
      expect(hexEncodedValue("fb 7f f0 00 00 00 00 00 00").toF64()).toBe(F64.POSITIVE_INFINITY); // Infinity
      // expect(hexEncodedValue("fb 7f f8 00 00 00 00 00 00").toF64()).toBe(F64.NaN); // NaN
      expect(hexEncodedValue("fb ff f0 00 00 00 00 00 00").toF64()).toBe(F64.NEGATIVE_INFINITY); // -Infinity
    })
  });

  xit("decodes bignums", () => {
    // expect(hexEncodedValue("c2 49 01 00 00 00 00 00 00 00 00")).toBe(18446744073709551616); // 18446744073709551616
    // expect(hexEncodedValue("3b ff ff ff ff ff ff ff ff")).toBe(); // -18446744073709551616
    // expect(hexEncodedValue("c3 49 01 00 00 00 00 00 00 00 00")).toBe(); // -18446744073709551617
  });

  it("decodes booleans", () => {
    expect(hexEncodedValue("f4").toBoolean()).toBe(false); // false
    expect(hexEncodedValue("f5").toBoolean()).toBe(true); // true
  });

  it("decodes null/undefined", () => {
    expect(hexEncodedValue("f6").isNull()).toBe(true); // null
    expect(hexEncodedValue("f7").isNull()).toBe(true); // undefined
  })

  xit("decodes simple value", () => {
    // TODO
    hexEncodedValue("f0"); // simple(16)
    hexEncodedValue("f8 18"); // simple(24)
    hexEncodedValue("f8 ff"); // simple(255)
  })

  it("decodes bytes", () => {
    expect(hexEncodedValue("40").toBytes())
      .toStrictEqual(bytesFromArray([])); // h''
    expect(hexEncodedValue("44 01 02 03 04").toBytes())
      .toStrictEqual(bytesFromArray([1, 2, 3, 4])); // h'01020304'
  });

  xit("decodes tagged value", () => {
    hexEncodedValue("c0 74 32 30 31 33 2d 30 33 2d 32 31 54 32 30 3a 30 34 3a 30 30 5a"); // 0("2013-03-21T20:04:00Z")
    hexEncodedValue("c1 1a 51 4b 67 b0"); // 1(1363896240)
    hexEncodedValue("c1 fb 41 d4 52 d9 ec 20 00 00"); // 1(1363896240.5)
    hexEncodedValue("d7 44 01 02 03 04"); // 23(h'01020304')
    hexEncodedValue("d8 18 45 64 49 45 5446"); // 24(h'6449455446')
    hexEncodedValue("d8 20 76 68 74 74 70 3a 2f 2f 77 77 77 2e 65 78 61 6d 70 6c 65 2e 63 6f 6d"); // 32("http://www.example.com")
  });

  it("decodes strings", () => {
    expect(hexEncodedValue("60").toString()).toBe(""); // ""
    expect(hexEncodedValue("61 61").toString()).toBe("a"); // "a"
    expect(hexEncodedValue("62 22 5c").toString()).toBe("\"\\"); // "\"\\"
    expect(hexEncodedValue("62 c3 bc").toString()).toBe("ü"); // "\u00fc"
    expect(hexEncodedValue("63 e6 b0 b4").toString()).toBe("水"); // "\u6c34"
    expect(hexEncodedValue("64 f0 90 85 91").toString()).toBe("𐅑"); // "\ud800\udd51"
  });

  it("decodes arrays", () => {
    // assert(hexEncodedValue("80").toArray() == []);
    // expect(hexEncodedValue("80").toArray()).toBe([]);
    // assert(hexEncodedValue("80").toArray() == []);
    // const a = hexEncodedValue("80").toArray();
    // const c = a == [];
    // assert(a == []);
    // log(hexEncodedValue("80").toArray());
    // log(hexEncodedValue("83 01 02 03").toArray()); // [1, 2, 3]
    // log(hexEncodedValue("83 01 82 02 03 82 04 05").toArray()); // [1, [2, 3], [4, 5]]
    // log(hexEncodedValue("98 19 01 02 03 04 05 06 07 08 09 0a 0b 0c 0d 0e 0f 10 11 12 13 14 15 16 17 18 18 18 19").toArray()); // [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25]
  });

  it("decodes maps", () => {
    log(hexEncodedValue("a0")); // {}
    log(hexEncodedValue("a2 01 02 03 04")); // {1: 2, 3: 4}
    hexEncodedValue("a2 61 61 01 61 62 82 02 03"); // {"a": 1, "b": [2, 3]}
    hexEncodedValue("82 61 61 a1 61 62 61 63"); // ["a", {"b": "c"}]
    hexEncodedValue("a5 61 61 61 41 61 62 61 42 61 63 61 43 61 64 61 44 61 65 61 45"); // {"a": "A", "b": "B", "c":"C", "d": "D", "e": "E"}
  });

  xit("streams values", () => {
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
  it("true", () => {
    const v = Value.fromBoolean(true);

    expect(v.isNull()).toBe(false);
    expect(v.isBoolean()).toBe(true);
    expect(v.toBoolean()).toBe(true);
  });

  it("false", () => {
    const v = Value.fromBoolean(false);

    expect(v.isNull()).toBe(false);
    expect(v.isBoolean()).toBe(true);
    expect(v.toBoolean()).toBe(false);
  })

  describe("numbers", () => {
    it("u64", () => {});
    it("i64", () => {});
    it("f64", () => {});
  });

  it("null", () => {
    const v = Value.fromNull();
    expect(v.isNull()).toBe(true);
    expect(v.isBoolean()).toBe(false);
  });
});
