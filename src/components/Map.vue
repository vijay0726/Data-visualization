<template>
  <div class="com-container" @dblclick="revertMap">
    <div class="com-chart" ref="map_ref">wdaw</div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import axios from "axios";
import { getProvinceMapInfo } from "../utils/map_utils";
export default {
  name: "",
  data() {
    return {
      chartInstance: null,
      allData: null,
      mapData: [], // 缓存请求到的省份地图矢量数据
    };
  },
  computed: {
    ...mapState(["theme"]),
  },
  watch: {
    theme() {
      console.log("主题切换了");
      this.chartInstance.dispose(); // 销毁当前的图表
      this.initChart(); // 重新以最新的主题名称初始化图表对象
      this.screenAdapter(); // 完成屏幕的适配
      this.updateChart(); // 更新图表的展示
    },
  },
  created() {
    // 在组件创建完成后，进行回调函数的注册
    this.$socket.registerCallBack("mapData", this.getData);
  },
  mounted() {
    this.initChart();
    // this.getData();
    this.$socket.send({
      action: "getData",
      socketType: "mapData",
      chartName: "map",
      value: "",
    });
    window.addEventListener("resize", this.screenAdapter);
    this.screenAdapter();
  },
  destroyed() {
    window.removeEventListener("resize", this.screenAdapter);
    this.$socket.unRegisterCallBack("mapData");
  },
  methods: {
    async initChart() {
      this.chartInstance = this.$echarts.init(this.$refs.map_ref, this.theme);
      // 获取中国地图的矢量数据
      // http://localhost:8999/static/map/china.json
      const res = await axios.get(
        "http://localhost:8999/static/map/china.json"
      );
      // console.log(res);
      this.$echarts.registerMap("china", res.data);
      const initOption = {
        title: {
          text: "▎商家分布",
          left: 20,
          top: 20,
        },
        geo: {
          type: "map",
          map: "china",
          top: "5%",
          bottom: "5%",
          itemStyle: {
            areaColor: "#2e72bf",
            borderColor: "#333",
          },
        },
        legend: {
          left: "5%",
          bottom: "5%",
          orient: "vertical",
        },
      };
      this.chartInstance.setOption(initOption);
      this.chartInstance.on("click", async (arg) => {
        // console.log(arg);
        const provinceInfo = getProvinceMapInfo(arg.name);
        console.log(provinceInfo);
        if (!this.mapData[provinceInfo.key]) {
          const res = await axios.get(
            "http://localhost:8999" + provinceInfo.path
          );
          this.mapData[provinceInfo.key] = res.data;
          this.$echarts.registerMap(
            provinceInfo.key,
            this.mapData[provinceInfo.key]
          );
        }

        const changeOption = {
          geo: {
            map: provinceInfo.key,
          },
        };
        this.chartInstance.setOption(changeOption);
      });
    },
    async getData(ret) {
      // const { data: res } = await this.$http.get("map");
      this.allData = ret;
      // console.log(this.allData);
      this.updateChart();
    },
    updateChart() {
      // 处理图表需要的数据
      // 图例的数据
      const legendArr = this.allData.map((item) => {
        return item.name;
      });
      const seriesArr = this.allData.map((item) => {
        // return 的这个值就代表一个类别下的所有散点数据
        // 如果想在地图中显示散点的数据，所以我们需要给散点的图表增加一个配置，coodinateSystem:geo
        return {
          type: "effectScatter",
          rippleEffect: {
            scale: 5,
            brushType: "stroke",
          },
          name: item.name,
          data: item.children,
          coordinateSystem: "geo",
        };
      });
      const dataOption = {
        legend: { data: legendArr },
        series: seriesArr,
      };
      this.chartInstance.setOption(dataOption);
    },
    screenAdapter() {
      const titleFontSize = (this.$refs.map_ref.offsetWidth / 100) * 3.6;

      const adapterOption = {
        title: {
          textStyle: {
            fontSize: titleFontSize,
          },
        },
        legend: {
          itemWidth: titleFontSize / 2,
          itemHeight: titleFontSize / 2,
          itemGap: titleFontSize / 2,
          textStyle: {
            fontSize: titleFontSize / 2,
          },
        },
      };
      this.chartInstance.setOption(adapterOption);
      this.chartInstance.resize();
    },
    revertMap() {
      const revertOption = {
        geo: {
          map: "china",
        },
      };
      this.chartInstance.setOption(revertOption);
    },
  },
};
</script>

<style scoped>
</style>