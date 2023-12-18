import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch, useAppSelector } from '../../../state/store';
import styles from './styles.module.scss';
import { updateCandidateVote, voteForCandidate } from '../../../state/services/contract.service';

const VoteCard = ({ id }: { id: number }) => {
	const candidate = useAppSelector((s) => s.contract.candidates.find((x) => x.candidateId === id));
	const isConnected = useAppSelector((s) => s.wallet.isConnected);
	const isVoted = useAppSelector((s) => s.contract.isVoted);
	const dispatch: AppDispatch = useDispatch();
	useEffect(() => {
		if (candidate && isConnected) {
			dispatch(updateCandidateVote(id));
		}
	}, [id, isConnected, isVoted]);
	return (
		<>
			{candidate && (
				<div className={styles.candidate}>
					<div className={styles.avatar} style={{ backgroundImage: `url("${candidate?.avatarUrl}")` }}></div>
					<div className={styles.name}>{candidate.name}</div>
					<div className={styles.totalVotes}>Total Votes: {candidate.voteCount}</div>
					<div className={styles.voteBtn}>
						<button
							onClick={(e) => {
								e.preventDefault();
								e.stopPropagation();
								if (candidate) {
									dispatch(voteForCandidate(candidate?.candidateId));
								}
							}}
							disabled={!isConnected || isVoted}>
							{isConnected ? <>Vote</> : <>Please Connect to Vote</>}
						</button>
					</div>
				</div>
			)}
		</>
	);
};

export default VoteCard;
