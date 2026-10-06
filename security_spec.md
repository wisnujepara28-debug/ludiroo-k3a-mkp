# Security Specification: Aplikasi Muatan Kapal dan Penumpang

## 1. Data Invariants
1. `Ship` records must have valid non-empty names, unique vessel codes, valid operational status (`Bersandar`, `Berlayar`, `Maintenance`), positive capacities, and bounded strings.
2. `Passenger` records must belong to an existing ship record, contain strict passenger identity (valid NIK/KTP format, names <= 100 chars), valid cabin class, valid departure dates, and ticket tracking.
3. `Cargo` records must specify weight > 0, unit count > 0, sender and receiver details, cargo categories, and status transitions (`Terkonfirmasi`, `Dimuat (Loading)`, `Dalam Pelayaran`, `Terkirim`, `Dibatalkan`).
4. Read access to public manifests, ships, and operational logs is granted to authenticated operators or authorized portal viewers.
5. All write operations must pass strict schema validation, type checking, field length boundaries, and identity verification.

## 2. Dirty Dozen Payload Checks
1. Payload with ghost fields injected (e.g. `isAdmin: true` inside a passenger document).
2. Passenger payload with negative seat number or string exceeding 128 characters.
3. Cargo payload with negative weight (`weightKg: -500`).
4. Ship update attempting to mutate immutable registration identifiers.
5. Spoofed operator attribution without valid authentication identity.
6. Oversized payload attack (> 100KB strings) targeting passenger full name.
7. Cargo payload missing required destination port.
8. Updating a finalized manifest without proper operator authorization.
9. Malformed status value not belonging to approved enum allowlist.
10. Unauthenticated write or deletion to core vessel database.
11. Injection into document path identifiers.
12. Attempt to bypass server timestamp verification for audit logging.
