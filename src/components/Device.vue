<template>
  <div :id="d_name">
    <div style="clear: both"></div>
    <!--    Modal     -->
    <div :id="d_name + '/modal'" class="modal">
      <div class="modal-content">
        <div class="modal-header">
          <span class="close" @click="closeModal">&times;</span>
          <h2>{{ d_name }}</h2>
        </div>
        <div class="modal-body">
          <canvas :id="d_name + '/dtg'" class="details_canvas"></canvas>
          <label>
            Options
            <select :id="d_name + '/options'" @change="updateDtG">
              <option value="50u">Last 50 Updates</option>
              <option value="5m">Last 5 Minutes</option>
              <option value="15m">Last 15 Minutes</option>
              <option value="1h">Last Hour</option>
              <option value="6h">Last 6 Hours</option>
              <option value="1d">Last Day</option>
            </select>
          </label>
        </div>
      </div>
    </div>
    <!--    Table     -->
    <div class="row">
      <table style="float: left">
        <tr>
          <th colspan="3">{{ d_name }}</th>
        </tr>
        <tr>
          <td>Last updated</td>
          <td>{{ last_update }}</td>
          <td rowspan="4">
            <canvas :id="d_name + '/rtg'" class="realtime_canvas"></canvas>
          </td>
        </tr>
        <tr>
          <td>Temperature</td>
          <td>{{ temperature }}</td>
        </tr>
        <tr>
          <td>Humidity</td>
          <td>{{ humidity }}</td>
        </tr>
        <tr>
          <td colspan="2" style="vertical-align: top">
            <button @click="openModal" class="button">details</button>
          </td>
        </tr>
      </table>
    </div>
  </div>
</template>

<script>
import {db} from "@/firebase";
import {getTime, initChart} from "./functions";

export default {
  name: "Device",
  props: ['d_name'],
  data() {
    return {
      last_update: "-",
      temperature: "-",
      humidity: "-",
      modal: null
    }
  },
  methods: {
    init() {
      // Modal reference
      this.modal = document.getElementById(`${this.d_name}/modal`);

      (async () => {
        const doc = await db.doc(this.d_name).get();

        // Init charts
        this.rtgraph = initChart(document.getElementById(`${this.d_name}/rtg`).getContext("2d"), "Live updates", [doc.data()], 10);
        this.dtgraph = initChart(document.getElementById(`${this.d_name}/dtg`).getContext("2d"), "Last 1 updates", [doc.data()], 1);
      })();
    },

    updateRtG(time, temperature, humidity) {
      // Update realtime labels
      this.last_update = time;
      this.temperature = temperature;
      this.humidity = humidity;

      const chart = this.rtgraph;
      // Delete old chart data. Doesnt delete if not yet at limit
      if (chart.data.labels.length >= 10) {
        chart.data.labels.pop();
        chart.data.datasets.forEach((dataset) => {
          dataset.data.pop();
        });
      }

      // Adds new chart data and update
      chart.data.labels.unshift(time);
      chart.data.datasets[0].data.unshift(temperature);
      chart.data.datasets[1].data.unshift(humidity);
      chart.update();
    },

    updateDtG() {
      const xhr = new XMLHttpRequest();
      let url;
      switch (document.getElementById(`${this.d_name}/options`).value) {
        case "50u":
          url = `u/${this.d_name}/50`;
          break;
        case "5m":
          url = `time/${this.d_name}/5m/15s`;
          break;
        case "15m":
          url = `time/${this.d_name}/15m/30s`;
          break;
        case "1h":
          url = `time/${this.d_name}/1h/3m`;
          break;
        case "6h":
          url = `time/${this.d_name}/6h/15m`;
          break;
        case "1d":
          url = `time/${this.d_name}/1d/1h`;
          break;
      }

      xhr.open("GET", `http://localhost:4000/readings/${url}`);
      xhr.send();
      xhr.onreadystatechange = () => {
        if (xhr.readyState === 4 && xhr.status === 200) {
          const chart = this.dtgraph;
          const q_data = JSON.parse(xhr.responseText);
          console.log(q_data);
          chart.data.labels = q_data.map(o => getTime(o.time));
          chart.data.datasets[0].data = q_data.map(o => o.temperature.toFixed(2));
          chart.data.datasets[1].data = q_data.map(o => o.humidity.toFixed(2));

          // Update title & refresh
          chart.options.title.text = `Updates from ${getTime(q_data[0].time)} to ${getTime(q_data[q_data.length - 1].time)}`
          chart.update();
        }
      }
    },

    openModal() {
      this.updateDtG();
      this.modal.classList.add('show');
    },

    closeModal() {
      this.modal.classList.remove('show');
    },
  }
}
</script>
