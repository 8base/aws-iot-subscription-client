export type CognitoConnectionOptions = {
  identityPoolId: string,
  region: string,
  userPoolId: string
};

export interface ConnectCredentials {
  accessKeyId: string;
  secretKey: string;
  refreshToken: string;
}

export interface MqttConnectOptions extends ConnectCredentials {
  iotEndpoint: string;
  region: string;
}