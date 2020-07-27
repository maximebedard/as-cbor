export class Encoder {
  private _buffer: ArrayBuffer;

  constructor() {
    this._buffer = new ArrayBuffer(0);
  }

  // TODO: remove the tons of useless allocations all over the place.
  private concat(other: ArrayBuffer): void {
    const tmp = new Uint8Array(this._buffer.byteLength + other.byteLength);
    tmp.set(Uint8Array.wrap(this._buffer), 0);
    tmp.set(Uint8Array.wrap(other), this._buffer.byteLength);
    this._buffer = tmp.buffer;
  }

  get buffer(): ArrayBuffer {
    return this._buffer;
  }

  writeU8(m: u8, v: u8): void {
    if (v <= 0x17) {
      this.concat([m << 5 | v].buffer);
    } else {
      this.concat([m << 5 | 24, v].buffer);
    }
  }

  writeI8(v: i8): void {
    if (v < 0) {
      this.writeU8(1, -(v + 1) as u8);
    } else {
      this.writeU8(0, v as u8);
    }
  }

  writeU16(m: u8, v: u16): void {
    if (v <= u8.MAX_VALUE) {
      this.writeU8(m, v as u8);
    } else {
      const buf = new DataView(new ArrayBuffer(3));
      buf.setUint8(0, m << 5 | 25);
      buf.setUint16(1, v);
      this.concat(buf.buffer);
    }
  }

  writeI16(v: i16): void {
    if (v < 0) {
      this.writeU16(1, -(v + 1) as u16);
    } else {
      this.writeU16(0, v as u16);
    }
  }

  writeU32(m: u8, v: u32): void {
    if (v <= u16.MAX_VALUE) {
      this.writeU16(m, v as u16);
    } else {
      const buf = new DataView(new ArrayBuffer(5));
      buf.setUint8(0, m << 5 | 26);
      buf.setUint32(1, v);
      this.concat(buf.buffer);
    }
  }

  writeI32(v: i32): void {
    if (v < 0) {
      this.writeU32(1, -(v + 1) as u32);
    } else {
      this.writeU32(0, v as u32);
    }
  }

  writeU64(m: u8, v: u64): void {
    if (v <= u32.MAX_VALUE) {
      this.writeU32(m, v as u32);
    } else {
      const buf = new DataView(new ArrayBuffer(9));
      buf.setUint8(0, m << 5 | 27);
      buf.setUint64(1, v);
      this.concat(buf.buffer);
    }
  }

  writeI64(v: i64): void {
    if (v < 0) {
      this.writeU64(1, -(v + 1) as u64);
    } else {
      this.writeU64(0, v as u64);
    }
  }

  writeF32(v: f32): void {
    if (!isFinite<f32>(v)) {
      if (v == F32.POSITIVE_INFINITY) {
        this.concat([0xF9, 0x7C, 0x00].buffer);
      } else {
        this.concat([0xF9, 0xFC, 0x00].buffer);
      }
    } else if (isNaN<f32>(v)) {
      this.concat([0xF9, 0x7E, 0x00].buffer);
    } else {
      const buf = new DataView(new ArrayBuffer(5));
      buf.setUint8(0, 0xFA);
      buf.setFloat32(1, v);
      this.concat(buf.buffer);
    }
  }

  writeF64(v: f64): void {
    if (!isFinite<f64>(v) || ((v as f32) as f64) == v) {
      this.writeF32(v as f32);
    } else {
      const buf = new DataView(new ArrayBuffer(5));
      buf.setUint8(0, 0xFB);
      buf.setFloat64(1, v);
      this.concat(buf.buffer);
    }
  }

  writeBool(v: bool): void {
    if (v) {
      this.concat([0xF5].buffer);
    } else {
      this.concat([0xF4].buffer);
    }
  }

  writeString(v: string): void {
    const buf = String.UTF8.encode(v);
    this.concat(buf);
  }

  writeBytes(v: Array<u8>): void {
    this.concat(v.buffer);
  }

  writeNull(): void {
    this.concat([0xF6].buffer);
  }
}
