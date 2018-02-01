export default {
  createGraph(rendered, products, _elSliderNumber, elSliderPartClasses ) {
    if ((products.length) && (rendered)) {
      //add graphs to first elSLider
      //let elSliderPartClasses = ['clear', 'red', 'green', 'yellow', 'pur'];
      let elSliderPartWidths = ['0%', '25%', '25%', '25%', '25%'];
      let elSliderRunway = document.getElementsByClassName('el-slider__runway');
      let elSliderInner = document.createElement('div');
      elSliderInner.className = 'el-slider-inner';

      for (var i = 0; i < products.length; i++) {
        let elSliderRow = document.createElement('div');
        elSliderRow.className = 'el-slider-row';
        for (var j = 0; j < elSliderPartClasses.length; j++) {
          let elSliderPart = document.createElement('div');

          elSliderPart.className = '';
          elSliderPart.classList.add('el-slider-part', elSliderPartClasses[j]);
          elSliderPart.style.width = elSliderPartWidths[j];

          elSliderRow.appendChild(elSliderPart);
        }
        elSliderInner.appendChild(elSliderRow);
      }
      elSliderRunway[_elSliderNumber].appendChild(elSliderInner);
      rendered = false;
    }
  }
}
