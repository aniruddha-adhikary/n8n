import { IExecuteFunctions } from 'n8n-core';

import { INodeExecutionData, INodeType, INodeTypeDescription } from 'n8n-workflow';
import { createTransaction, listAccounts, listBudgets, listTransactions } from './GenericFunctions';
import { createTransactionOptions } from './YnabOperations';

export class Ynab implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'YNAB',
		name: 'ynab',
		icon: 'file:ynab.svg',
		group: ['transform'],
		version: 1,
		description: 'Consume YNAB API',
		defaults: {
			name: 'YNAB',
			color: '#71C0E5',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'ynabApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Budget Name/ID',
				name: 'budgetId',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'listBudgets',
				},
				default: '',
				required: true,
				description: 'The YNAB Budget to be used.',
			},
			{
				displayName: 'Account Name/ID',
				name: 'accountId',
				type: 'options',
				typeOptions: {
					loadOptionsDependsOn: ['budgetId'],
					loadOptionsMethod: 'listAccounts',
				},
				displayOptions: {
					hide: {
						budgetId: [
							undefined,
						],
					},
				},
				default: '',
				required: true,
				description: 'The YNAB Account to be used.',
			},
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				default: '',
				required: true,
				description: 'The resource to be consumed',
				options: [
					{
						name: 'Transaction',
						value: 'transactions',
					},
				],
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				default: '',
				required: true,
				description: 'The operation to be performed',
				options: [
					{
						name: 'List',
						value: 'list',
					},
					{
						name: 'Create',
						value: 'create',
					},
				],
			},
			...createTransactionOptions,
		],
	};

	methods = {
		loadOptions: {
			listBudgets,
			listAccounts,
		},
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {

		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;

		if (resource === 'transactions') {
			if (operation === 'create') {
				const response = await createTransaction.call(this);
				return [[{
					json: response,
				}]];
			} else if (operation === 'list') {
				const response = await listTransactions.call(this);
				return [response.map(json => ({ json }))];
			}
		}

		return [[]];
	}
}
