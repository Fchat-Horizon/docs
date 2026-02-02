<script setup lang="ts">
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import {
  faWindows,
  faApple,
  faLinux,
} from "@fortawesome/free-brands-svg-icons";
import { faQuestionCircle } from "@fortawesome/free-solid-svg-icons";

import { computed, ref, onMounted } from "vue";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";

const props = defineProps<{
  platform?: string;
  arch?: string;
  version?: string | null;
}>();

const osDetails = computed(() => {
  switch (props.platform) {
    case "win":
      return { name: "Windows", platform: "win", icon: faWindows };
    case "mac":
      return { name: "Mac OS", platform: "mac", icon: faApple };
    case "linux":
      return { name: "Linux", platform: "linux", icon: faLinux };
    default:
      return {
        name: "Unknown OS",
        platform: "unknown",
        icon: faQuestionCircle,
      };
  }
});

const downloadVersion = ref<string | undefined>(undefined);

async function validateVersionParam() {
  if (!props.version) {
    downloadVersion.value = undefined;
    return;
  }

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
  await validateVersionParam();
});

const resolvedArch = computed(() => {
  if (props.arch) {
    return props.arch;
  }

  if (osDetails.value.platform === "mac") {
    return "universal";
  }

  if (osDetails.value.platform === "linux") {
    return "x86_64";
  }

  return "x64";
});

const fileExtension = computed(() => {
  if (osDetails.value.platform === "win") {
    return "exe";
  }

  if (osDetails.value.platform === "mac") {
    return "dmg";
  }

  if (osDetails.value.platform === "linux") {
    return "AppImage";
  }

  return "exe";
});

const downloadUrl = computed(() =>
  downloadVersion.value
    ? `https://github.com/Fchat-Horizon/Horizon/releases/download/${props.version}/F-Chat.Horizon-${osDetails.value.platform}-${resolvedArch.value}.${fileExtension.value}`
    : `https://github.com/Fchat-Horizon/Horizon/releases/latest/download/F-Chat.Horizon-${osDetails.value.platform}-${resolvedArch.value}.${fileExtension.value}`,
);

const buttonLabel = computed(() => {
  if (osDetails.value.platform === "linux") {
    return "Download AppImage";
  }

  return `Download for ${osDetails.value.name}`;
});
</script>

<template>
  <a :href="downloadUrl" class="button-67">
    <button>
      <FontAwesomeIcon :icon="osDetails.icon" size="lg"></FontAwesomeIcon>
      {{ buttonLabel }}
    </button>
  </a>
</template>

<style lang="scss" scoped>
/* From Uiverse.io by Kabak */
.button-67 {
  display: flex;
  justify-content: center;
  text-decoration: none;
}

button {
  height: auto;
  margin: 5px;
  width: fit-content;
  max-width: 92vw;
  padding: 14px 22px;
  background: #333;
  -webkit-box-pack: center;
  -ms-flex-pack: center;
  justify-content: center;
  cursor: pointer;
  -webkit-box-align: center;
  -ms-flex-align: center;
  align-items: center;
  display: flex;
  gap: 10px;
  font-family:
    Consolas,
    Courier New,
    monospace;
  border: solid #404c5d 1px;
  font-size: 20px;
  line-height: 1.2;
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
