import { Box } from "./utils";

export abstract class Value {
  static fromNull(): Value { return new NullValue(); }
  static fromBoolean(v: boolean): Value { return { v } as BooleanValue; }
  static fromU64(v: u64): Value { return { v } as U64Value; }
  static fromI64(v: i64): Value { return { v } as I64Value; }
  static fromF64(v: f64): Value { return { v } as F64Value; }
  static fromArray(v: Array<Value>): Value { return { v } as ArrayValue; }
  static fromMap(v: Map<Value, Value>): Value { return { v } as MapValue; }
  static fromBytes(v: Uint8Array): Value { return { v } as BytesValue; }
  static fromString(v: string): Value { return { v } as StringValue; }

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
  protected abstract __eq(other: Value): boolean;

  @operator("!=")
  private __ne(other: Value): boolean { return !this.__eq(other); }
}

class NullValue extends Value {
  isNull(): boolean { return true; }

  protected __eq(other: Value): boolean {
    // TODO: for some reason, virtual dispatching works here...
    return other.isNull();
  }
}

class BooleanValue extends Value {
  readonly v: boolean;
  asBoolean(): Box<boolean> | null { return new Box(this.v); }

  protected __eq(other: Value): boolean {
    // TODO: for some reason, virtual dispatching works here...
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

  protected __eq(other: Value): boolean {
    // TODO: virtual dispatch is broken here. Not sure why...
    if (other instanceof U64Value) {
      return (other as U64Value).v == this.v;
    } else if (other instanceof I64Value) {
      const otherV = (other as I64Value).asU64();
      return otherV && otherV.v == this.v;
    } else if (other instanceof F64Value) {
      const otherV = (other as F64Value).asU64();
      return otherV && otherV.v == this.v;
    }
    return false;
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

  protected __eq(other: Value): boolean {
    // TODO: virtual dispatch is broken here. Not sure why...
    if (other instanceof U64Value) {
      const otherV = (other as U64Value).asI64();
      return otherV && otherV.v == this.v;
    } else if (other instanceof I64Value) {
      return (other as I64Value).v == this.v;
    } else if (other instanceof F64Value) {
      const otherV = (other as F64Value).asI64();
      return otherV && otherV.v == this.v;
    }
    return false;
  }
}

class F64Value extends Value {
  readonly v: f64;
  isNumber(): boolean { return true; }
  asI64(): Box<i64> | null { return null; } // TODO: lossless conversion or null
  asU64(): Box<u64> | null { return null; } // TODO: lossless conversion or null
  asF64(): Box<f64> | null { return new Box(this.v); }

  protected __eq(other: Value): boolean {
    // TODO: virtual dispatch is broken here. Not sure why...
    if (other instanceof U64Value) {
      const otherV = (other as U64Value).asF64();
      return otherV && otherV.v == this.v;
    } else if (other instanceof I64Value) {
      const otherV = (other as I64Value).asF64();
      return otherV && otherV.v == this.v;
    } else if (other instanceof F64Value) {
      return (other as F64Value).v == this.v;
    }
    return false;
  }
}

class ArrayValue extends Value {
  readonly v: Array<Value>;
  asArray(): Array<Value> | null { return this.v; }
  set(index: i32, other: Value): void { this.v[index] = other; }

  protected __eq(other: Value): boolean {
    return other instanceof ArrayValue &&
      this.deepEqual((other as ArrayValue).v)
  }

  private deepEqual(other: Array<Value>): boolean {
    if (this.v.length != other.length) return false;
    for(let i = 0; i < this.v.length; i += 1) {
      if (this.v[i] != other[i]) return false;
    }
    return true;
  }
}

class MapValue extends Value {
  readonly v: Map<Value, Value>;
  asMap(): Map<Value, Value> | null { return this.v; }
  set(key: Value, value: Value): void { this.v.set(key, value); }

  protected __eq(other: Value): boolean {
    const otherV = other.asMap();
    return otherV && otherV == this.v;
  }

  private deepEqual(other: Map<Value, Value>): boolean {
    if (this.v.size != other.size) return false;
    const keys = this.v.keys();
    for (let i = 0; i < keys.length; i += 1) {
      let key = keys[i];
      if (!other.has(key) || (this.v.get(key) != other.get(key))) return false;
    }
    return true;
  }
}

class BytesValue extends Value {
  readonly v: Uint8Array;
  asBytes(): Uint8Array | null { return this.v; }

  protected __eq(other: Value): boolean {
    // TODO: investigate weird virtual dispatch issue.
    return other instanceof BytesValue &&
      this.deepEqual((other as BytesValue).v);
  }

  private deepEqual(other: Uint8Array): boolean {
    if (this.v.length != other.length) return false;
    for(let i = 0; i < this.v.length; i += 1) {
      if (this.v[i] != other[i]) return false;
    }
    return true;
  }
}

class StringValue extends Value {
  readonly v: string;
  asString(): string | null { return this.v; }

  protected __eq(other: Value): boolean {
    // TODO: investigate weird virtual dispatch issue.
    return other instanceof StringValue &&
      this.v == (other as StringValue).v;
  }
}

// Visitor that does not expect any type. Can easily be extended in macros/code generation tools to generate strongly typed deserialization methods.
export class Visitor {
  visitU8(v: u8): void { throw new Error("unexpected U8"); }
  visitU16(v: u16): void { throw new Error("unexpected U16"); }
  visitU32(v: u32): void { throw new Error("unexpected U32"); }
  visitU64(v: u64): void { throw new Error("unexpected U64"); }
  visitI8(v: i8): void { throw new Error("unexpected I8"); }
  visitI16(v: i16): void { throw new Error("unexpected I16"); }
  visitI32(v: i32): void { throw new Error("unexpected I32"); }
  visitI64(v: i64): void { throw new Error("unexpected I64"); }
  visitF32(v: f32): void { throw new Error("unexpected F32"); }
  visitF64(v: f64): void { throw new Error("unexpected F64"); }
  visitBool(v: boolean): void { throw new Error("unexpected Bool"); }
  visitNull(): void { throw new Error("unexpected Null"); }
  visitBytes(v: Uint8Array): void { throw new Error("unexpected Bytes"); }
  visitString(v: string): void { throw new Error("unexpected String"); }
  visitArray(len: i32): void { throw new Error("unexpected Array"); }
  visitMap(): void { throw new Error("unexpected Map"); }
  visitArrayElement(decoder: Decoder, index: i32): void { throw new Error("unexpected ArrayElement"); }
  visitMapEntry(decoder: Decoder): void { throw new Error("unexpected MapEntry"); }
}

// Visitor that creates `Value`s, a loosely typed way of representing any valid CBOR value.
export class ValueVisitor extends Visitor {
  private readonly _stack: Array<Value>;

  constructor() {
    super();
    this._stack = new Array();
  }

  get value(): Value {
    return this._stack[0];
  }

  visitU8(v: u8): void {
    this._stack.push(Value.fromU64(u64(v)));
  }

  visitU16(v: u16): void {
    this._stack.push(Value.fromU64(u64(v)));
  }

  visitU32(v: u32): void {
    this._stack.push(Value.fromU64(u64(v)));
  }

  visitU64(v: u64): void {
    this._stack.push(Value.fromU64(v));
  }

  visitI8(v: i8): void {
    this._stack.push(Value.fromI64(i64(v)));
  }

  visitI16(v: i16): void {
    this._stack.push(Value.fromI64(i64(v)));
  }

  visitI32(v: i32): void {
    this._stack.push(Value.fromI64(i64(v)));
  }

  visitI64(v: i64): void {
    this._stack.push(Value.fromI64(v));
  }

  visitF32(v: f32): void {
    this._stack.push(Value.fromF64(f64(v)));
  }

  visitF64(v: f64): void {
    this._stack.push(Value.fromF64(v));
  }

  visitBool(v: boolean): void {
    this._stack.push(Value.fromBoolean(v));
  }

  visitNull(): void {
    this._stack.push(Value.fromNull());
  }

  visitBytes(v: Uint8Array): void {
    this._stack.push(Value.fromBytes(v));
  }

  visitString(v: string): void {
    this._stack.push(Value.fromString(v));
  }

  visitArray(len: i32): void {
    this._stack.push(Value.fromArray(new Array(len)));
  }

  visitArrayElement(decoder: Decoder, index: i32): void {
    this.peekAs<ArrayValue>().set(index, decoder.parseValue());
  }

  visitMap(): void {
    this._stack.push(Value.fromMap(new Map<Value, Value>()));
  }

  visitMapEntry(decoder: Decoder): void {
    const key = decoder.parseValue();
    const value = decoder.parseValue();
    this.peekAs<MapValue>().set(key, value);
  }

  private peekAs<T>(): T {
    return this._stack[this._stack.length - 1] as T
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

  private parseBytes(len: usize, visitor: Visitor): void {
    assert(len <= (i32.MAX_VALUE as usize), "length out of range");
    const i32len = len as i32;

    const v = Uint8Array.wrap(this._view.buffer.slice(this._pos, i32len + 1));
    this._pos += i32len;
    visitor.visitBytes(v);
  }

  private parseString(len: usize, visitor: Visitor): void {
    assert(len <= (i32.MAX_VALUE as usize), "length out of range");
    const i32len = len as i32;

    const v = String.UTF8.decode(this._view.buffer.slice(this._pos, i32len + 1));
    this._pos += i32len;
    visitor.visitString(v);
  }

  private parseArray(len: usize, visitor: Visitor): void {
    assert(len <= (i32.MAX_VALUE as usize), "length out of range");
    const i32len = len as i32;

    visitor.visitArray(i32len);
    for(let i = 0; i < i32len; i += 1) {
      visitor.visitArrayElement(this, i);
    }
  }

  private parseMap(len: usize, visitor: Visitor): void {
    visitor.visitMap();
    for(let i: usize = 0; i < len; i += 1) {
      visitor.visitMapEntry(this);
    }
  }

  private parseIndefiniteBytes(visitor: Visitor): void {
    throw new Error("streaming is not supported.");
  }

  private parseIndefiniteString(visitor: Visitor): void {
    throw new Error("streaming is not supported.");
  }

  private parseIndefiniteArray(visitor: Visitor): void {
    throw new Error("streaming is not supported.");
  }

  private parseIndefiniteMap(visitor: Visitor): void {
    throw new Error("streaming is not supported.");
  }

  parseValue(): Value {
    const visitor = new ValueVisitor();
    this.parse(visitor);
    return visitor.value;
  }

  parse(visitor: Visitor): void {
    const byte = this.parseU8();
    if (byte <= 0x17) { // Major type 0: unsigned integer
      visitor.visitU8(byte);
    } else if (byte == 0x18) {
      const value = this.parseU8();
      visitor.visitU8(value);
    } else if (byte == 0x19) {
      const value = this.parseU16();
      visitor.visitU16(value);
    } else if (byte == 0x1A) {
      const value = this.parseU32();
      visitor.visitU32(value);
    } else if (byte == 0x1b) {
      const value = this.parseU64();
      visitor.visitU64(value);
    } else if (byte >= 0x1C && byte <= 0x1F) {
      throw new Error("unassigned code");
    } else if (byte >= 0x20 && byte <= 0x37) { // Major type 1: negative integer
      visitor.visitI8(-1 - ((byte - 0x20) as i8));
    } else if (byte == 0x38) {
      const value = this.parseU8();
      visitor.visitI16(-1 - (value as i16));
    } else if (byte == 0x39) {
      const value = this.parseU16();
      visitor.visitI32(-1 - (value as i32));
    } else if (byte == 0x3A) {
      const value = this.parseU32();
      visitor.visitI64(-1 - (value as i64));
    } else if (byte == 0x3B) {
      const value = this.parseU64();
      assert(value < (i32.MAX_VALUE as u32), "length out of range (would fit in a i128)");
      visitor.visitI64(value);
    } else if (byte >= 0x3C && byte <= 0x3F) {
      throw new Error("unassigned code");
    } else if (byte >= 0x40 && byte <= 0x57) { // Major type 2: byte string
      this.parseBytes(byte as usize - 0x40, visitor);
    } else if (byte == 0x58) {
      const len = this.parseU8() as usize;
      this.parseBytes(len, visitor);
    } else if (byte == 0x59) {
      const len = this.parseU16() as usize;
      this.parseBytes(len, visitor);
    } else if (byte == 0x5A) {
      const len = this.parseU32() as usize;
      this.parseBytes(len, visitor);
    } else if (byte == 0x5B) {
      const len = this.parseU64();
      assert(len < (usize.MAX_VALUE as u64), "length out of range");
      this.parseBytes(len as usize, visitor);
    } else if (byte >= 0x5C && byte <= 0x5E) {
      throw new Error("unassigned code");
    } else if (byte == 0x5F) {
      this.parseIndefiniteBytes(visitor);
    } else if (byte >= 0x60 && byte <= 0x77) { // Major type 3: a text string
      this.parseString(byte as usize - 0x60, visitor);
    } else if (byte == 0x78) {
      const len = this.parseU8() as usize;
      this.parseString(len, visitor);
    } else if (byte == 0x79) {
      const len = this.parseU16() as usize;
      this.parseString(len, visitor);
    } else if (byte == 0x7A) {
      const len = this.parseU32() as usize;
      this.parseString(len, visitor);
    } else if (byte == 0x7B) {
      const len = this.parseU64();
      assert(len < (usize.MAX_VALUE as u64), "length out of range");
      this.parseString(len as usize, visitor);
    } else if (byte >= 0x7C && byte <= 0x7E) {
      throw new Error("unassigned code");
    } else if (byte == 0x7F) {
      this.parseIndefiniteString(visitor);
    } else if (byte >= 0x80 && byte <= 0x97) { // Major type 4: array
      this.parseArray(byte as usize - 0x80, visitor);
    } else if (byte == 0x98) {
      const len = this.parseU8() as usize;
      this.parseArray(len, visitor);
    } else if (byte == 0x99) {
      const len = this.parseU16() as usize;
      this.parseArray(len, visitor);
    } else if (byte == 0x9A) {
      const len = this.parseU32() as usize;
      this.parseArray(len, visitor);
    } else if (byte == 0x9B) {
      const len = this.parseU64();
      assert(len < (usize.MAX_VALUE as u64), "length out of range");
      this.parseArray(len as usize, visitor);
    } else if (byte >= 0x9C && byte <= 0x9E) {
      throw new Error("unassigned code");
    } else if (byte == 0x9F) {
      this.parseIndefiniteArray(visitor);
    } else if (byte >= 0xA0 && byte <= 0xB7) { // Major type 5: map
      this.parseMap(byte as usize - 0xA0, visitor);
    } else if (byte == 0xB8) {
      const len = this.parseU8() as usize;
      this.parseMap(len, visitor);
    } else if (byte == 0xB9) {
      const len = this.parseU16() as usize;
      this.parseMap(len, visitor);
    } else if (byte == 0xBA) {
      const len = this.parseU32() as usize;
      this.parseMap(len, visitor);
    } else if (byte == 0xBB) {
      const len = this.parseU64();
      assert(len < (usize.MAX_VALUE as u64), "length out of range");
      this.parseMap(len as usize, visitor);
    } else if (byte >= 0xBC && byte <= 0xBE) {
      throw new Error("unassigned code");
    } else if (byte == 0xBF) {
      this.parseIndefiniteMap(visitor);
    } else if (byte >= 0xC0 && byte <= 0xDB) { // Major type 6: tagged types
      throw new Error("tags not supported");
    } else if (byte >= 0xDC && byte <= 0xDF) {
      throw new Error("unassigned code");
    } else if (byte >= 0xE0 && byte <= 0xF3) { // Major type 7: floating points, and simple data types
      throw new Error("unassigned code");
    } else if (byte == 0xF4) {
      visitor.visitBool(false);
    } else if (byte == 0xF5) {
      visitor.visitBool(true);
    } else if (byte == 0xF6) {
      visitor.visitNull(); // null
    } else if (byte == 0xF7) {
      visitor.visitNull(); // undefined (doesn't exists in AS)
    } else if (byte == 0xF8) {
      throw new Error("unassigned code");
    } else if (byte == 0xF9) {
      const value = this.parseF16();
      visitor.visitF32(value);
    } else if (byte == 0xFA) {
      const value = this.parseF32();
      visitor.visitF32(value);
    } else if (byte == 0xFb) {
      const value = this.parseF64();
      visitor.visitF64(value);
    } else if (byte >= 0xFC && byte <= 0xFE) {
      throw new Error("unassigned code");
    } else if (byte == 0xFF) {
      throw new Error("unexpected code");
    } else {
      throw new Error("unreachable");
    }
  }
}
