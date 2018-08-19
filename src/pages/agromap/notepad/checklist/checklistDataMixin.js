import {EventBus} from "services/EventBus"

export default {
  data() {
    return {

    }
  },
  created() {
    EventBus.$on("checklistChanged", () => {
      this.refresh()
    });
    EventBus.$on("checklistDialogsClose", () => {
      this.hideDialogs()
    });
  },
  methods: {
    editCheckList(id){
      this.selectedItem = {}
      let check = this.arrayCheckList.find(f => f.id == id)
      if (check) {
        this.selectedItem = check
        this.dialogvisibleEdit = true
      }
    },
    hideDialogs() {
      this.dialogvisibleEdit = false
      this.dialogvisibleDelete = false
    },
    getNameFromId(id, array){
      if (Array.isArray(array)){
        if (array.length > 0){
          let out =  array.find(x => x.id === id)
          if (out){
            return out.name
          }
        }
      }
      return "нет данных"
    },
    getNameFromBoolean(bool){
      let out = "нет"
      if (bool){
        out = "да"
      }
      return out
    },
  }
}
