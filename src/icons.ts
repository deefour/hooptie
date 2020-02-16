import { library } from "@fortawesome/fontawesome-svg-core";
import {
  faHeart,
  faStar,
  faTimes,
  faTrash
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import Vue from "vue";

library.add(faHeart);
library.add(faTrash);
library.add(faTimes);
library.add(faStar);

Vue.component("font-awesome-icon", FontAwesomeIcon);
