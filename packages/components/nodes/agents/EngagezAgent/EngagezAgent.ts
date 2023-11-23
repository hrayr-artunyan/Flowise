import { ICommonObject, INode, INodeData, INodeParams } from '../../../src/Interface'
import { initializeAgentExecutorWithOptions, AgentExecutor, InitializeAgentExecutorOptions } from 'langchain/agents'
import { Tool } from 'langchain/tools'
import { BaseChatMemory } from 'langchain/memory'
import { getBaseClasses, mapChatHistory } from '../../../src/utils'
import { getCredentialData, getCredentialParam } from '../../../src/utils'

import { BaseLanguageModel } from 'langchain/base_language'
import { flatten } from 'lodash'
import { additionalCallbacks } from '../../../src/handler'

const DEFAULT_PREFIX = `Assistant is a large language model trained by OpenAI.

Assistant is designed to be able to assist with a wide range of tasks, from answering simple questions to providing in-depth explanations and discussions on a wide range of topics. As a language model, Assistant is able to generate human-like text based on the input it receives, allowing it to engage in natural-sounding conversations and provide responses that are coherent and relevant to the topic at hand.

Assistant is constantly learning and improving, and its capabilities are constantly evolving. It is able to process and understand large amounts of text, and can use this knowledge to provide accurate and informative responses to a wide range of questions. Additionally, Assistant is able to generate its own text based on the input it receives, allowing it to engage in discussions and provide explanations and descriptions on a wide range of topics.

Overall, Assistant is a powerful system that can help with a wide range of tasks and provide valuable insights and information on a wide range of topics. Whether you need help with a specific question or just want to have a conversation about a particular topic, Assistant is here to assist.`

class EngagezAgent_Agents implements INode {
    label: string
    name: string
    version: number
    description: string
    type: string
    icon: string
    category: string
    baseClasses: string[]
    inputs: INodeParams[]
    credential: INodeParams

    constructor() {
        this.label = 'Engagez Agent'
        this.name = 'engagezAgent'
        this.version = 1.0
        this.type = 'AgentExecutor'
        this.category = 'Agents'
        this.icon = 'agent.svg'
        this.description = 'Engagez agent for a chat model. It will utilize chat specific prompts'
        this.baseClasses = [this.type, ...getBaseClasses(AgentExecutor)]
        this.credential = {
            label: 'Engagez API Credential',
            name: 'credential',
            type: 'credential',
            credentialNames: ['engagezApi']
        }
        this.inputs = [
            {
                label: 'Allowed Tools',
                name: 'tools',
                type: 'Tool',
                list: true
            },
            {
                label: 'Language Model',
                name: 'model',
                type: 'BaseLanguageModel'
            },
            {
                label: 'Memory',
                name: 'memory',
                type: 'BaseChatMemory'
            },
            {
                label: 'System Message',
                name: 'systemMessage',
                type: 'string',
                rows: 4,
                default: DEFAULT_PREFIX,
                optional: true,
                additionalParams: true
            },
            {
                label: 'Venue ID',
                name: 'venueID',
                type: 'number',
                additionalParams: true
            },
            {
                label: 'User ID',
                name: 'userID',
                type: 'number',
                additionalParams: true
            }
        ]
    }

    async init(nodeData: INodeData, _: string, options: ICommonObject): Promise<any> {
        const model = nodeData.inputs?.model as BaseLanguageModel
        let tools = nodeData.inputs?.tools as Tool[]
        tools = flatten(tools)
        const memory = nodeData.inputs?.memory as BaseChatMemory


        const systemMessage = nodeData.inputs?.systemMessage as string
        const venueID = nodeData.inputs?.venueID as number
        const userID = nodeData.inputs?.userID as number
        console.log('INIT user id', userID);
        options.logger.debug('INIT user id debugger', userID);

        const obj: InitializeAgentExecutorOptions = {
            agentType: 'chat-conversational-react-description',
            verbose: process.env.DEBUG === 'true' ? true : false
        }

        const agentArgs: any = {}
        if (systemMessage) {
            agentArgs.systemMessage = systemMessage
        }

        if (Object.keys(agentArgs).length) obj.agentArgs = agentArgs

        const executor = await initializeAgentExecutorWithOptions(tools, model, obj)
        executor.memory = memory
        return executor
    }

    async run(nodeData: INodeData, input: string, options: ICommonObject): Promise<string> {

        const credentialData = await getCredentialData(nodeData.credential ?? '', options)
        const apiKey = getCredentialParam('apiKey', credentialData, nodeData)
        const apiUrl = getCredentialParam('apiUrl', credentialData, nodeData)
        const environment = getCredentialParam('environment', credentialData, nodeData)

        const venueID = nodeData.inputs?.venueID as number
        const userID = nodeData.inputs?.userID as number
        console.log('RUN user id', userID);
        options.logger.debug('RUN user id debugger', userID);

        const executor = nodeData.instance as AgentExecutor
        const memory = nodeData.inputs?.memory as BaseChatMemory
        // console.log('here we are');
        options.logger.info('INFO WORLD');

        options.logger.debug('hello hrayr world');
        const callbacks = await additionalCallbacks(nodeData, options)

        if (options && options.chatHistory) {
            const chatHistoryClassName = memory.chatHistory.constructor.name
            // Only replace when its In-Memory
            if (chatHistoryClassName && chatHistoryClassName === 'ChatMessageHistory') {
                memory.chatHistory = mapChatHistory(options)
                executor.memory = memory
            }
        }

        const result = await executor.call({ input }, [...callbacks])
        return result?.output
    }
}

module.exports = { nodeClass: EngagezAgent_Agents }
