<script setup lang="ts">
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import {
  faWindows,
  faApple,
  faLinux,
} from "@fortawesome/free-brands-svg-icons";
import { faQuestionCircle } from "@fortawesome/free-solid-svg-icons";

import { ref, onMounted } from "vue";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";

const props = defineProps<{ manualOS?: string; version?: string }>();

const osDetails = ref<{
  name: string;
  platform: string;
  icon: IconDefinition;
}>({
  name: "Unknown OS",
  platform: "unknown",
  icon: faQuestionCircle,
});
const downloadUrl = ref("");
const downloadVersion = ref("");

async function validateVersionParam() {
  try {
    const response = await fetch(
      "https://api.github.com/repos/Fchat-Horizon/Horizon/releases/tags/" +
        props.version,
    );
    const data = await response.json();
    downloadVersion.value = data.tag_name;
  } catch (error) {
    console.error("Error fetching the specified release:", error);
    downloadVersion.value = undefined;
  }
}

onMounted(async () => {
  //await fetchLatestRelease();
  await validateVersionParam();

  const userAgent = navigator.userAgent.toLowerCase();

  if (userAgent.indexOf("win") !== -1) {
    osDetails.value.name = "Windows";
    osDetails.value.platform = "win";
    osDetails.value.icon = faWindows; // Use the imported icon object
  } else if (userAgent.indexOf("mac") !== -1) {
    osDetails.value.name = "Mac OS";
    osDetails.value.platform = "mac"; // Correct platform
    osDetails.value.icon = faApple; // Use the imported icon object
  } else if (userAgent.indexOf("linux") !== -1) {
    osDetails.value.name = "Linux";
    osDetails.value.platform = "linux";
    osDetails.value.icon = faLinux; // Use the imported icon object
  }

  let fileExtension = "";
  if (osDetails.value.platform === "win") {
    fileExtension = "exe";
  } else if (osDetails.value.platform === "mac") {
    fileExtension = "dmg";
  } else if (osDetails.value.platform === "linux") {
    fileExtension = "AppImage";
  } else {
    // Fallback file extension
    fileExtension = "exe";
  }

  let arch = "x64";

  if (osDetails.value.name === "Mac OS") {
    arch = "universal";
  } else {
    arch = osDetails.value.platform === "linux" ? "x86_64" : "x64";
    if (/(arm64|aarch64)/i.test(userAgent)) {
      arch = "arm64";
    }
  }

  //Yes, this is kind of ugly. But these two URLs have a different format.
  downloadUrl.value = downloadVersion.value
    ? `https://github.com/Fchat-Horizon/Horizon/releases/download/${props.version}/F-Chat.Horizon-${osDetails.value.platform}-${arch}.${fileExtension}`
    : `https://github.com/Fchat-Horizon/Horizon/releases/latest/download/F-Chat.Horizon-${osDetails.value.platform}-${arch}.${fileExtension}`;
});
</script>

<template>
  <a :href="downloadUrl" class="button-67">
    <button>
      <FontAwesomeIcon :icon="osDetails.icon" size="lg"></FontAwesomeIcon>
      Download for
      {{ osDetails.name }}
    </button>
  </a>
</template>

<style lang="scss" scoped>
/* From Uiverse.io by Kabak */
button {
  height: 50px;
  margin: 5px;
  width: 300px;
  background: #333;
  -webkit-box-pack: center;
  -ms-flex-pack: center;
  justify-content: center;
  cursor: pointer;
  -webkit-box-align: center;
  -ms-flex-align: center;
  align-items: center;
  font-family:
    Consolas,
    Courier New,
    monospace;
  border: solid #404c5d 1px;
  font-size: 18px;
  color: rgb(161, 161, 161);
  -webkit-transition: 500ms;
  transition: 500ms;
  border-radius: 5px;
  background: linear-gradient(145deg, #2e2d2d, #212121);
  -webkit-box-shadow:
    -1px -5px 15px #41465b,
    5px 5px 15px #41465b,
    inset 5px 5px 10px #212121,
    inset -5px -5px 10px #212121;
  box-shadow:
    -1px -5px 15px #41465b,
    5px 5px 15px #41465b,
    inset 5px 5px 10px #212121,
    inset -5px -5px 10px #212121;
}

.dark {
  button {
    background: linear-gradient(145deg, #1c191c, #212121);
    -webkit-box-shadow:
      -1px -5px 15px #61364b,
      5px 5px 15px #61364b,
      inset 5px 5px 10px #292329,
      inset -5px -5px 10px #292329;
    box-shadow:
      -1px -5px 15px #61364b,
      5px 5px 15px #61364b,
      inset 5px 5px 10px #292329,
      inset -5px -5px 10px #292329;
  }
}

button:hover {
  -webkit-box-shadow:
    1px 1px 13px #61364b,
    -1px -1px 13px #907281;
  box-shadow:
    1px 1px 13px #61364b,
    -1px -1px 13px #907281;
  color: #d6d6d6;
  -webkit-transition: 500ms;
  transition: 500ms;
}

button:active {
  -webkit-box-shadow:
    1px 1px 13px #20232e,
    -1px -1px 33px #545b78;
  box-shadow:
    1px 1px 13px #20232e,
    -1px -1px 33px #545b78;
  color: #d6d6d6;
  -webkit-transition: 100ms;
  transition: 100ms;
}
</style>
