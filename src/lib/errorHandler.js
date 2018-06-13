import { Message } from 'element-ui';
import { Notification } from 'element-ui';
const isProd = IS_PROD;
const cyrillicPattern = /[\u0400-\u04FF]/;

export default {
  handle(error) {
    let msg = this.isMessage(error);
    if (msg) {
      this.handleMessage(msg, error)
    } else {
      if (error.code == "ECONNABORTED") {
        this.showMessage("Превышен лимит ожидания!")
      }
    }
  },
  isMessage(error) {
    return error.response && error.response.data && error.response.data.message
  },
  handleMessage(msg, error) {
    if (isProd) {
      cyrillicPattern.test(msg) ? this.showMessage(msg) : this.showMessage("Ошибка!")
    } else {
      this.showExtendedMessage(error)
    }
  },
  showMessage(msg) {
    Message({
      message: msg,
      type: 'error',
      duration: 5000,
      showClose: false,
    });
  },
  showExtendedMessage(error) {
    let res = error.response
    let title = res.status + " " + res.statusText
    let msg = res.request.responseURL + "\n" + res.data.message
    Notification({
      title: title,
      message: msg,
      type: 'error',
      duration: 5000,
      showClose: false,
    });
  },
}
