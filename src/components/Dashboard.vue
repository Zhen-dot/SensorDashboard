<template>
  <div id="dashboard" ref="container">
  </div>
</template>

<script>
import {db} from "@/firebase";
import Device from "@/components/Device";
import Vue from "vue";

export default {
  name: "Dashboard",

  data() {
    return {
      devices: []
    }
  },

  methods: {},

  computed: {},

  props: {
    msg: String
  },

  mounted() {
    const DeviceClass = Vue.extend(Device);

    (async () => {
      await db.get().then(docs => {
        docs.forEach(doc => {
          this.devices.push(new DeviceClass({
            propsData: {
              d_name: doc.id
            }
          }));
        })
      });

      this.devices.forEach(device => {
        device.$mount();
        this.$refs.container.appendChild(device.$el);
        device.init();
      });

      const modals = this.devices.map(d => d.modal);

      window.onclick = (ev) => {
        const i = modals.indexOf(ev.target);
        if (i !== -1) {
          modals[i].style.display = "none";
        }
      }
    })();


  }
}
</script>

<style scoped>
h3 {
  margin: 40px 0 0;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  display: inline-block;
  margin: 0 10px;
}

a {
  color: #42b983;
}
</style>
