import localforage from "localforage"
import {EventBus} from "services/EventBus";

export default {
  getLocalForage(DB, input, id){
    let DBfromStart = DB;
    if(id)
      DB = DB + id
    localforage.getItem(DB).then(value => {

      if (!value){
        value = input;
        localforage.setItem(DB, value);

      }

      let model = {value: value, db: DBfromStart}
      EventBus.$emit("gotFromLocalForage", model);
    }).catch(function(err) {

    });
  }
}