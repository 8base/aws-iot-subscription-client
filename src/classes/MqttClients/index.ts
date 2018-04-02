import { IotMqttClient } from "./IotMqttClient";
import { IMqttClient } from "../../interfaces";

export const MqttClient = (debug: boolean): IMqttClient => {
  return new IotMqttClient(debug);
};