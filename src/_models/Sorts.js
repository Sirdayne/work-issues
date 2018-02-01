{
  path: 'sorts',
  fields: [
    ['name', {
      label: 'Наименование'
    }],
    ['culture.name', {
      label: 'Культура',
    }],
    ['ripeness.name', {
      label: 'Группа спелости'
    }],
    ['minNorm', {
      label: 'Норма высева от',
      type: Number
    }],
    ['maxNorm', {
      label: 'Норма высева до',
      type: Number
    }]
  ],
  relations: {
    ripeness: {
      model: 'RipenessGroups',
      key: 'ripenessGroupId'
    },
    culture: {
      model: 'Cultures',
      key: 'cultureId'
    }
  }
}
