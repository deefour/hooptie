import { ActionContext, ActionTree } from "vuex";
import { firestore } from "~/firebase";
import { Decision, RootState } from "~/types";

/**
 * An Abstraction for the actions that loads a collection of decisions
 */
const loadDecisions = async <S, R>(
  { commit }: ActionContext<S, R>,
  collection: string,
  mutation: string
) => {
  const docs: Decision[] = [];

  try {
    (await firestore.collection(collection).get()).docs.forEach(snapshot =>
      docs.push(snapshot.data() as Decision)
    );
  } catch (error) {
    console.error(error.message);
    docs.splice(0, docs.length);
    throw new Error(`Could not load ${collection} decisions from firebase.`);
  } finally {
    commit(mutation, docs);
  }
};

/**
 * An abstraction for the actions that adds or removes a decision on a listing
 * in Cloud Firestore and the local Vuex store.
 *
 * @see actions.toggleFavorite()
 * @see actions.toggleTrashed()
 */
const toggleDecision = async (
  { commit, state }: ActionContext<RootState, RootState>,
  collection: "favorited" | "trashed",
  removeMutation: string,
  addMutation: string,
  payload: Decision
) => {
  const results = await firestore
    .collection(collection)
    .where("vin", "==", payload.vin)
    .where("uid", "==", payload.uid)
    .limit(1)
    .get();

  if (results.size) {
    // remove the decision record(s)
    const promises: Promise<void>[] = [];
    const forDeletion = (state[collection] as Decision[]).filter(
      (d: Decision) => d.vin === payload.vin
    );

    commit(removeMutation, payload);

    try {
      results.forEach(doc =>
        promises.push(firestore.doc(`${collection}/${doc.id}`).delete())
      );

      await Promise.all(promises);
    } catch (error) {
      forDeletion.forEach((d: Decision) => commit(addMutation, d));
      throw error;
    }

    return;
  }

  // add the decision
  commit(addMutation, payload);
  try {
    await firestore.collection(collection).add(payload);
  } catch (error) {
    commit(removeMutation, payload);
    throw error;
  }
};

const actions: ActionTree<RootState, RootState> = {
  toggleFavorite($store, payload: Decision) {
    return toggleDecision(
      $store,
      "favorited",
      "removeFavorite",
      "addFavorite",
      payload
    );
  },

  toggleTrashed($store, payload: Decision) {
    return toggleDecision($store, "trashed", "restore", "addToTrash", payload);
  },

  loadTrashed($store) {
    return loadDecisions($store, "trashed", "setTrashed");
  },

  loadFavorited($store) {
    return loadDecisions($store, "favorited", "setFavorited");
  }
};

export default actions;
