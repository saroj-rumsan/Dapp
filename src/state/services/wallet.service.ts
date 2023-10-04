import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { JsonRpcSigner, BrowserProvider, ethers } from 'ethers';
import { RootState } from '../store.ts';

const config: {
	provider?: BrowserProvider;
	signer?: JsonRpcSigner;
} = {};

export const getSigner = () => config?.signer;

if ((window as any).ethereum !== null) {
	config.provider = new ethers.BrowserProvider((window as any).ethereum);
	(window as any).ethereum?.on('accountsChanged', () => {
		window.location.reload();
	});
	(window as any).ethereum?.on('chainChanged', () => {
		window.location.reload();
	});
}

export const attachWallet = createAsyncThunk<{ address: string; networkId: number } | null, void, { state: RootState }>(
	'wallet/attachWallet',
	// Declare the type your function argument here:
	async (_, { getState }) => {
		const state = getState();
		if (state?.wallet?.noMetamask || config?.provider === undefined) return null;
		const accounts = await config.provider.listAccounts();
		if (accounts.length === 0) return null;
		config.signer = await config.provider.getSigner();
		const networkId = Number((await config.provider.getNetwork()).chainId);
		return { address: accounts[0].address, networkId };
	},
);

export const connectWallet = createAsyncThunk<
	{ address: string; networkId: number } | null,
	void,
	{ state: RootState }
>(
	'wallet/connectWallet',
	// Declare the type your function argument here:
	async (_, { getState }) => {
		const state = getState();
		if (state?.wallet?.noMetamask || config?.provider === undefined) return null;
		config.signer = await config.provider.getSigner();
		const accounts = await config.provider.listAccounts();
		const networkId = Number((await config.provider.getNetwork()).chainId);
		return { address: accounts[0].address, networkId };
	},
);

export interface walletState {
	isConnecting: boolean;
	isConnected: boolean;
	errorConnecting: boolean;
	accountAddress?: string;
	networkId?: number;
	noMetamask: boolean;
}

const initialState: walletState = {
	isConnecting: false,
	isConnected: false,
	errorConnecting: false,
	noMetamask: (window as any).ethereum === undefined,
};

export const walletSlice = createSlice({
	name: 'wallet',
	initialState,
	reducers: {},
	extraReducers(builder) {
		builder
			.addCase(connectWallet.pending, (state, action) => {
				state.isConnected = false;
				state.isConnecting = true;
				state.errorConnecting = false;
			})
			.addCase(connectWallet.fulfilled, (state, action) => {
				const { payload } = action;
				state.isConnecting = false;
				if (!payload) return state;
				state.isConnected = true;
				state.accountAddress = payload.address;
				state.networkId = payload.networkId;
			})
			.addCase(connectWallet.rejected, (state, action) => {
				state.isConnected = false;
				state.isConnecting = true;
				state.errorConnecting = true;
			})
			.addCase(attachWallet.pending, (state, action) => {
				state.isConnected = false;
				state.isConnecting = true;
				state.errorConnecting = false;
			})
			.addCase(attachWallet.fulfilled, (state, action) => {
				const { payload } = action;
				state.isConnecting = false;
				if (!payload) return state;
				state.isConnected = true;
				state.accountAddress = payload.address;
				state.networkId = payload.networkId;
			})
			.addCase(attachWallet.rejected, (state, action) => {
				state.isConnected = false;
				state.isConnecting = true;
				state.errorConnecting = true;
			});
	},
});

// eslint-disable-next-line no-empty-pattern
export const {} = walletSlice.actions;

export default walletSlice.reducer;
