export class Box<T> {
  readonly v: T

  constructor(v: T) {
    this.v = v;
  }
}

export abstract class Value {
  static nullValue(): Value { return new NullValue(); }
  static boolValue(v: boolean): Value { return { v } as BooleanValue; }
  static u64Value(v: u64): Value { return { v } as U64Value; }
  static i64Value(v: i64): Value { return { v } as I64Value; }
  static f64Value(v: f64): Value { return { v } as F64Value; }
  static arrayValue(): Value { return new NullValue(); }
  static mapValue(): Value { return new NullValue(); }

  isNull(): boolean { return false; }

  isBool(): boolean { return this.asBool() != null; }
  asBool(): Box<boolean> | null { return null; }
  toBool(): boolean { return this.asBool()!.v; }

  isU64(): boolean { return this.asU64() != null; }
  asU64(): Box<u64> | null { return null; }
  toU64(): u64 { return this.asU64()!.v; }

  // isU32(): boolean { return this.asU32() != null; }
  // asU32(): Box<u32> | null { return null; }

  // isU16(): boolean { return this.asU16() != null; }
  // asU16(): Box<u16> | null { return null; }

  // isU8(): boolean { return this.asU8() != null; }
  // asU8(): Box<u8> | null { return null; }

  isI64(): boolean { return this.asI64() != null; }
  asI64(): Box<i64> | null { return null; }
  toI64(): i64 { return this.asI64()!.v; }

  // isI32(): boolean { return this.asI32() != null; }
  // asI32(): Box<i32> | null { return null; }

  // isI16(): boolean { return this.asI16() != null; }
  // asI16(): Box<i16> | null { return null; }

  // isI8(): boolean { return this.asI8() != null; }
  // asI8(): Box<i8> | null { return null; }

  isF64(): boolean { return this.asF64() != null; }
  asF64(): Box<f64> | null { return null; }
  toF64(): f64 { return this.asF64()!.v; }

  // isF32(): boolean { return this.asF32() != null; }
  // asF32(): Box<f32> | null { return null; }

  isArray(): boolean { return this.asArray() != null; }
  asArray(): Array<Value> | null { return null; }
  toArray(): Array<Value> { return this.asArray()!; }

  isMap(): boolean { return this.asMap() != null; }
  asMap(): Map<Value, Value> | null { return null; }
  toMap(): Map<Value, Value> { return this.asMap()!; }

  isByteArray(): boolean { return this.asByteArray() != null; }
  asByteArray(): Array<u8> | null { return null; }
  toByteArray(): Array<u8> { return this.asByteArray()!; }

  isString(): boolean { return this.asString() != null; }
  asString(): string | null { return null; }
  toString(): string { return this.asString()!; }
}

class NullValue extends Value {
  isNull(): boolean { return true; }
}

class BooleanValue extends Value {
  readonly v: boolean;
  asBool(): Box<boolean> | null { return new Box(this.v); }
}

class U64Value extends Value {
  readonly v: u64;
  asU64(): Box<u64> | null { return new Box(this.v); }
}

class I64Value extends Value {
  readonly v: i64;
  asI64(): Box<i64> | null { return new Box(this.v); }
}

class F64Value extends Value {
  readonly v: f64;
  asF64(): Box<f64> | null { return new Box(this.v); }
}

class ArrayValue extends Value {
  readonly v: Array<Value>
  asArray(): Array<Value> | null { return this.v; }
}

class MapValue extends Value {
  readonly v: Map<Value, Value>
  asMap(): Map<Value, Value> | null { return this.v; }
}

class ByteArrayValue extends Value {
  readonly v: Array<u8>
  asByteArray(): Array<u8> | null { return this.v; }
}

class StringValue extends Value {
  readonly v: string
  asString(): string | null { return this.v; }
}

export class Visitor {
  visitU8(v: u8): Value {
    return { v: v as u64 } as U64Value;
  }

  visitU16(v: u16): Value {
    return { v: v as u64 } as U64Value;
  }

  visitU32(v: u32): Value {
    return { v: v as u64 } as U64Value;
  }

  visitU64(v: u64): Value {
    return { v } as U64Value;
  }

  visitI8(v: u8): Value {
    return { v: v as i64 } as I64Value;
  }

  visitI16(v: u16): Value {
    return { v: v as i64 } as I64Value;
  }

  visitI32(v: u32): Value {
    return { v: v as i64 } as I64Value;
  }

  visitI64(v: u64): Value {
    return { v } as I64Value;
  }

