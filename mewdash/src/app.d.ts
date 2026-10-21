import type { FluxerUser } from "$lib/types/fluxer";

declare global {
  namespace App {

    interface Locals {
      user: User | null;
      /** The locale this request is rendered in, resolved in hooks.server.ts. */
      locale: string;
    }


    interface PageData {
      user: FluxerUser | null;
    }

    interface Error {
      message: string;
    }
  }
}

declare namespace svelteHTML {
  // Enhance all HTMLAttributes events
  interface HTMLAttributes<T> {
    'on:clickoutside'?: (event: CustomEvent<any> & { target: EventTarget & T }) => any;
  }
}

export {};