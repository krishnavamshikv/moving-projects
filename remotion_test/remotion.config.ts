// See all configuration options: https://remotion.dev/docs/config
// Each option also is available as a CLI flag: https://remotion.dev/docs/cli

// Note: When using the Node.JS APIs, the config file doesn't apply. Instead, pass options directly to the APIs

import { Config } from "@remotion/cli/config";
import { enableTailwind } from '@remotion/tailwind-v4';

Config.setRspack(true);
Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
Config.overrideBundlerConfig(enableTailwind);

// Enable hardware Vulkan GPU acceleration for Chromium rasterization on Linux / NVIDIA
Config.setChromiumOpenGlRenderer("vulkan");
Config.setChromiumMultiProcessOnLinux(true);
Config.setConcurrency(10);

// Enable NVIDIA NVENC GPU hardware encoding
Config.setHardwareAcceleration("required");
Config.setVideoBitrate("25M");


