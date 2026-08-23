# Nivasa Phase 1 Step 1 — Home Intelligence + Home DNA

## Acceptance criteria

1. An authenticated property owner can persist structured home intelligence for their property.
2. Home intelligence includes property type, configuration, possession timing, location, area and explicit metadata without provider-specific output leaking into the domain model.
3. Home intelligence updates advance a version counter and record the authenticated confirmer.
4. An authenticated property owner can persist versioned Home DNA tied to the current home-intelligence version.
5. Home DNA keeps household, lifestyle, design personality, storage, functional needs, future needs and smart-home preferences as separate domains.
6. Room understanding is persisted as an explicit versioned record with confidence, provenance, geometry/dimensions, constraints, requirements and confirmation status.
7. User-confirmed or corrected room understanding records the authenticated user as the confirmer and remains distinct from AI/imported provenance.
8. All Step 1 mutating APIs require authentication, ownership validation and Zod validation.
9. Missing properties/rooms/understandings return normalized not-found errors rather than leaking persistence details.
10. No product prices, warranties, specifications or AI-generated facts are fabricated by Step 1.
11. Prisma migration is additive and safe for the existing Phase 0/0.1 schema.
12. The implementation remains behind repository/service/validator/API boundaries and does not access Prisma from UI code.

## Test matrix

| Area                          | Success                            | Critical negative case                                     |
| ----------------------------- | ---------------------------------- | ---------------------------------------------------------- |
| Home intelligence validator   | Complete property profile accepted | Invalid property type/area rejected                        |
| Room understanding validator  | Valid room contract accepted       | Confidence outside 0–10000 rejected                        |
| Home DNA validator            | All required domains accepted      | Missing required domain rejected                           |
| Home intelligence API         | Owner can read/update own home     | Cross-owner property is not accessible                     |
| Room understanding API        | Owner can create/list versions     | Cross-owner room is not accessible                         |
| Home DNA API                  | Owner can create/list versions     | Cross-owner property is not accessible                     |
| Versioning                    | New writes increment version       | Existing history is never silently reused as a new version |
| Provenance                    | AI/USER/IMPORTED remain explicit   | AI record cannot be presented as user confirmation         |

## CI gate

The repository CI chain remains authoritative: `npm ci`, `format:check`, `lint`, `prisma generate`, `typecheck`, `test`, `prisma validate`, `build`, and `git diff --check`.
