{
  path: 'cultures',
  fields: [
    ['name', {
      label: 'Наименование'
    }],
    ['shortName', {
      label: 'Короткое наименование'
    }],
    ['type.name', {
      label: 'Тип культуры'
    }],
    ['sowingNormative', {
      label: 'Нормы высева',
      type: Number
    }]
  ],
  relations: {
    type: {
      model: 'CultureTypes',
      key: 'cultureTypeId'
    },
    sorts: {
      model: 'Sorts',
      key: 'id',
      fKey: 'cultureId',
      many: true
    }
  }
}