  visitF32(v: f32): Value {
    return { v: v as f64 } as F64Value;
  }

  visitF64(v: f64): Value {
    return { v } as F64Value;
  }

  visitBool(v: boolean): Value {
    return { v } as BooleanValue;
  }

  visitNull(): Value {
    return new NullValue();
  }
}

export class Decoder {
  private readonly _view: DataView;
  private _pos: i32;

  constructor(buffer: ArrayBuffer) {
    this._view = new DataView(buffer);
    this._pos = 0;
    // this._remaining_depth = 128;
  }

  parseU8(): u8 {
    const v = this._view.getUint8(this._pos);
    this._pos += 1;
    return v;
  }

  parseU16(): u16 {
    const v = this._view.getUint16(this._pos);
    this._pos += 2;
    return v;
  }

  parseU32(): u32 {
    const v = this._view.getUint32(this._pos);
    this._pos += 4;
    return v;
  }

  parseU64(): u64 {
    const v = this._view.getUint64(this._pos);
    this._pos += 8;
    return v;
  }

  parseF16(): f32 {
    return 0.;
  }

  parseF32(): f32 {
    const v = this._view.getFloat32(this._pos);
    this._pos += 4;
    return v;
  }

  parseF64(): f64 {
    const v = this._view.getFloat64(this._pos);
    this._pos += 8;
    return v;
  }

  parseByteArray(len: usize, visitor: Visitor): Value {
    // assert(len < (i32.MAX_VALUE as usize), "length out of range");
    // assert(len < i32.MAX_VALUE, "length out of range");
    throw new Error("WEREWR");
    // this._view

    // let v = new Array<u8>(len as usize).copyWithin();

    // this._view.buffer
    // throw new Error("not supported");

    // visitor.visit_bytes_array();
  }

  parseString(len: usize, visitor: Visitor): Value {
    // assert(len < i32.MAX_VALUE, "length out of range");
    throw new Error("not supported");
  }

  parseArray(len: usize, visitor: Visitor): Value {
    return { v: new Array() } as ArrayValue;
  }

  parseMap(len: usize, visitor: Visitor): Value {
    return { v: new Map() } as MapValue;
  }

  parseIndefiniteByteArray(visitor: Visitor): Value {
    throw new Error("streaming is not supported.");
  }

  parseIndefiniteString(visitor: Visitor): Value {
    throw new Error("streaming is not supported.");
  }

  parseIndefiniteArray(visitor: Visitor): Value {
    throw new Error("streaming is not supported.");
  }

  parseIndefiniteMap(visitor: Visitor): Value {
    throw new Error("streaming is not supported.");
  }

