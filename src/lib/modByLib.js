import $ from "jquery"
import moment from "moment"

export default {
  addTooltips( array ) {
    if ( array.length ){
      this.removeElementsByClass("el-table-author")
      let elTableCont = document.querySelector(".el-table-cont")
      let elTableAuthor = document.createElement("div")
      elTableAuthor.className = "el-table-author"
      elTableAuthor.innerHTML = ""
      for (var i = 0; i < array.length; i++){
        let cloned = elTableAuthor.cloneNode(true)
        if (array[i].modifiedByName)
          cloned.innerHTML = cloned.innerHTML + array[i].modifiedByName
        if (array[i].dateModified)
          cloned.innerHTML = cloned.innerHTML + " " + moment(array[i].dateModified, "YYYY-MM-DDTHH:mm:ss").format("HH:mm DD.MM.YYYY")
        if (elTableCont)
          elTableCont.appendChild( cloned )
      }
    }
  },
  removeElementsByClass(className){
    var elements = document.getElementsByClassName(className)
    while(elements.length){
      elements[0].parentNode.removeChild(elements[0])
    }
  }
}
$(document).ready(() => {
  let elBody = $("body")
  let mouseX, mouseY

  elBody.on("click", ".el-table__row", function (event) {
    let notClickedOnArrow = event.target.className != "el-icon el-icon-arrow-right" &&
      event.target.className != "el-table__expand-icon " &&
      event.target.className != "el-table__expand-icon el-table__expand-icon--expanded"
    if (notClickedOnArrow) {
      var indexRow = $(".el-table__row").index(this)
      $(".el-table-author").removeClass("js-active")
      $(".el-table-author").eq(indexRow).addClass("js-active")
    }
  })
  elBody.on("mouseleave", ".el-table__row", () => {
    $(".el-table-author").removeClass("js-active")
  })
  elBody.on("mousemove", ".el-table-cont", function (event) {
    var offset = $(this).offset()
    mouseX = event.pageX- offset.left
    mouseY = event.pageY- offset.top
    $(".el-table-author").css({
      left: mouseX + 10,
      top: mouseY + 10
    })
  })
})
