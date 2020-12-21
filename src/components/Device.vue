<template>
  <div :id="dname">
    <div style="clear: both"></div>
<!--    Modal     -->
    <div :id="dname + '/modal'" class="modal">
      <div class="modal-content">
        <div class="modal-header">
          <span class="close" @click="closeModal">&times;</span>
          <h2>{{ dname }}'s Modal</h2>
        </div>
        <div class="modal-body">
          <canvas :id="dname + '/dtg'" class="details_canvas"></canvas>
          <p>{{ dname }}'s details</p>
        </div>
      </div>
    </div>
<!--    Table     -->
    <div class="row">
      <table style="float: left">
        <tr>
          <th colspan="3">{{ dname }}</th>
        </tr>
        <tr>
          <td>Last updated</td>
          <td>{{ last_update }}</td>
          <td rowspan="4">
            <canvas :id="dname + '/rtg'" class="realtime_canvas"></canvas>
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
            <button :id="dname + '/detailsBtn'" @click="openModal">details</button>
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
  props: ['dname'],
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
      console.log(this.dname);
      const rt_ctx = document.getElementById(`${this.dname}/rtg`).getContext("2d");
      const dt_ctx = document.getElementById(`${this.dname}/dtg`).getContext("2d");

      this.modal = document.getElementById(`${this.dname}/modal`);

      (async () => {
        const doc = await db.doc(this.dname).get();
        this.rtgraph = initChart(rt_ctx, "Live updates", [doc.data()], 10);
        this.dtgraph = initChart(dt_ctx, "Last 10 updates", [doc.data()], 1);

        db.doc(this.dname).onSnapshot(snapshot => {
          const data = snapshot.data();
          this.update(getTime(data.time), data.temperature.toFixed(2), data.humidity.toFixed(2));
        });
      })();
    },

    update(time, temperature, humidity) {
      this.last_update = time;
      this.temperature = temperature;
      this.humidity = humidity;

      const chart = this.rtgraph;
      if (chart.data.labels.length >= 10) {
        chart.data.labels.pop();
        chart.data.datasets.forEach((dataset) => {
          dataset.data.pop();
        });
      }

      chart.data.labels.unshift(time);
      chart.data.datasets[0].data.unshift(temperature);
      chart.data.datasets[1].data.unshift(humidity);
      chart.update();
    },

    openModal() {
      this.modal.style.display = "block";

      const lim = 50;
      const xhr = new XMLHttpRequest();
      xhr.open("GET", `http://localhost:4000/reading/${this.dname}/${lim}`);
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
          chart.options.title.text = `Last ${lim} updates from ${getTime(q_data[0].time)} to ${getTime(q_data[q_data.length - 1].time)}`
          chart.update();
        }
      }
    },

    closeModal() {
      this.modal.style.display = "none";
    }
  }
}
</script>

<style scoped>

</style>
