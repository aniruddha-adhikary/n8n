import { INodeProperties } from 'n8n-workflow';

export const createTransactionOptions: INodeProperties[] = [
	{
		displayName: 'Amount',
		name: 'amount',
		type: 'number',
		default: 0,
		required: true,
		description: 'The Transaction Amount (in Milliunits Format)',
		displayOptions: {
			show: {
				resource: [
					'transactions',
				],
				operation: [
					'create',
				],
			},
		},
	},
	{
		displayName: 'Date',
		name: 'date',
		type: 'dateTime',
		default: null,
		required: true,
		description: 'The Transaction Date',
		displayOptions: {
			show: {
				resource: [
					'transactions',
				],
				operation: [
					'create',
				],
			},
		},
	},
];
