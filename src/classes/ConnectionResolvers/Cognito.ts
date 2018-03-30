import { IConnectOptionsResolver } from "../../interfaces";
import { CognitoUserPool, CognitoUser, CognitoUserAttribute, AuthenticationDetails } from 'amazon-cognito-identity-js';
import * as AWS from "aws-sdk";
import { CognitoConnectionOptions } from "../../types";


export class CognitoConnectionResolver implements IConnectOptionsResolver {

    private options: CognitoConnectionOptions;

    constructor(options: CognitoConnectionOptions) {
        this.options = options;
    }

    async resolve(): Promise<AWS.Credentials> {

       return new Promise<AWS.Credentials>((resolve, reject) => {



            const providerKey = `cognito-idp.${this.options.region}.amazonaws.com/${this.options.userPoolId}`;

            AWS.config.region = this.options.region;
            AWS.config.credentials = new AWS.CognitoIdentityCredentials({
                IdentityPoolId: this.options.identityPoolId,
                Logins: {
                    [providerKey]: token
                }
            });

            (<AWS.Credentials>AWS.config.credentials).get((error: Error) => {

                if (error) {
                    return reject(error);
                }

                resolve(<AWS.Credentials>AWS.config.credentials);
            });
        });
    }

}
