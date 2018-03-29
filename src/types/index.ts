export type CognitoConnectionOptions = {
  identityPoolId: string,
  region: string,
  userPoolId: string
};

export type IotMqttConnectionOpertions = {
  region: string,
  iotEndpoint: string,
  debug: boolean
};

export type CloudConnectCredentials = {
  accessKeyId: string;
  secretAccessKey: string;
  sessionToken: string;
};