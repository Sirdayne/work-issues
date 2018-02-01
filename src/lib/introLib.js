import intro from 'intro.js';
import 'intro.js/introjs.css';

let introHelp = intro.introJs();

//intro.introJs().start();
//setting options for intro.js
  introHelp.setOption("nextLabel", " Вперед &rarr;");
  introHelp.setOption("prevLabel", " &larr; Назад ");
  introHelp.setOption("skipLabel", " Закрыть ");
  introHelp.setOption("doneLabel", " Закрыть ");
//introHelp.start();
export default {
  begin(steps) {
    introHelp.setOptions({
      steps: steps
    });
    introHelp.start();
  }
}
