import { useEffect } from 'react';
import './App.css';
import { useDispatch } from 'react-redux';
import ConnectButton from './common/components/ConnectButton/index';
import { AppDispatch } from './state/store';
import { attachWallet } from './state/services/wallet.service';

function App() {
	const dispatch: AppDispatch = useDispatch();

	useEffect(() => {
		dispatch(attachWallet());
	}, []);
	return (
		<>
			<ConnectButton />
		</>
	);
}

export default App;
