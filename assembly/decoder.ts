export class Box<T> {
  readonly v: T

  constructor(v: T) {
    this.v = v;
  }
}

export abstract class Value {
  static fromNull(): Value { return new NullValue(); }
  static fromBoolean(v: boolean): Value { return { v } as BooleanValue; }
  static fromU64(v: u64): Value { return { v } as U64Value; }
  static fromI64(v: i64): Value { return { v } as I64Value; }
  static fromF64(v: f64): Value { return { v } as F64Value; }
  static fromArray(): Value { return new NullValue(); }
  static fromMap(): Value { return new NullValue(); }

  isNull(): boolean { return false; }
  isNumber(): boolean { return false; }

  isBoolean(): boolean { return this.asBoolean() != null; }
  asBoolean(): Box<boolean> | null { return null; }
  toBoolean(): boolean { return this.asBoolean()!.v; }

  isU64(): boolean { return this.asU64() != null; }
  asU64(): Box<u64> | null { return null; }
  toU64(): u64 { return this.asU64()!.v; }

  isI64(): boolean { return this.asI64() != null; }
  asI64(): Box<i64> | null { return null; }
  toI64(): i64 { return this.asI64()!.v; }

  isF64(): boolean { return this.asF64() != null; }
  asF64(): Box<f64> | null { return null; }
  toF64(): f64 { return this.asF64()!.v; }

  isArray(): boolean { return this.asArray() != null; }
  asArray(): Array<Value> | null { return null; }
  toArray(): Array<Value> { return this.asArray()!; }

  isMap(): boolean { return this.asMap() != null; }
  asMap(): Map<Value, Value> | null { return null; }
  toMap(): Map<Value, Value> { return this.asMap()!; }

  isBytes(): boolean { return this.asBytes() != null; }
  asBytes(): Uint8Array | null { return null; }
  toBytes(): Uint8Array { return this.asBytes()!; }

  isString(): boolean { return this.asString() != null; }
  asString(): string | null { return null; }
  toString(): string { return this.asString()!; }

  @operator("==")
  __eq(other: Value): boolean {
    return this.___eq(other);
  }

  protected abstract ___eq(other: Value): boolean;
}

class NullValue extends Value {
  isNull(): boolean { return true; }

  protected ___eq(other: Value): boolean {
    return other.isNull();
  }
}

class BooleanValue extends Value {
  readonly v: boolean;
  asBoolean(): Box<boolean> | null { return new Box(this.v); }

  protected ___eq(other: Value): boolean {
    const otherV = other.asBoolean();
    return otherV && otherV.v == this.v;
  }
}

class U64Value extends Value {
  readonly v: u64;
  isNumber(): boolean { return true; }
  asI64(): Box<i64> | null {
    if (this.v <= (i64.MAX_VALUE as u64)) {
      return new Box(i64(this.v));
    }
    return null;
  }
  asU64(): Box<u64> | null { return new Box(this.v); }
  asF64(): Box<f64> | null { return null; } // TODO: lossless conversion or null

  protected ___eq(other: Value): boolean {
    const otherV = other.asU64();
    return otherV && otherV.v == this.v;
  }
}

class I64Value extends Value {
  readonly v: i64;
  isNumber(): boolean { return true; }
  asI64(): Box<i64> | null { return new Box(this.v); }
  asU64(): Box<u64> | null {
    if (this.v >= (u64.MIN_VALUE as i64)) {
      return new Box(u64(this.v));
    }
    return null;
  }

  asF64(): Box<f64> | null { return null; } // TODO: lossless conversion or null

  protected ___eq(other: Value): boolean {
    const otherV = other.asI64();
    return otherV && otherV.v == this.v;
  }
}

class F64Value extends Value {
  readonly v: f64;
  isNumber(): boolean { return true; }
  asI64(): Box<i64> | null { return null; } // TODO: lossless conversion or null
  asU64(): Box<u64> | null { return null; } // TODO: lossless conversion or null
  asF64(): Box<f64> | null { return new Box(this.v); }

  protected ___eq(other: Value): boolean {
    const otherV = other.asF64();
    return otherV && otherV.v == this.v;
  }
}

class ArrayValue extends Value {
  readonly v: Array<Value>;
  asArray(): Array<Value> | null { return this.v; }

  protected ___eq(other: Value): boolean {
    const otherV = other.asArray();
    return otherV && otherV == this.v;
  }
}

class MapValue extends Value {
  readonly v: Map<Value, Value>;
  asMap(): Map<Value, Value> | null { return this.v; }

