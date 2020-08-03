# as-cbor

WIP [cbor](https://tools.ietf.org/html/rfc7049) encoder/decoder for assemblyscript.

supported types (encoding + decoding):

- [x] number (u64/i64/f64)
- [x] utf-8 string
- [x] byte string
- [x] array
- [x] maps
- [ ] bignum
- [ ] text based date/time
- [ ] epoch based date/time
- [ ] decimal fraction
- [ ] bigfloat
- [ ] tagged items
- [ ] simple value
- [ ] enums (not really part of the RFC, but it's usually convenient)

Unsupported features:
- streaming (indefinite types)

TODOS:
- [ ] f16 (half precision floats)
- [ ] lossless conversions for number types
- [ ] Value#encode
- [ ] optimize encoding to reduce array allocations during concatenations
- [ ] refactor decoder a bit to support direct type conversion
- [ ] check if it's possible to use custom annotations to generate encode/decode functions automatically.
- [ ] add many more tests

# Usage

Api is still in flux, but will eventually look similar to this:

```ts
import * as cbor from "as-cbor";

const v = cbor.Value.fromU64(1000000);
const v = cbor.decode("1a 00 0f 42 40");
const vAsU64 = v.asU64() // 1000000
cbor.encode(v) // "1a 00 0f 42 40"
```
