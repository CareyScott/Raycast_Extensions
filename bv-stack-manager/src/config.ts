import { BVService } from "./types";

export const BV_SERVICES: BVService[] = [
  {
    name: "admin",
    displayName: "Admin",
    port: 3001,
    path: "/Users/scottcarey/Developer/bv-admin",
  },
  {
    name: "users",
    displayName: "Users",
    port: 3002,
    path: "/Users/scottcarey/Developer/bv-users",
    hasNpm: true, // This service also runs npm dev
  },
  {
    name: "cms",
    displayName: "CMS",
    port: 3004,
    path: "/Users/scottcarey/Developer/bv-cms",
  },
  {
    name: "education",
    displayName: "Education",
    port: 3005,
    path: "/Users/scottcarey/Developer/bv-education",
  },
  {
    name: "assistant",
    displayName: "Assistant",
    port: 3007,
    path: "/Users/scottcarey/Developer/bv-assistant",
  },
  {
    name: "investment",
    displayName: "Investment",
    port: 3008,
    path: "/Users/scottcarey/Developer/bv-investment",
  },
  {
    name: "subscription",
    displayName: "Subscription",
    port: 3009,
    path: "/Users/scottcarey/Developer/bv-subscription",
  },
];

// XDebug configuration used by all services
export const XDEBUG_ENV = {
  XDEBUG_SESSION: "1",
  XDEBUG_CONFIG: "log_level=0",
};