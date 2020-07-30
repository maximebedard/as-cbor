# as-cbor

WIP cbor encoder/decoder for assemblyscript. I'm planning on supporting the following:

supported types:

- [x] u64/i64/f64
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

supported features:
- [x] encoding/decoding
- [ ] streaming
- [ ] enums

# Usage

```ts
import * as cbor from "as-cbor";

const v = cbor.Value.u64(1000000);
const v = cbor.decode("1a 00 0f 42 40");
const vAsU64 = v.asU64() // 1000000
cbor.encode(v) // "1a 00 0f 42 40"
```
