import axios from "axios"
import {setupCache} from "axios-cache-adapter"
import errorHandler from "lib/errorHandler"
import msgHandler from "lib/msgHandler"
import nprogress from "lib/NProgress"
import localforage from "localforage"
import cacheHandler from "lib/cacheHandler"
import Auth from "services/Auth"

const WEATHER_API = "http://api.apixu.com/v1/"
const WEATHER_KEY = "2283b83b99334bb886f84936183101"

const TIMEOUT = 5 * 60 * 1000

var requestsCount = 0

let weatherApi = axios.create({
  baseURL: WEATHER_API,
  timeout: TIMEOUT,
  responseType: "json",
  headers: {
    "Content-Type": "application/json",
  }
})

let api = axios.create({
  baseURL: SERVER_URL + "api/",
  timeout: TIMEOUT,
  responseType: "json",
  headers: {
    "Content-Type": "application/json",
  },
});
api.interceptors.request.use(function (config) {
  if (requestsCount == 0) nprogress.start()
  requestsCount++
  config.headers["Authorization"] = Auth.getToken();
  return config;
}, function (error) {
  requestsCount--
  if (requestsCount == 0) nprogress.done()
  return Promise.reject(error);
});
api.interceptors.response.use(function (response) {
  requestsCount--
  if (requestsCount == 0) nprogress.done()
  msgHandler.handle(response);
  return response;
}, function (error) {
  requestsCount--
  if (requestsCount == 0) nprogress.done()
  errorHandler.handle(error);
  return Promise.reject(error);
});

/* https://github.com/RasCarlito/axios-cache-adapter#options */
const cache = setupCache({
  maxAge: 24 * 60 * 60 * 1000,
  limit: 100,
  store: localforage,
  exclude: {
    filter: null,
    query: false,
    paths: [],
  }
})
let apiCache = axios.create({
  baseURL: SERVER_URL + "api/",
  timeout: TIMEOUT,
  adapter: cache.adapter,
  responseType: "json",
  headers: {
    "Content-Type": "application/json",
  },
});

apiCache.interceptors.request.use(function (config) {
  if (requestsCount == 0) nprogress.start()
  requestsCount++
  config.headers["Authorization"] = Auth.getToken();
  return config;
}, function (error) {
  requestsCount--
  if (requestsCount == 0) nprogress.done()
  return Promise.reject(error);
});
apiCache.interceptors.response.use(function (response) {
  requestsCount--
  if (requestsCount == 0) nprogress.done()
  msgHandler.handle(response);
  return response;
}, function (error) {
  requestsCount--
  if (requestsCount == 0) nprogress.done()
  errorHandler.handle(error);
  return Promise.reject(error);
});

let apiJobs = axios.create({
  baseURL: SERVER_URL + "jobs/",
  timeout: TIMEOUT,
  responseType: "json",
  headers: {
    "Content-Type": "application/json",
  }
});
apiJobs.interceptors.request.use(function (config) {
  if (requestsCount == 0) nprogress.start()
  requestsCount++
  config.headers["Authorization"] = Auth.getToken();
  return config;
}, function (error) {
  requestsCount--
  if (requestsCount == 0) nprogress.done()
  return Promise.reject(error);
});
apiJobs.interceptors.response.use(function (response) {
  requestsCount--
  if (requestsCount == 0) nprogress.done()
  msgHandler.handle(response);
  return response;
}, function (error) {
  requestsCount--
  if (requestsCount == 0) nprogress.done()
  errorHandler.handle(error);
  return Promise.reject(error);
});

export default {
  delete(path, id) {
    let url = id !== undefined ? path + "/" + id : path;
    cacheHandler.findAndRemove(path)
    return api.delete(url);
  },
  download(path, data, filename, config) {
    config.responseType = "blob";
    return api.post(path, data, config)
      .then(function(response) {
        var link = document.createElement("a");
        link.href = window.URL.createObjectURL(new Blob([response.data]));
        link.download = filename;
        link.click();
      })
  },
  downloadPDF(path, data, filename, landscape = true) {
    let config = {};
    let accept = "application/pdf" + ((landscape) ? ".landscape" : "");
    config.headers = {"Accept": accept};
    return this.download(path, data, filename + ".pdf", config);
  },
  downloadXLS(path, data, filename) {
    let config = {};
    config.headers = {"Accept": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"};
    return this.download(path, data, filename + ".xlsx", config);
  },
  downloadFILE(path, filename) {
    let config = {}
    config.responseType = "blob";
    return api.get(path, config).then((response) => {
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
    });
  },
  get(path, id) {
    let url = id !== undefined ? path + "/" + id : path;
    return apiCache.get(url)
      .then(function(response) {
        return response.data;
      })
  },
  getWithoutCache(path, id) {
    let url = id !== undefined ? path + "/" + id : path;
    return api.get(url)
      .then(function(response) {
        return response.data;
      })
  },
  getJobs(path) {
    let url = path;
    return apiJobs.get(url)
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
        lang: "ru"
      }
    })
      .then(function(response) {
        return response.data;
      })
  },
  post(path, data) {
    cacheHandler.findAndRemove(path)
    return api.post(path, data)
      .then(function(response) {
        return response.data;
      })
  },
  all(requests) {
    return axios.all(requests)
      .then(axios.spread(function (...responses) {
        return responses;
      }));
  },
  put(path, data) {
    cacheHandler.findAndRemove(path)
    return api.put(path, data)
      .then(function(response) {
        return response.data;
      })
  },
}
