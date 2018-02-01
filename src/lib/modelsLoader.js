module.exports = function(source) {
  this.cacheable()
  source =
 `import standartizeModel from 'lib/standartizeModel'
  module.exports = standartizeModel(${source})`
  return source
}
