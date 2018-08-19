<template lang="pug">
.fx-table.fx-small.track-image
  img(:src="image")
  el-table(
    v-if="assignments",
    :data="assignments",
    border,
    resizable
  )
    el-table-column(prop="assignemtId", label="#", width="90")
    el-table-column(label="Цвет", width="50")
      template(slot-scope="scope")
        div(:style="{backgroundColor: scope.row.color, height: '5px'}")
    el-table-column(prop="startDate", label="Старт", width="90")
    el-table-column(prop="endDate", label="Завершение", width="90")
    el-table-column(prop="processedSquare", label="Площадь", width="90")
    el-table-column(prop="percentage", label="%", width="90")
    el-table-column(prop="employeeName", label="Водитель")
    el-table-column(prop="carName", label="Машина")
    el-table-column(prop="instrumentName", label="Орудие")
</template>

<script>
export default {
  props: {
    "image": {
      type: String,
      default: "",
    },
    "assignments": {
      type: Array,
      default: [],
    },
  },
}

</script>
