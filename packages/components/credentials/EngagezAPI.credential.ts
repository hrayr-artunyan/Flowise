import { INodeParams, INodeCredential } from '../src/Interface'

class EngagezApi implements INodeCredential {
    label: string
    name: string
    version: number
    description: string
    inputs: INodeParams[]

    constructor() {
        this.label = 'Engagez API Credentials'
        this.name = 'engagezApi'
        this.version = 1.0
        this.inputs = [
            {
                label: 'Engagez Environment',
                default: 'staging',
                name: 'environment',
                type: 'options',
                options: [
                    {
                        label: 'Production',
                        name: 'production',
                    },
                    {
                        label: 'Staging',
                        name: 'staging',
                    },
                    {
                        label: 'Development',
                        name: 'development',
                    }
                ],
            },
            {
                label: 'API Url',
                default: 'https://www.engagez.net/api/v1',
                name: 'apiURL',
                type: 'string'
            },
            {
                label: 'API Key',
                name: 'apiKey',
                type: 'password'
            }
        ]
    }
}

module.exports = { credClass: EngagezApi }