  parseValue(visitor: Visitor): Value {
    const byte = this.parseU8();
    if (byte <= 0x17) { // Major type 0: unsigned integer
      return visitor.visitU8(byte);
    } else if (byte == 0x18) {
      const value = this.parseU8();
      return visitor.visitU8(value);
    } else if (byte == 0x19) {
      const value = this.parseU16();
      return visitor.visitU16(value);
    } else if (byte == 0x1A) {
      const value = this.parseU32();
      return visitor.visitU32(value);
    } else if (byte == 0x1b) {
      const value = this.parseU64();
      return visitor.visitU64(value);
    } else if (byte >= 0x1C && byte <= 0x1F) {
      throw new Error("unassigned code");
    } else if (byte >= 0x20 && byte <= 0x37) { // Major type 1: negative integer
      return visitor.visitI8(-1 - (byte - 0x20) as i8);
    } else if (byte == 0x38) {
      const value = this.parseU8();
      return visitor.visitI16(1 - (value as i16));
    } else if (byte == 0x39) {
      const value = this.parseU16();
      return visitor.visitI32(1 - (value as i32));
    } else if (byte == 0x3A) {
      const value = this.parseU32();
      return visitor.visitI64(1 - (value as i64));
    } else if (byte == 0x3B) {
      // TODO parse
    } else if (byte >= 0x3C && byte <= 0x3F) {
      throw new Error("unassigned code");
    } else if (byte >= 0x40 && byte <= 0x57) { // Major type 2: byte string
      return this.parseByteArray(byte as usize - 0x40, visitor);
    } else if (byte == 0x58) {
      const len = this.parseU8() as usize;
      return this.parseByteArray(len, visitor);
    } else if (byte == 0x59) {
      const len = this.parseU16() as usize;
      return this.parseByteArray(len, visitor);
    } else if (byte == 0x5A) {
      const len = this.parseU32() as usize;
      return this.parseByteArray(len, visitor);
    } else if (byte == 0x5B) {
      const len = this.parseU64();
      assert(len < (usize.MAX_VALUE as u64), "length out of range");
      return this.parseByteArray(len as usize, visitor);
    } else if (byte >= 0x5C && byte <= 0x5E) {
      throw new Error("unassigned code");
    } else if (byte == 0x5F) {
      return this.parseIndefiniteByteArray(visitor);
    } else if (byte >= 0x60 && byte <= 0x77) { // Major type 3: a text string
      return this.parseString(byte as usize - 0x60, visitor);
    } else if (byte == 0x78) {
      const len = this.parseU8() as usize;
      return this.parseString(len, visitor);
    } else if (byte == 0x79) {
      const len = this.parseU16() as usize;
      return this.parseString(len, visitor);
    } else if (byte == 0x7A) {
      const len = this.parseU32() as usize;
      return this.parseString(len, visitor);
    } else if (byte == 0x7B) {
      const len = this.parseU64();
      assert(len < (usize.MAX_VALUE as u64), "length out of range");
      return this.parseString(len as usize, visitor);
    } else if (byte >= 0x7C && byte <= 0x7E) {
      throw new Error("unassigned code");
    } else if (byte == 0x7F) {
      return this.parseIndefiniteString(visitor);
    } else if (byte >= 0x80 && byte <= 0x97) { // Major type 4: array
      return this.parseArray(byte as usize - 0x80, visitor);
    } else if (byte == 0x98) {
      const len = this.parseU8() as usize;
      return this.parseArray(len, visitor);
    } else if (byte == 0x99) {
      const len = this.parseU16() as usize;
      return this.parseArray(len, visitor);
    } else if (byte == 0x9A) {
      const len = this.parseU32() as usize;
      return this.parseArray(len, visitor);
    } else if (byte == 0x9B) {
      const len = this.parseU64();
      assert(len < (usize.MAX_VALUE as u64), "length out of range");
      return this.parseArray(len as usize, visitor);
    } else if (byte >= 0x9C && byte <= 0x9E) {
      throw new Error("unassigned code");
    } else if (byte == 0x9F) {
      return this.parseIndefiniteArray(visitor);
    } else if (byte >= 0xA0 && byte <= 0xB7) { // Major type 5: map
      return this.parseMap(byte as usize - 0xA0, visitor);
    } else if (byte == 0xB8) {
      const len = this.parseU8() as usize;
      return this.parseMap(len, visitor);
    } else if (byte == 0xB9) {
      const len = this.parseU16() as usize;
      return this.parseMap(len, visitor);
    } else if (byte == 0xBA) {
      const len = this.parseU32() as usize;
      return this.parseMap(len, visitor);
    } else if (byte == 0xBB) {
      const len = this.parseU64();
      assert(len < (usize.MAX_VALUE as u64), "length out of range");
      return this.parseMap(len as usize, visitor);
    } else if (byte >= 0xBC && byte <= 0xBE) {
      throw new Error("unassigned code");
    } else if (byte == 0xBF) {
      return this.parseIndefiniteMap(visitor);
    } else if (byte >= 0xC0 && byte <= 0xDB) { // Major type 6: tagged types
      throw new Error("tags not supported");
    } else if (byte >= 0xDC && byte <= 0xDF) {
      throw new Error("unassigned code");
    } else if (byte >= 0xE0 && byte <= 0xF3) { // Major type 7: floating points, and simple data types
      throw new Error("unassigned code");
    } else if (byte == 0xF4) {
      return visitor.visitBool(false);
    } else if (byte == 0xF5) {
      return visitor.visitBool(true);
    } else if (byte == 0xF6) {
      return visitor.visitNull(); // null
    } else if (byte == 0xF7) {
      return visitor.visitNull(); // undefined (doesn't exists in AS)
    } else if (byte == 0xF8) {
      throw new Error("unassigned code");
    } else if (byte == 0xF9) {
      const value = this.parseF16();
      return visitor.visitF32(value);
    } else if (byte == 0xFA) {
      const value = this.parseF32();
      return visitor.visitF32(value);
    } else if (byte == 0xFb) {
      const value = this.parseF64();
      return visitor.visitF64(value);
    } else if (byte >= 0xFC && byte <= 0xFE) {
      throw new Error("unassigned code");
    } else if (byte == 0xFF) {
      throw new Error("unexpected code");
    }

    throw new Error("unreachable");
  }
}
