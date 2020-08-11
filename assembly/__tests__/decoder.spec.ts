import {Decoder, Value} from "../";

function assertEncodedValue(s: string, v: Value): void {
  assert(hexEncodedValue(s) == v, "values are not virtually equal");
}

function hexEncodedValue(s: string): Value {
  const buffer = s.split(" ")
    .map<u8>((byte) => { return parseInt(byte, 16) as u8; })
    .buffer;

  return new Decoder(buffer).parseValue();
}

function bytesFromArray(bytes: Array<u8>): Uint8Array {
  const result = new Uint8Array(bytes.length);
  for(let i: i32 = 0; i < bytes.length; i += 1) {
    result[i] = bytes[i];
  }
  return result;
}

describe("Decoder", () => {
  it("decode numbers", () => {
    assertEncodedValue("00", Value.fromU64(0));
    assertEncodedValue("01", Value.fromU64(1));
    assertEncodedValue("0a", Value.fromU64(10));

    assertEncodedValue("17", Value.fromU64(23));
    assertEncodedValue("18 18", Value.fromU64(24));
    assertEncodedValue("18 19", Value.fromU64(25));
    assertEncodedValue("18 64", Value.fromU64(100));
    assertEncodedValue("19 03 e8", Value.fromU64(1000));
    assertEncodedValue("1a 00 0f 42 40", Value.fromU64(1000000));
    assertEncodedValue("1b 00 00 00 e8 d4 a5 10 00", Value.fromU64(1000000000000));
    assertEncodedValue("1b ff ff ff ff ff ff ff ff", Value.fromU64(18446744073709551615));

    // // // TODO: bignums
    // // // expect(hexEncodedValue("c2 49 01 00 00 00 00 00 00 00 00")).toBe(18446744073709551616); // 18446744073709551616
    // // // expect(hexEncodedValue("3b ff ff ff ff ff ff ff ff")).toBe(); // -18446744073709551616
    // // // expect(hexEncodedValue("c3 49 01 00 00 00 00 00 00 00 00")).toBe(); // -18446744073709551617

    assertEncodedValue("20", Value.fromI64(-1));
    assertEncodedValue("29", Value.fromI64(-10));
    assertEncodedValue("38 63", Value.fromI64(-100));
    assertEncodedValue("39 03 e7", Value.fromI64(-1000));

    // assertEncodedValue("f9 00 00", Value.fromF64(0.0));
    // assertEncodedValue("f9 80 00", Value.fromF64(-0.0));
    // assertEncodedValue("f9 3c 00", Value.fromF64(1.0));
    // assertEncodedValue("fb 3f f1 99 99 99 99 99 9a", Value.fromF64(1.1));
    // assertEncodedValue("f9 3e 00", Value.fromF64(1.5));
    // assertEncodedValue("f9 7b ff", Value.fromF64(65504.0));
    // assertEncodedValue("fa 47 c3 50 00", Value.fromF64(100000.0));
    // assertEncodedValue("fa 7f 7f ff ff", Value.fromF64(3.4028234663852886e+38));
    // assertEncodedValue("fb 7e 37 e4 3c 88 00 75 9c", Value.fromF64(1.0e+300));
    // assertEncodedValue("f9 00 01", Value.fromF64(5.960464477539063e-8));
    // assertEncodedValue("f9 c4 00", Value.fromF64(-4.0));
    // assertEncodedValue("fb c0 10 66 66 66 66 66 66", Value.fromF64(-4.1));
    // assertEncodedValue("f9 7c 00", Value.fromF64(F64.POSITIVE_INFINITY));
    // assertEncodedValue("f9 7e 00", Value.fromF64(F64.NaN));
    // assertEncodedValue("f9 fc 00", Value.fromF64(F64.NEGATIVE_INFINITY));
    // assertEncodedValue("fa 7f 80 00 00", Value.fromF64(F64.POSITIVE_INFINITY)); // Infinity
    // assertEncodedValue("fa 7f c0 00 00", Value.fromF64(F64.NaN)); // NaN
    // assertEncodedValue("fa ff 80 00 00", Value.fromF64(F64.NEGATIVE_INFINITY)); // -Infinity
    // assertEncodedValue("fb 7f f0 00 00 00 00 00 00", Value.fromF64(F64.POSITIVE_INFINITY)); // Infinity
    // assertEncodedValue("fb 7f f8 00 00 00 00 00 00", Value.fromF64(F64.NaN)); // NaN
    // assertEncodedValue("fb ff f0 00 00 00 00 00 00", Value.fromF64(F64.NEGATIVE_INFINITY)); // -Infinity
  });

  xit("decodes bignums", () => {
    // expect(hexEncodedValue("c2 49 01 00 00 00 00 00 00 00 00")).toBe(18446744073709551616); // 18446744073709551616
    // expect(hexEncodedValue("3b ff ff ff ff ff ff ff ff")).toBe(); // -18446744073709551616
    // expect(hexEncodedValue("c3 49 01 00 00 00 00 00 00 00 00")).toBe(); // -18446744073709551617
  });

  it("decodes booleans", () => {
    assertEncodedValue("f4", Value.fromBoolean(false));
    assertEncodedValue("f5", Value.fromBoolean(true));
  });

  it("decodes null/undefined", () => {
    assertEncodedValue("f6", Value.fromNull()); // null
    assertEncodedValue("f7", Value.fromNull()); // undefined
  })

  xit("decodes simple value", () => {
    // TODO
    hexEncodedValue("f0"); // simple(16)
    hexEncodedValue("f8 18"); // simple(24)
    hexEncodedValue("f8 ff"); // simple(255)
  })

  it("decodes bytes", () => {
    assertEncodedValue("40", Value.fromBytes(bytesFromArray([])));
    assertEncodedValue("44 01 02 03 04", Value.fromBytes(bytesFromArray([1, 2, 3, 4])));
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
    assertEncodedValue("60", Value.fromString(""));
    assertEncodedValue("61 61", Value.fromString("a"));
    assertEncodedValue("62 22 5c", Value.fromString("\"\\"));
    assertEncodedValue("62 c3 bc", Value.fromString("ü")); // "\u00fc"
    assertEncodedValue("63 e6 b0 b4", Value.fromString("水")); // "\u6c34"
    assertEncodedValue("64 f0 90 85 91", Value.fromString("𐅑")); // "\ud800\udd51"
  });

  it("decodes arrays", () => {
    assertEncodedValue("80", Value.fromArray([]));
    assertEncodedValue(
      "83 01 02 03",
      Value.fromArray([
        Value.fromU64(1),
        Value.fromU64(2),
        Value.fromU64(3),
      ])
    );
    assertEncodedValue(
      "83 01 82 02 03 82 04 05",
      Value.fromArray([
        Value.fromU64(1),
        Value.fromArray([
          Value.fromU64(2),
          Value.fromU64(3),
        ]),
        Value.fromArray([
          Value.fromU64(4),
          Value.fromU64(5),
        ]),
      ])
    );
    assertEncodedValue(
      "98 19 01 02 03 04 05 06 07 08 09 0a 0b 0c 0d 0e 0f 10 11 12 13 14 15 16 17 18 18 18 19",
      Value.fromArray([
        Value.fromU64(1),
        Value.fromU64(2),
        Value.fromU64(3),
        Value.fromU64(4),
        Value.fromU64(5),
        Value.fromU64(6),
        Value.fromU64(7),
        Value.fromU64(8),
        Value.fromU64(9),
        Value.fromU64(10),
        Value.fromU64(11),
        Value.fromU64(12),
        Value.fromU64(13),
        Value.fromU64(14),
        Value.fromU64(15),
        Value.fromU64(16),
        Value.fromU64(17),
        Value.fromU64(18),
        Value.fromU64(19),
        Value.fromU64(20),
        Value.fromU64(21),
        Value.fromU64(22),
        Value.fromU64(23),
        Value.fromU64(24),
        Value.fromU64(25),
      ]),
    );
  });

  it("decodes maps", () => {
    // TODO: not sure how to support custom hashcodes for keys. I don't think this can work without changes to the compiler.
    let v = new Map<Value, Value>();
    assertEncodedValue("a0", Value.fromMap(v));

    v = new Map<Value, Value>();
    v.set(Value.fromU64(1), Value.fromU64(2));
    v.set(Value.fromU64(3), Value.fromU64(4));

    assertEncodedValue("a2 01 02 03 04", Value.fromMap(v));

    v = new Map<Value, Value>();
    v.set(Value.fromString("a"), Value.fromU64(1));
    v.set(Value.fromString("b"), Value.fromArray([Value.fromU64(2), Value.fromU64(3)]));

    assertEncodedValue("a2 61 61 01 61 62 82 02 03", Value.fromMap(v));

    v = new Map<Value, Value>();
    v.set(Value.fromString("b"), Value.fromString("b"));

    assertEncodedValue("82 61 61 a1 61 62 61 63", Value.fromMap(v));

    v = new Map<Value, Value>();
    v.set(Value.fromString("a"), Value.fromString("A"));
    v.set(Value.fromString("b"), Value.fromString("B"));
    v.set(Value.fromString("c"), Value.fromString("C"));
    v.set(Value.fromString("d"), Value.fromString("D"));
    v.set(Value.fromString("e"), Value.fromString("E"));

    assertEncodedValue("a5 61 61 61 41 61 62 61 42 61 63 61 43 61 64 61 44 61 65 61 45", Value.fromMap(v));
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
  it("booleans", () => {
    let v = Value.fromBoolean(false);
    expect(v.isNull()).toBe(false);
    expect(v.isBoolean()).toBe(true);
    expect(v.toBoolean()).toBe(false);

    v = Value.fromBoolean(true);
    expect(v.isNull()).toBe(false);
    expect(v.isBoolean()).toBe(true);
    expect(v.toBoolean()).toBe(true);

    assert(v == Value.fromBoolean(true));
    assert(v != Value.fromBoolean(false));
  });

  it("numbers", () => {
    let v = Value.fromU64(1);
    assert(v == Value.fromU64(1));
    assert(v == Value.fromI64(1));
    assert(v == Value.fromF64(1.0));
    assert(v != Value.fromU64(2));
    assert(v != Value.fromI64(2));
    assert(v != Value.fromF64(2.0));

    v = Value.fromI64(1);
    assert(v == Value.fromU64(1));
    assert(v == Value.fromI64(1));
    assert(v == Value.fromF64(1.0));
    assert(v != Value.fromU64(2));
    assert(v != Value.fromI64(2));
    assert(v != Value.fromF64(2.0));

    v = Value.fromF64(1.0);
    assert(v == Value.fromU64(1));
    assert(v == Value.fromI64(1));
    assert(v == Value.fromF64(1.0));
    assert(v != Value.fromU64(2));
    assert(v != Value.fromI64(2));
    assert(v != Value.fromF64(2.0));
  });

  it("strings", () => {
    assert(Value.fromString("A") == Value.fromString("A"));
    assert(Value.fromString("A") != Value.fromString("B"));
  })

  it("bytes", () => {
    let v = Value.fromBytes(bytesFromArray([0x01, 0x02]));
    assert(v == Value.fromBytes(bytesFromArray([0x01, 0x02])));
    assert(v != Value.fromBytes(bytesFromArray([0x01, 0x03])));
  });

  it("array", () => {

  });

  it("map", () => {

  });

  it("null", () => {
    const v = Value.fromNull();
    expect(v.isNull()).toBe(true);
    expect(v.isBoolean()).toBe(false);
  });
});


    // #[test]
    // fn test_f16_to_f32() {
    //     let f = f16::from_f32(7.0);
    //     assert_eq!(f.to_f32(), 7.0f32);

    //     // 7.1 is NOT exactly representable in 16-bit, it's rounded
    //     let f = f16::from_f32(7.1);
    //     let diff = (f.to_f32() - 7.1f32).abs();
    //     // diff must be <= 4 * EPSILON, as 7 has two more significant bits than 1
    //     assert!(diff <= 4.0 * f16::EPSILON.to_f32());

    //     assert_eq!(f16::from_bits(0x0000_0001).to_f32(), 2.0f32.powi(-24));
    //     assert_eq!(f16::from_bits(0x0000_0005).to_f32(), 5.0 * 2.0f32.powi(-24));

    //     assert_eq!(f16::from_bits(0x0000_0001), f16::from_f32(2.0f32.powi(-24)));
    //     assert_eq!(
    //         f16::from_bits(0x0000_0005),
    //         f16::from_f32(5.0 * 2.0f32.powi(-24))
    //     );
    // }
