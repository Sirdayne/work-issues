import injector from 'vue-inject';
import FormFieldsList from './_FormFieldsList';

class FormFields {
  get(fieldsForRendering = []) {
    let result = [];
    let found = [];
    for (let i in fieldsForRendering) {
      if (fieldsForRendering.hasOwnProperty(i)) {
        for (let j in FormFieldsList) {
          if (FormFieldsList.hasOwnProperty(j)) {
            if (FormFieldsList[j].name === fieldsForRendering[i]) {
              found.push(FormFieldsList[j].name);
              result.push(require(`${FormFieldsList[j].path}`));
            }
          }
        }
      }
    }

    if (!process.env.PROD) {
      for (let i in fieldsForRendering) {
        if (!found.includes(fieldsForRendering[i])) {
        }
      }
    }

    return result;
  }
}
injector.service('FormFields', FormFields);
