export * from "./decoder";
export * from "./encoder";

@derive(cbor.Serialize, cbor.Deserialize)
export class Example {
  a: u32;
  b: i32;
  private c: u64;
  private d: i64;

  @serde_skip
  e: u32;

  @serde_skip_deserialize
  f: u32;

  @serde_skip_serialize
  g: u32;

  @serde_rename("hh")
  h: u32;

  @serde_rename_deserialize("ii")
  i: u32;

  @serde_rename_serialize("jj")
  j: u32;

  static fromCbor(buffer: ArrayBuffer): Example {
    return new Example();
  }
  toCbor(buffer: ArrayBuffer): void {}
}
