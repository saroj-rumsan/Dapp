import React from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch, useAppSelector } from '../../../state/store';
import { connectWallet } from '../../../state/services/wallet.service';

const index = () => {
	const isConnecting = useAppSelector((s) => s.wallet.isConnecting);
	const isConnected = useAppSelector((s) => s.wallet.isConnected);
	const accountAddress = useAppSelector((s) => s.wallet.accountAddress);
	const dispatch: AppDispatch = useDispatch();
	return (
		<div>
			<button
				disabled={accountAddress !== undefined || isConnecting}
				onClick={(e) => {
					e.stopPropagation();
					e.preventDefault();
					dispatch(connectWallet());
				}}>
				{accountAddress && <>{accountAddress}</>}
				{!accountAddress && <>Connect Wallet</>}
			</button>
		</div>
	);
};

export default index;
