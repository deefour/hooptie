// # of milliseconds in a single day
export const DAY_AS_MILLISECONDS = 24 * 60 * 60 * 1000;

// number of days to consider a listing 'new'
export const DAYS_TO_CONSIDER_NEW = 3;

export const MILE_AS_METERS = 1609.34;

/** The maxiumum distance I would be willing to drive to pickup a vehicle */
export const MAX_DISTANCE_WORTH_DRIVING_IN_MILES = 500;

/** Identifying string for the AutoTrader.com search service */
export const AUTOTRADER = "autotrader";

/** Identifying string for the Autolist.com search service */
export const AUTOLIST = "autolist";

/**
 * How many days back from NOW should listings be fetched? The query is based on
 * each listing's original creation date.
 */
export const DAYS_TO_FETCH = 10;

/**
 * The max # of listings to fetch from firestore for display.
 */
export const QUERY_LIMIT = 750;
