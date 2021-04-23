<!--商家销量统计的横向柱状图-->
<template>
  <div class="com-container">
    <div class="com-chart" ref="seller_ref"></div>
  </div>
</template>

<script>
export default {
  name: "Seller",
  data() {
    return {
      chartInstance: null, // echarts实例对象
      allData: null, // 服务器返回的数据
      currentPage: 1, // 当前显示的页码
      totalPage: 0, // 总页码
      timerId: null, // 定时器的标识
    };
  },
  mounted() {
    this.initChart();
    this.getData();
    window.addEventListener("resize", this.screenAdapter);
    // 在屏幕加载完成的时候，主动进行屏幕的适配
    this.screenAdapter();
  },
  destroyed() {
    clearInterval(this.timerId);
    // 在页面销毁的时候，需要将监听器取消掉
    window.removeEventListener("resize", this.screenAdapter);
  },
  methods: {
    initChart() {
      this.chartInstance = this.$echarts.init(this.$refs.seller_ref, "chalk");
      // 对图表对象进行初始化配置的控制
      const initOption = {
        title: {
          text: "▎商家销售统计",
          textStyle: {
            fontSize: 66,
          },
          left: 20,
          top: 20,
        },
        grid: {
          top: "20%",
          left: "3%",
          right: "6%",
          bottom: "3%",
          containLabel: true, // 上述距离设置包含坐标轴上的文字
        },
        xAxis: {
          type: "value",
        },
        yAxis: {
          type: "category",
        },
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "line",
            z: 0, // 设置背景的层级
            lineStyle: {
              width: 66,
              color: "#2D3443",
            },
          },
        },
        series: {
          type: "bar",
          barWidth: 66,
          label: {
            show: true,
            position: "right",
            textStyle: {
              color: "white",
            },
          },
          itemStyle: {
            barBorderRadius: [0, 33, 33, 0],
            // 指明颜色渐变的方向
            // 指明不同百分比下的颜色值
            color: new this.$echarts.graphic.LinearGradient(0, 0, 1, 0, [
              // 百分之0状态下的颜色值
              {
                offset: 0,
                color: "#5052EE",
              },
              {
                offset: 1,
                color: "#AB6EE5",
              },
            ]),
          },
        },
      };
      this.chartInstance.setOption(initOption);
      // 对图表对象进行鼠标事件的监听
      this.chartInstance.on("mouseover", () => {
        clearInterval(this.timerId);
      });
      this.chartInstance.on("mouseout", () => {
        this.startInterval();
      });
    },
    // 获取服务器的数据
    async getData() {
      const { data: res } = await this.$http.get("seller");
      console.log(res);
      this.allData = res;
      this.allData.sort((a, b) => {
        return a.value - b.value; // 从小到大进行排序
      });
      this.totalPage =
        this.allData.length % 5 === 0
          ? this.allData.length / 5
          : this.allData.length / 5 + 1;
      this.updateChart();
      // 启动定时器
      this.startInterval();
    },
    // 更新图标
    updateChart() {
      const start = (this.currentPage - 1) * 5;
      const end = this.currentPage * 5;
      const showData = this.allData.slice(start, end);
      const sellerNames = showData.map((item) => {
        return item.name;
      });
      const sellerValues = showData.map((item) => {
        return item.value;
      });
      const dataOption = {
        yAxis: {
          data: sellerNames,
        },
        series: [{ data: sellerValues }],
      };
      this.chartInstance.setOption(dataOption);
    },
    startInterval() {
      if (this.timerId) {
        clearInterval(this.timerId);
      }
      this.timerId = setInterval(() => {
        this.currentPage++;
        if (this.currentPage > this.totalPage) {
          this.currentPage = 1;
        }
        this.updateChart();
      }, 3000);
    },
    // 当浏览器大小发生变化时，调用该方法，完成屏幕的适配
    screenAdapter() {
      const titleFontSize = (this.$refs.seller_ref.offsetWidth / 100) * 3.6;
      const adapterOption = {
        // 对图表对象进行初始化配置的控制
        title: {
          textStyle: {
            fontSize: titleFontSize,
          },
        },
        tooltip: {
          axisPointer: {
            lineStyle: {
              width: titleFontSize,
            },
          },
        },
        series: {
          barWidth: titleFontSize,
          itemStyle: {
            barBorderRadius: [0, titleFontSize / 2, titleFontSize / 2, 0],
          },
        },
      };
      this.chartInstance.setOption(adapterOption);
      this.chartInstance.resize();
    },
  },
};
</script>

<style lang='less' scoped>
</style>