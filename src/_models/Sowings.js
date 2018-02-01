{
  path: 'sowings',
  contexts: [
    'organization',
    'budget'
  ],
  fields: [
    ['year', {
      label: 'Год',
      type: Number,
      preview: true
    }],
    ['field.name', {
      label: 'Название поля'
    }],
    ['cultureParameterId'],
    ['budgetId'],
    ['field.newName', {
      label: 'Новое название'
    }],
    ['culture.name', {
      label: 'Культура'
    }],
    ['area', {
      label: 'Площадь посева'
    }],
    ['yield', {
      label: 'Урожайность'
    }],
    ['sort.name', {
      label: 'Сорт'
    }],
    ['reproduction.name', {
      label: 'Репродукция',
    }],
    ['cultureParameter.name', {
      label: 'Конечный продукт'
    }],
    ['sowingNormative', {
      label: 'Норма высева'
    }]
  ],
  relations: {
    field: {
      model: 'Fields',
      key: 'fieldId'
    },
    culture: {
      model: 'Cultures',
      key: 'cultureId'
    },
    sort: {
      model: 'Sorts',
      key: 'cultureSortId'
    },
    reproduction: {
      model: 'Reproductions',
      key: 'reproductionId'
    },
    cultureParameter: {
      model: 'CultureParameters',
      key: 'cultureParameterId'
    }
  }
}
