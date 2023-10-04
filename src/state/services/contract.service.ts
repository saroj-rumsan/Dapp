import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { JsonRpcSigner, ethers } from 'ethers';
import Web3VotingArtifact from '../../common/web3/artifacts/contracts/Web3Voting.sol/Web3Voting.json';
import { Web3Voting } from '../../common/web3/typechain-types';
import { RootState } from '../store';
import { getSigner } from './wallet.service';

const contractAbi = Web3VotingArtifact.abi;
const contractAddress = '0x1A767197679f389de6a654bA903DD83A38b9977a';
const networkUrl = 'https://polygon-mumbai.infura.io/v3/43babf32ce0346fabbf1c1069418a90b';

const getContract = (signer: JsonRpcSigner) =>
	new ethers.Contract(contractAddress, contractAbi, signer) as any as Web3Voting;

export interface contractState {
	isLoading: boolean;
	isLoaded: boolean;
	errorLoading: boolean;
	isVoted: boolean;
	isVoting: boolean;
	errorVoting: boolean;
	candidates: {
		name: string;
		voteCount: number;
		avatarUrl: string;
		candidateId: number;
	}[];
	contractAddress: string;
}

const initialState: contractState = {
	isLoading: false,
	isLoaded: false,
	errorLoading: false,
	isVoted: false,
	isVoting: false,
	errorVoting: false,
	candidates: [
		{
			name: 'Barrack Obama',
			avatarUrl:
				'https://images.unsplash.com/photo-1580130379624-3a069adbffc5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1926&q=80',
			voteCount: 0,
			candidateId: 1,
		},
		{
			name: 'Saroj Shrestha',
			avatarUrl:
				'https://media.cnn.com/api/v1/images/stellar/prod/220228151805-putin-0218.jpg?c=16x9&q=h_720,w_1280,c_fill/f_webp',
			voteCount: 0,
			candidateId: 2,
		},
	],
	contractAddress,
};

export const fetchVoteState = createAsyncThunk<boolean, number, { state: RootState }>(
	'contract/fetchVoteState',
	// Declare the type your function argument here:
	async (_, { getState }) => {
		const state = getState();
		const signer = getSigner();
		if (signer === undefined || state.wallet.accountAddress === undefined) throw new Error(`Wallet not Connected`);
		const contract = getContract(signer);
		const isVoted = contract.voters(state.wallet.accountAddress);
		return isVoted;
	},
);

export const voteForCandidate = createAsyncThunk<void, number, { state: RootState }>(
	'contract/voteForCandidate',
	// Declare the type your function argument here:
	async (candidateId, { getState }) => {
		const state = getState();
		const signer = getSigner();
		if (signer === undefined || state.wallet.accountAddress === undefined) throw new Error(`Wallet not Connected`);
		const contract = getContract(signer);
		await contract.vote(candidateId);
	},
);

export const contractSlice = createSlice({
	name: 'contract',
	initialState,
	reducers: {},
	extraReducers(builder) {
		builder
			.addCase(fetchVoteState.pending, (state, action) => {
				state.isLoading = true;
				state.isLoaded = false;
				state.errorLoading = false;
			})
			.addCase(fetchVoteState.fulfilled, (state, action) => {
				state.isLoading = false;
				state.isLoaded = true;
				state.isVoted = action.payload;
			})
			.addCase(fetchVoteState.rejected, (state, action) => {
				state.isLoaded = false;
				state.isLoading = false;
				state.errorLoading = true;
			})
			.addCase(voteForCandidate.pending, (state, action) => {
				state.isVoted = false;
				state.isVoting = true;
				state.errorVoting = false;
			})
			.addCase(voteForCandidate.fulfilled, (state, action) => {
				state.isVoting = false;
				state.isVoted = true;
			})
			.addCase(voteForCandidate.rejected, (state, action) => {
				state.isVoted = false;
				state.isVoting = false;
				state.errorVoting = true;
			});
	},
});
