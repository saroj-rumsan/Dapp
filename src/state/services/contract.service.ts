import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { JsonRpcSigner, ethers } from 'ethers';
import Web3VotingArtifact from '../../common/web3/artifacts/contracts/Web3Voting.sol/Web3Voting.json';
import { Web3Voting } from '../../common/web3/typechain-types';
import { RootState } from '../store';
import { getSigner } from './wallet.service';

const contractAbi = Web3VotingArtifact.abi;
const contractAddress = '0x4B849cccf06BDAE7B0a2046f3982200808f99E51';
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
			name: 'Cristiano Ronaldo',
			avatarUrl: 'https://wallpapers.com/images/high/cristiano-ronaldo-pictures-6fxmtqt0kgkyfxxf.webp',
			voteCount: 0,
			candidateId: 1,
		},
		{
			name: 'Lionel Messi',
			avatarUrl: 'https://wallpapers.com/images/high/pro-football-athlete-lionel-messi-hknbojkz7nw78aza.webp',
			voteCount: 0,
			candidateId: 2,
		},
	],
	contractAddress,
};

export const fetchVoteState = createAsyncThunk<boolean, void, { state: RootState }>(
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

export const updateCandidateVote = createAsyncThunk<{ id: number; voteCount: number }, number, { state: RootState }>(
	'contract/updateCandidateVote',
	// Declare the type your function argument here:
	async (candidateId, { getState }) => {
		const state = getState();
		const signer = getSigner();
		if (signer === undefined || state.wallet.accountAddress === undefined) throw new Error(`Wallet not Connected`);
		const contract = getContract(signer);
		const candidate = await contract.candidates(candidateId);
		const ret = { id: Number(candidate?.id), voteCount: Number(candidate?.voteCount) };
		return ret;
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
			})
			.addCase(updateCandidateVote.pending, (state, action) => {
				state.isLoading = true;
				state.isLoaded = false;
				state.errorLoading = false;
			})
			.addCase(updateCandidateVote.fulfilled, (state, action) => {
				state.isLoading = false;
				state.isLoaded = true;
				const candidate = state.candidates.find((x) => x?.candidateId === action.payload.id);
				console.log({ candidate });
				if (!candidate) return state;
				candidate.voteCount = action.payload.voteCount;
				return state;
			})
			.addCase(updateCandidateVote.rejected, (state, action) => {
				state.isLoading = false;
				state.isLoaded = false;
				state.errorLoading = true;
			});
	},
});
