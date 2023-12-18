import { useEffect } from 'react';
import './App.css';
import { useDispatch, useSelector } from 'react-redux';
import ConnectButton from './common/components/ConnectButton/index';
import { AppDispatch, useAppSelector } from './state/store';
import { attachWallet } from './state/services/wallet.service';
import VoteCard from './common/components/VoteCard';
import { fetchVoteState } from './state/services/contract.service';

function App() {
	const dispatch: AppDispatch = useDispatch();
	const candidates = useAppSelector((s) => s.contract.candidates);
	const isVoted = useAppSelector((s) => s.contract.isVoted);
	const isConnected = useAppSelector((s) => s.wallet.isConnected);
	const account = useAppSelector((s) => s.wallet.accountAddress);
	useEffect(() => {
		dispatch(attachWallet());
	}, []);

	useEffect(() => {
		if (isConnected && account) dispatch(fetchVoteState());
	}, [isConnected, account]);

	return (
		<>
			<nav style={{ display: 'flex', padding: '1rem' }}>
				<div className='logo' style={{ fontSize: '1.2rem', fontWeight: 600 }}>
					Web3 Voting Machine
				</div>
				<div style={{ flex: '1' }} className='spacer'></div>
				<ConnectButton />
			</nav>
			<main>
				{isVoted && (
					<h2 style={{ width: 'fit-content', margin: 'auto', marginBottom: '2rem' }}>You have already voted.</h2>
				)}
				<div className='canditates' style={{ display: 'flex', gap: '2rem', justifyContent: 'center' }}>
					{candidates.map((c) => {
						return <VoteCard key={c?.candidateId} id={c?.candidateId} />;
					})}
				</div>
			</main>
		</>
	);
}

export default App;
