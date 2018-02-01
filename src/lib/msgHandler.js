import { Message } from 'element-ui';

export default {
  handle(response) {
    let method = this.hasMethod(response);
    if (method) {
      this.handleMessage(method, response)
    }
  },
  hasMethod(response) {
    return response && response.config && response.config.method
  },
  handleMessage(method, response) {
    if (!["delete", "post", "put"].includes(method)) return false
    let msg = "Успешно "
    if (method == "post") msg += "создано!"
    if (method == "put") msg += "сохранено!"
    if (method == "delete") msg += "удалено!"
    this.showMessage(msg)
  },
  showMessage(msg, type) {
    Message({
      message: msg,
      type: "success",
      duration: 5000,
      showClose: false,
    });
  },
}
