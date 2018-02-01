import { getCookie } from 'lib/utils'
import axios from 'axios'
import errorHandler from 'lib/errorHandler'
import msgHandler from 'lib/msgHandler'
import nprogress from 'lib/NProgress'

const WEATHER_API = 'http://api.apixu.com/v1/'
const WEATHER_KEY = '2283b83b99334bb886f84936183101'

const DARK_API = ' https://api.darksky.net/'
const DARK_KEY = 'dfd21f1d38a686cbb76f6e8a5fbd9db6'

let weatherApi = axios.create({
  baseURL: WEATHER_API,
  timeout: 180000,
  responseType: 'json',
  headers: {
    'Content-Type': 'application/json',
  }
})

let api = axios.create({
  baseURL: process.env.API_URL + 'api/',
  timeout: 180000,
  responseType: 'json',
  headers: {
    'Content-Type': 'application/json',
  }
});
api.interceptors.request.use(function (config) {
  config.headers['Authorization'] = getCookie('authToken');
  return config;
}, function (error) {
  return Promise.reject(error);
});
api.interceptors.response.use(function (response) {
  msgHandler.handle(response);
  return response;
}, function (error) {
  errorHandler.handle(error);
  return Promise.reject(error);
});

let auth = axios.create({
  baseURL: process.env.API_URL + 'token',
  timeout: 90000,
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded'
  }
});
auth.interceptors.request.use(function (config) {
  nprogress.start()
  return config;
}, function (error) {
  nprogress.done()
  return Promise.reject(error);
});
auth.interceptors.response.use(function (response) {
  nprogress.done()
  return response;
}, function (error) {
  nprogress.done()
  errorHandler.handle(error);
  return Promise.reject(error);
});


export default {
  delete(path, id) {
    let url = id !== undefined ? path + '/' + id : path;
    return api.delete(url);
  },
  download(path, data, filename, config) {
    config.responseType = 'blob';
    return api.post(path, data, config)
      .then(function(response) {
        var link = document.createElement('a');
        link.href = window.URL.createObjectURL(new Blob([response.data]));
        link.download = filename;
        link.click();
      })
  },
  downloadPDF(path, data, filename, landscape = true) {
    let config = {};
    let accept = 'application/pdf' + ((landscape) ? '.landscape' : '');
    config.headers = {'Accept': accept};
    return this.download(path, data, filename + ".pdf", config);
  },
  downloadXLS(path, data, filename) {
    let config = {};
    config.headers = {'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'};
    return this.download(path, data, filename + ".xlsx", config);
  },
  get(path, id) {
    let url = id !== undefined ? path + '/' + id : path;
    return api.get(url)
      .then(function(response) {
        return response.data;
      })
  },
  //lat, long
  getWeather(path, coordinates) {
    return weatherApi.get(path, {
      params: {
        key: WEATHER_KEY,
        q: coordinates,
        lang: 'ru'
      }
    })
      .then(function(response) {
        return response.data;
      })
  },
  login(data) {
    return auth.post('', data);
  },
  post(path, data) {
    nprogress.start()
    return api.post(path, data)
      .then(function(response) {
        nprogress.done()
        return response.data;
      })
      .catch(function (error) {
        nprogress.done()
      });
  },
  put(path, data) {
    nprogress.start()
    return api.put(path, data)
      .then(function(response) {
        nprogress.done()
        return response.data;
      })
      .catch(function (error) {
        nprogress.done()
      });
  },
}
