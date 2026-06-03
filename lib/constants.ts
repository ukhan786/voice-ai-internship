/** Shared constants safe to import from any runtime (Edge middleware included). */
export const SESSION_COOKIE = "vaij_uid";

// Fixed IDs for the two seeded users (stable across restarts). Kept here so
// they can be referenced without importing the SQLite layer.
export const INTERN_ID = "11111111-1111-4111-8111-111111111111";
export const MANAGER_ID = "22222222-2222-4222-8222-222222222222";