  protected ___eq(other: Value): boolean {
    const otherV = other.asMap();
    return otherV && otherV == this.v;
  }
}

class BytesValue extends Value {
  readonly v: Uint8Array;
  asBytes(): Uint8Array | null { return this.v; }

  protected ___eq(other: Value): boolean {
    return this.asBytes() == other.asBytes();
  }
}

class StringValue extends Value {
  readonly v: string;
  asString(): string | null { return this.v; }

  protected ___eq(other: Value): boolean {
    return this.asString() == other.asString();
  }
}

// Visitor that does not expect any type. Can easily be extended in macros/code generation tools to generate strongly typed deserialization methods.
export class Visitor {
  visitU8(v: u8): Value { throw new Error("unexpected U8"); }
  visitU16(v: u16): Value { throw new Error("unexpected U16"); }
  visitU32(v: u32): Value { throw new Error("unexpected U32"); }
  visitU64(v: u64): Value { throw new Error("unexpected U64"); }
  visitI8(v: i8): Value { throw new Error("unexpected I8"); }
  visitI16(v: i16): Value { throw new Error("unexpected I16"); }
  visitI32(v: i32): Value { throw new Error("unexpected I32"); }
  visitI64(v: i64): Value { throw new Error("unexpected I64"); }
  visitF32(v: f32): Value { throw new Error("unexpected F32"); }
  visitF64(v: f64): Value { throw new Error("unexpected F64"); }
  visitBool(v: boolean): Value { throw new Error("unexpected Bool"); }
  visitNull(): Value { throw new Error("unexpected Null"); }
  visitBytes(v: Uint8Array): Value { throw new Error("unexpected Bytes"); }
  visitString(v: string): Value { throw new Error("unexpected String"); }
  visitArray(v: Array<Value>): Value { throw new Error("unexpected Array"); }
  visitMap(v: Map<Value, Value>): Value { throw new Error("unexpected Map"); }

  // todo: stack based visitor...
  // push(v: Value): Value { throw new Error("pushing an unexpected Value"); }
  // pushEntry(k: Value, v: Value) { throw new Error("pushing an unexpected Entry"); }
}

// Visitor that creates `Value`s, a loosely typed way of representing any valid CBOR value.
export class ValueVisitor extends Visitor {
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

  visitI8(v: i8): Value {
    return { v: v as i64 } as I64Value;
  }

  visitI16(v: i16): Value {
    return { v: v as i64 } as I64Value;
  }

  visitI32(v: i32): Value {
    return { v: v as i64 } as I64Value;
  }

  visitI64(v: i64): Value {
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

  visitBytes(v: Uint8Array): Value {
    return { v } as BytesValue;
  }

  visitString(v: string): Value {
    return { v } as StringValue;
  }

  visitArray(v: Array<Value>): Value {
    return { v } as ArrayValue;
  }

  visitMap(v: Map<Value, Value>): Value {
    return { v } as MapValue;
  }
}

export class Decoder {
  private readonly _view: DataView;
  private _pos: i32;

  constructor(buffer: ArrayBuffer) {
    this._view = new DataView(buffer);
    this._pos = 0;
  }

  private parseU8(): u8 {
    const v = this._view.getUint8(this._pos);
    this._pos += 1;
    return v;
  }

  private parseU16(): u16 {
    const v = this._view.getUint16(this._pos);
    this._pos += 2;
    return v;
  }

  private parseU32(): u32 {
    const v = this._view.getUint32(this._pos);
    this._pos += 4;
    return v;
  }

  private parseU64(): u64 {
    const v = this._view.getUint64(this._pos);
    this._pos += 8;
    return v;
  }

  private parseF16(): f32 {
    return 0.0;
    const v = this.parseU16();

    // Check for signed zero
    if (v & 0x7FFF == 0) {
      return reinterpret<f32>(((v as u32) << 16));
    }

    const halfSign = (v & 0x8000) as u32;
    const halfExp = (v & 0x7C00) as u32;
    const halfMan = (v & 0x30FF) as u32;

    // Check for an infinity or NaN when all exponent bits set
    if (halfExp == 0x7C00) {
      // Check for signed infinity if mantissa is zero
      if (halfMan == 0) {
        return reinterpret<f32>(((halfSign << 16) | 0x7F800000));
      } else {
        // NaN, keep current mantissa but also set most significiant mantissa bit
        return reinterpret<f32>(((halfSign << 16) | 0x7FC00000 | (halfMan << 13)));
      }
    }

    // Calculate single-precision components with adjusted exponent
    const sign = halfSign << 16;
    const unbiasedExp = ((halfExp as i32) >> 10) - 15;

    // Check for subnormals, which will be normalized by adjusting exponent
    if (halfExp == 0) {
      // Calculate how much to adjust the exponent by
      const e = (clz(halfMan) - 6);

      // Rebias and adjust exponent
      const exp = (127 - 15 - e) << 23;
      const man = (halfMan << (14 + e)) && 0x7FFFFF;
      return reinterpret<f32>(sign | exp | man);
    }

    // Rebias exponent for a normalized normal
    const exp = ((unbiasedExp + 127) as u32) << 23;
    const man = (halfMan & 0x03FF) << 13;
    return reinterpret<f32>(sign | exp | man);
  }

