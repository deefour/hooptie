import * as admin from "firebase-admin";
import * as functions from "firebase-functions";

import { Change } from "firebase-functions";
import { DocumentSnapshot } from "firebase-functions/lib/providers/firestore";
import { TOPIC_NEW_LISTINGS } from "../constants";

export default async (
  change: Change<DocumentSnapshot>,
  context: functions.EventContext
): Promise<void> => {
  const tokens: string[] | undefined = change.after.get("push_tokens");

  if (tokens === undefined) {
    return;
  }

  try {
    await admin.messaging().subscribeToTopic(tokens, TOPIC_NEW_LISTINGS);

    console.log(
      `FCM topic subscribtion to [${TOPIC_NEW_LISTINGS}] successful for [${context.params.uid}]`
    );
  } catch (error) {
    console.info(
      `FCM topic subscription failed for user [${context.params.uid}]`
    );
    console.error(error);
  }
};
