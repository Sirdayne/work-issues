import intro from "intro.js";
import "intro.js/introjs.css";

let introHelp = intro.introJs();

introHelp.setOption("nextLabel", " Вперед &rarr;");
introHelp.setOption("prevLabel", " &larr; Назад ");
introHelp.setOption("skipLabel", " Закрыть ");
introHelp.setOption("doneLabel", " Закрыть ");

export default {
  begin(steps) {
    introHelp.setOptions({
      steps: steps
    });
    introHelp.start();
  }
}
