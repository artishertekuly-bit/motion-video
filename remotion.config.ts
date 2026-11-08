/**
 * Note: When using the Node.JS APIs, the config file
 * doesn't apply. Instead, pass options directly to the APIs.
 *
 * All configuration options: https://remotion.dev/docs/config
 */

import { Config } from "@remotion/cli/config";

Config.setRspack(true);
Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
Config.setDefaultPremountInSeconds(2);
// 3D (three.js): рендер через ANGLE — стабильная WebGL-графика на Windows
Config.setChromiumOpenGlRenderer("angle");
// Тяжёлая 3D-сцена (BridgeTest, скилл cartoon-3d-short) в облаке рисуется без видеокарты (swangle): один кадр может
// идти дольше стандартных 30 с, поэтому ждём до 4 минут, прежде чем считать кадр зависшим.
Config.setDelayRenderTimeoutInMilliseconds(240000);
