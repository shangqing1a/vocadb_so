import Button from '@Bootstrap/Button';
import ButtonGroup from '@Bootstrap/ButtonGroup';
import SongWithPreviewStore from '@Stores/Song/SongWithPreviewStore';
import classNames from 'classnames';
import { observer } from 'mobx-react-lite';
import React from 'react';

import EmbedPV from '../PV/EmbedPV';
import PVRatingButtonsForIndex from '../PVRatingButtonsForIndex';

interface PVPreviewKnockoutProps {
	previewStore: SongWithPreviewStore;
	getPvServiceIcons: (services: string) => { service: string; url: string }[];
}

const PVPreviewKnockout = observer(
	({
		previewStore,
		getPvServiceIcons,
	}: PVPreviewKnockoutProps): React.ReactElement => {
		if (!previewStore.preview || !previewStore.selectedSong) return <></>;

		const primaryPV = previewStore.selectedSong.pvs.filter(
			(pv) => pv.service === previewStore.pvService,
		)[0];

		return (
			<div /* TODO: slideVisible */ className="pvPreview">
				<div className="pull-right">
					{previewStore.ratingButtons && (
						<PVRatingButtonsForIndex
							pvRatingButtonsStore={previewStore.ratingButtons}
						/>
					)}

					{/* PV service switcher */}
					<div className="btn-toolbar">
						<ButtonGroup>
							{previewStore.pvServices &&
								previewStore.pvServices.indexOf(',') > 0 && (
									<div className="pv-preview-services">
										{getPvServiceIcons(previewStore.pvServices).map(
											(icon, index) => (
												<Button
													href="#"
													onClick={(): void =>
														previewStore.switchPV(icon.service)
													}
													title={icon.service}
													className={classNames(
														icon.service === previewStore.pvService && 'active',
													)}
													key={icon.service}
												>
													{/* eslint-disable-next-line jsx-a11y/alt-text */}
													<img src={icon.url} />
												</Button>
											),
										)}
									</div>
								)}
						</ButtonGroup>
					</div>
				</div>
				<div>{primaryPV && <EmbedPV pv={primaryPV} />}</div>
			</div>
		);
	},
);

export default PVPreviewKnockout;