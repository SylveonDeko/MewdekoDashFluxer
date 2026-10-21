// lib/stores/userStore.ts
import { persisted } from "svelte-persisted-store";
import type { FluxerUser } from "$lib/types/fluxer";

export const userStore = persisted<FluxerUser | null>("currentUser", null);