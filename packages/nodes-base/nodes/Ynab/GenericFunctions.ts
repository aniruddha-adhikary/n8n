import { IExecuteFunctions, IHookFunctions, ILoadOptionsFunctions, IWebhookFunctions } from 'n8n-core';
import { IDataObject, INodePropertyOptions, NodeApiError } from 'n8n-workflow';
import { OptionsWithUri } from 'request';

export interface IYnabSubtransaction extends IDataObject{
	amount: number;
	payee_id: string;
	payee_name: string;
	category_id: string;
	memo: string;
}

export interface IYnabTransaction extends IDataObject {
	account_id: string;
	date: string;
	amount: number;
	payee_id: string;
	payee_name: string;
	category_id: string;
	memo: string;
	cleared: string;
	approved: boolean;
	flag_color: string;
	import_id: string;
	subtransactions: IYnabSubtransaction[];
}

export interface IYnabBudget extends IDataObject {
	id: string;
	name: string;
	last_modified_on: string;
	first_month: string;
	last_month: string;
}

export interface IYnabAccount extends IDataObject{
	id: string;
	name: string;
	type: string;
	on_budget: boolean;
	closed: boolean;
	note: string | null;
	balance: number;
	cleared_balance: number;
	uncleared_balance: number;
	transfer_payee_id: string;
	direct_import_linked: boolean;
	direct_import_in_error: boolean;
	deleted: boolean;
}

export interface IYnabResponse<T, K extends string> {
	data: {
		[key in K]: T
	};
}

/**
 * Make an API request to YNAB
 *
 * @param {string} method
 * @param endpoint
 * @param {object} body
 * @param query
 * @returns {Promise<any>}
 */
export async function apiRequest(this: IHookFunctions | IExecuteFunctions | ILoadOptionsFunctions | IWebhookFunctions, method: string, endpoint: string, body: IDataObject = {}, query: IDataObject = {}): Promise<any> {  // tslint:disable-line:no-any
	const options: OptionsWithUri = {
		headers: {},
		method,
		body,
		qs: query || {},
		uri: `https://api.youneedabudget.com/v1/${endpoint}`,
		json: true,
	};

	if (!Object.keys(body).length) {
		delete options.body;
	}

	try {
		const credentials = await this.getCredentials('ynabApi') as IDataObject;

		if (credentials === undefined) {
			throw new Error('No credentials got returned!');
		}

		options.headers!['Authorization'] = `Bearer ${credentials.personalAccessToken}`;
		return await this.helpers.request!(options);

	} catch (error) {
		throw new NodeApiError(this.getNode(), error);
	}
}

export async function listBudgets(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
	const endpoint = 'budgets';
	const responseData = await apiRequest.call(this, 'GET', endpoint, {}) as IYnabResponse<IYnabBudget[], 'budgets'>;

	if (responseData.data?.budgets === undefined) {
		throw new Error('No data got returned');
	}

	return responseData.data.budgets.map(baseData => ({
		name: baseData.name,
		value: baseData.id,
	}));
}

export async function listAccounts(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
	const budgetId = this.getNodeParameter('budgetId') as string;

	if (!budgetId) {
		throw new Error('Select budget first');
	}

	const endpoint = `budgets/${budgetId}/accounts`;
	const responseData = await apiRequest.call(this, 'GET', endpoint, {}) as IYnabResponse<IYnabAccount[], 'accounts'>;

	if (responseData.data?.accounts === undefined) {
		throw new Error('No data got returned');
	}

	return responseData.data.accounts.map(baseData => ({
		name: baseData.name,
		value: baseData.id,
	}));
}

export async function createTransaction(this: IExecuteFunctions) {
	const budgetId = this.getNodeParameter('budgetId', 0) as string;
	const accountId = this.getNodeParameter('accountId', 0) as string;
	const date = this.getNodeParameter('date', 0) as string;
	const amount = this.getNodeParameter('amount', 0) as string;

	const endpoint = `budgets/${budgetId}/transactions`;
	const body = {
		transaction: {
			account_id: accountId,
			date,
			amount,
		},
	};
	const responseData = await apiRequest.call(this, 'POST', endpoint, body) as IYnabResponse<IYnabTransaction, 'transaction'>;

	if (responseData.data?.transaction === undefined) {
		throw new Error('No data got returned');
	}

	return responseData.data.transaction;
}

export async function listTransactions(this: IExecuteFunctions) {
	const budgetId = this.getNodeParameter('budgetId', 0) as string;

	const endpoint = `budgets/${budgetId}/transactions`;

	const responseData = await apiRequest.call(this, 'GET', endpoint, {}) as IYnabResponse<IYnabTransaction[], 'transactions'>;

	if (responseData.data?.transactions === undefined) {
		throw new Error('No data got returned');
	}

	return responseData.data.transactions;
}
