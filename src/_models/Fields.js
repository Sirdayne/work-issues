{
  path: 'fields',
  contexts: [
    'organization'
  ],
  fields: [
    ['name', {
      label: 'Наименование'
    }],
    ['newName', {
      label: 'Новое наименование',
    }],
    ['kadastr', {
      label: 'Кадастровый номер'
    }],
    ['brigade.name', {
      label: 'Бригада'
    }],
    ['area' ,{
      label: 'Площадь, га',
      type: Number
    }],
    ['distanceToGarage', {
      label: 'Расстояние до склада, км',
      type: Number
    }],
    // ['district.name' ,{
    //   label: 'Сельский округ',
    //   preview: false
    // }],
    ['zone.name', {
      label: 'Зона',
      //preview: false
    }],
    ['bonitetScore', {
      label: 'Балл бонитет',
      type: Number
    }],
    ['geosysId', {
      label: 'Код ДЗЗ',
      preview: false
    }]
  ],
  relations: {
    brigade: {
      model: 'Brigades',
      key: 'brigadeId'
    },
    // district: {
    //   model: 'Districts',
    //   key: 'districtId'
    // },
    zone: {
      model: 'FieldZones',
      key: 'fieldZoneId'
    }
  }
}
