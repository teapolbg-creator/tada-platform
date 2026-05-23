/* eslint-disable */
import * as Router from 'expo-router';

export * from 'expo-router';

declare module 'expo-router' {
  export namespace ExpoRouter {
    export interface __routes<T extends string = string> extends Record<string, unknown> {
      StaticRoutes: `/` | `/_sitemap` | `/ambulance-found` | `/call` | `/emergency-contacts` | `/home` | `/login` | `/medical-profile` | `/notifications` | `/onboarding` | `/otp` | `/payment-methods` | `/profile` | `/request` | `/searching` | `/settings` | `/splash` | `/trips`;
      DynamicRoutes: never;
      DynamicRouteTemplate: never;
    }
  }
}
