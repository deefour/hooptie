export const REQUEST_CONCURRENCY = 3;

/**
 * Lots of high-mileage listings are given a false mileage when posted in order
 * to appear when a user is filtering results by lowest mileage first.
 *
 * The application will treat any vehicle mileages under this threshold as "not reported".
 */
export const MINIMUM_MILEAGE = 150;

export const TOPIC_NEW_LISTINGS = "new-listings";
