# Build package: adventures-of-tom-2026-10-25-site

Snapshot of the current site (post 2026-10-25 deploy package), split for easy transfer.

- Parts: `adventures-of-tom-2026-10-25-site.zip.part0` through `.part6`
- Rejoined size: `26466542` bytes
- SHA-256: `ffee52ef864aebf6c5e4aae1f345924d4c6708bd76e2cb3916814a8a8fe8fadb`

## Rejoin (macOS / Linux)

```bash
cat adventures-of-tom-2026-10-25-site.zip.part0 \
    adventures-of-tom-2026-10-25-site.zip.part1 \
    adventures-of-tom-2026-10-25-site.zip.part2 \
    adventures-of-tom-2026-10-25-site.zip.part3 \
    adventures-of-tom-2026-10-25-site.zip.part4 \
    adventures-of-tom-2026-10-25-site.zip.part5 \
    adventures-of-tom-2026-10-25-site.zip.part6 \
  > adventures-of-tom-2026-10-25-site.zip
shasum -a 256 adventures-of-tom-2026-10-25-site.zip
```

Unzip — that folder is the static site. Do not commit the `.part` files or the `.zip` into a game deploy unless you intend to store the package itself.
