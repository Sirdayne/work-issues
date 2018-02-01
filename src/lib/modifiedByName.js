import $ from 'jquery';

export default {
  addTooltips( array ) {
     if ( array.length ){
        //remove old hints(el-table-author)
        function removeElementsByClass(className){
          var elements = document.getElementsByClassName(className);
          while(elements.length){
            elements[0].parentNode.removeChild(elements[0]);
          }
        }
        removeElementsByClass('el-table-author');
        let elTableCont = document.querySelector('.el-table-cont');
        let elTableRow = document.getElementsByClassName('el-table__row');
        let elTableAuthor = document.createElement('div');
        elTableAuthor.className = 'el-table-author';
        elTableAuthor.innerHTML = 'Добавлено/изменено: ';
        for (var i = 0; i < array.length; i++){
          let cloned = elTableAuthor.cloneNode(true);
          if (array[i].modifiedByName == null)
            cloned.innerHTML = cloned.innerHTML + 'не идентифицирован';
          else
            cloned.innerHTML = cloned.innerHTML + array[i].modifiedByName;
          if (elTableCont)
            elTableCont.appendChild( cloned );
        }
     }
  }
}

$( document ).ready(function() {

  $('body').on('click', '.el-table__row', function () {
    var indexRow = $('.el-table__row').index(this);
    $('.el-table-author').removeClass('js-active');
    $('.el-table-author').eq(indexRow).addClass('js-active');
  });

  $('body').on('mouseleave', '.el-table__row', function () {
    $('.el-table-author').removeClass('js-active');
  });

  var mouseX, mouseY;
  $('body').on('mousemove', '.el-table-cont', function (event) {
    var offset = $(this).offset();
    mouseX = event.pageX- offset.left;
    mouseY = event.pageY- offset.top;
    $('.el-table-author').css({
      left: mouseX + 10,
      top: mouseY + 10
    });
  });

});
