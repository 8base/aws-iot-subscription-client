import { IConnectOptionsResolver } from "../../interfaces";
import { CognitoUserPool, CognitoUser, CognitoUserAttribute, AuthenticationDetails } from 'amazon-cognito-identity-js';
import * as AWS from "aws-sdk";
import { MqttConnectOptions } from "../../types";

/*
    example resolve iot credentials
*/

export class CognitoConnectionResolver implements IConnectOptionsResolver {

    private region = "";
    private userPoolId = "";
    private identityPoolId = "";
    private endpoint = "";
    private token = "";

    async resolve(): Promise<MqttConnectOptions> {
       return new Promise<MqttConnectOptions>((resolve, reject) => {

            const providerKey = `cognito-idp.${this.region}.amazonaws.com/${this.userPoolId}`;

            AWS.config.region = this.region;
            AWS.config.credentials = new AWS.CognitoIdentityCredentials({
                IdentityPoolId: this.identityPoolId,
                Logins: {
                    [providerKey]: this.token
                }
            });

            (<AWS.Credentials>AWS.config.credentials).get((error: Error) => {

                if (error) {
                    return reject(error);
                }

                const credentials = <AWS.Credentials>AWS.config.credentials;
                resolve({
                    secretKey: credentials.secretAccessKey,
                    refreshToken: credentials.sessionToken,
                    accessKeyId: credentials.accessKeyId,
                    region: this.region,
                    iotEndpoint: this.endpoint
                });
            });
        });
    }

}