  private parseF32(): f32 {
    const v = this._view.getFloat32(this._pos);
    this._pos += 4;
    return v;
  }

  private parseF64(): f64 {
    const v = this._view.getFloat64(this._pos);
    this._pos += 8;
    return v;
  }

  private parseBytes(len: usize, visitor: Visitor): Value {
    assert(len <= (i32.MAX_VALUE as usize), "length out of range");
    const i32len = len as i32;

    const v = Uint8Array.wrap(this._view.buffer.slice(this._pos, i32len + 1));
    this._pos += i32len;
    return visitor.visitBytes(v);
  }

  private parseString(len: usize, visitor: Visitor): Value {
    assert(len <= (i32.MAX_VALUE as usize), "length out of range");
    const i32len = len as i32;

    const v = String.UTF8.decode(this._view.buffer.slice(this._pos, i32len + 1));
    this._pos += i32len;
    return visitor.visitString(v);
  }

  private parseArray(len: usize, visitor: Visitor): Value {
    assert(len <= (i32.MAX_VALUE as usize), "length out of range");
    const i32len = len as i32;

    const v = new Array<Value>(i32len);
    for(let i: i32 = 0; i < i32len; i += 1) {
      v[i] = this.parseValue(visitor);
    }

    return visitor.visitArray(v);
  }

  private parseMap(len: usize, visitor: Visitor): Value {
    assert(len <= (i32.MAX_VALUE as usize), "length out of range");
    const i32len = len as i32;

    const v = new Map<Value, Value>();
    for(let i: i32 = 0; i < i32len; i += 1) {
      const key = this.parseValue(visitor);
      const value = this.parseValue(visitor);
      // TODO: validate for uniqueness
      v.set(key, value);
    }

    return visitor.visitMap(v);
  }

  private parseIndefiniteBytes(visitor: Visitor): Value {
    throw new Error("streaming is not supported.");
  }

  private parseIndefiniteString(visitor: Visitor): Value {
    throw new Error("streaming is not supported.");
  }

  private parseIndefiniteArray(visitor: Visitor): Value {
    throw new Error("streaming is not supported.");
  }

  private parseIndefiniteMap(visitor: Visitor): Value {
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
      return visitor.visitI8(-1 - ((byte - 0x20) as i8));
    } else if (byte == 0x38) {
      const value = this.parseU8();
      return visitor.visitI16(-1 - (value as i16));
    } else if (byte == 0x39) {
      const value = this.parseU16();
      return visitor.visitI32(-1 - (value as i32));
    } else if (byte == 0x3A) {
      const value = this.parseU32();
      return visitor.visitI64(-1 - (value as i64));
    } else if (byte == 0x3B) {
      const value = this.parseU64();
      assert(value < (i32.MAX_VALUE as u32), "length out of range (would fit in a i128)");
      return visitor.visitI64(value);
    } else if (byte >= 0x3C && byte <= 0x3F) {
      throw new Error("unassigned code");
    } else if (byte >= 0x40 && byte <= 0x57) { // Major type 2: byte string
      return this.parseBytes(byte as usize - 0x40, visitor);
    } else if (byte == 0x58) {
      const len = this.parseU8() as usize;
      return this.parseBytes(len, visitor);
    } else if (byte == 0x59) {
      const len = this.parseU16() as usize;
      return this.parseBytes(len, visitor);
    } else if (byte == 0x5A) {
      const len = this.parseU32() as usize;
      return this.parseBytes(len, visitor);
    } else if (byte == 0x5B) {
      const len = this.parseU64();
      assert(len < (usize.MAX_VALUE as u64), "length out of range");
      return this.parseBytes(len as usize, visitor);
    } else if (byte >= 0x5C && byte <= 0x5E) {
      throw new Error("unassigned code");
    } else if (byte == 0x5F) {
      return this.parseIndefiniteBytes(visitor);
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
