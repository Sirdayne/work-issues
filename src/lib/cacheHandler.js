import localforage from "localforage"

export default {
  findAndRemove(keyToSearch) {
    keyToSearch = keyToSearch.split("?")[0].toLowerCase()
    localforage.iterate((value, key, iterationNumber) => {
      if (key.indexOf("data/") === 0) {
        let suffix = key.split("data/")[1]
        if (suffix.indexOf(keyToSearch) === 0) this.remove(key)
      } else if (key.indexOf("api/") != -1){
        let suffix = key.split("api/")[1]
        if (suffix.indexOf(keyToSearch) === 0) this.remove(key)
      }
    }).then(() => {
    }).catch((err) => {
    });
  },
  remove(key) {
    localforage.removeItem(key).then(() => {
    }).catch((err) => {
    });
  }
}
