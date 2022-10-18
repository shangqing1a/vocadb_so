import Alert from '@/Bootstrap/Alert';
import Breadcrumb from '@/Bootstrap/Breadcrumb';
import Button from '@/Bootstrap/Button';
import { Layout } from '@/Components/Shared/Layout';
import { TagLockingAutoComplete } from '@/Components/Shared/Partials/Knockout/TagLockingAutoComplete';
import { SaveBtn } from '@/Components/Shared/Partials/Shared/SaveBtn';
import { showErrorMessage, showSuccessMessage } from '@/Components/ui';
import { TagRepository } from '@/Repositories/TagRepository';
import { HttpClient } from '@/Shared/HttpClient';
import { ManageEntryTagMappingsStore } from '@/Stores/Admin/ManageEntryTagMappingsStore';
import classNames from 'classnames';
import { getReasonPhrase } from 'http-status-codes';
import { runInAction } from 'mobx';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { Link } from 'react-router-dom';

const httpClient = new HttpClient();

const tagRepo = new TagRepository(httpClient, vdb.values.baseAddress);

const manageEntryTagMappingsStore = new ManageEntryTagMappingsStore(tagRepo);

const AdminManageEntryTagMappings = observer(
	(): React.ReactElement => {
		return (
			<Layout
				title="Manage entry type to tag mappings" /* TODO: localize */
				parents={
					<>
						<Breadcrumb.Item linkAs={Link} linkProps={{ to: '/Admin' }}>
							Manage{/* TODO: localize */}
						</Breadcrumb.Item>
					</>
				}
			>
				<Alert variant="info">
					Only one tag can be mapped to entry type / sub type combination.
					{/* TODO: localize */}
				</Alert>

				<form className="form-horizontal">
					<h3>New mapping{/* TODO: localize */}</h3>
					<div className="control-group">
						<label className="control-label" htmlFor="newSourceName">
							Entry type{/* TODO: localize */}
						</label>
						<div className="controls">
							<select
								value={manageEntryTagMappingsStore.newEntryType}
								onChange={(e): void =>
									runInAction(() => {
										manageEntryTagMappingsStore.newEntryType = e.target.value;
									})
								}
							>
								<option value="" />
								{manageEntryTagMappingsStore.entryTypes.map((entryType) => (
									<option value={entryType} key={entryType}>
										{entryType}
									</option>
								))}
							</select>
						</div>
					</div>
					<div className="control-group">
						<label className="control-label" htmlFor="newSourceName">
							Sub type{/* TODO: localize */}
						</label>
						<div className="controls">
							<select
								value={manageEntryTagMappingsStore.newEntrySubType}
								onChange={(e): void =>
									runInAction(() => {
										manageEntryTagMappingsStore.newEntrySubType =
											e.target.value;
									})
								}
							>
								<option value="" />
								{manageEntryTagMappingsStore.entrySubTypes.map(
									(entrySubType) => (
										<option value={entrySubType} key={entrySubType}>
											{entrySubType}
										</option>
									),
								)}
							</select>
						</div>
					</div>
					<div className="control-group">
						<label className="control-label">
							Target tag{/* TODO: localize */}
						</label>
						<div className="controls">
							<TagLockingAutoComplete
								basicEntryLinkStore={manageEntryTagMappingsStore.newTargetTag}
							/>
						</div>
					</div>
					<div className="control-group">
						<div className="controls">
							<Button
								variant="primary"
								onClick={(): void => {
									if (
										manageEntryTagMappingsStore.mappings.some(
											(m) =>
												m.tag.id ===
													manageEntryTagMappingsStore.newTargetTag.id &&
												m.entryType.entryType ===
													manageEntryTagMappingsStore.newEntryType &&
												m.entryType.subType ===
													manageEntryTagMappingsStore.newEntrySubType,
										)
									) {
										showErrorMessage(
											`Mapping already exists for entry type ${manageEntryTagMappingsStore.newEntryType}, ${manageEntryTagMappingsStore.newEntrySubType}` /* TODO: localize */,
										);
										return;
									}

									manageEntryTagMappingsStore.addMapping();
								}}
							>
								Add{/* TODO: localize */}
							</Button>
						</div>
					</div>
				</form>

				<hr />

				<form
					onSubmit={async (e): Promise<void> => {
						e.preventDefault();

						try {
							await manageEntryTagMappingsStore.save();

							showSuccessMessage('Saved' /* TODO: localize */);
						} catch (error: any) {
							showErrorMessage(
								error.response && error.response.status
									? getReasonPhrase(error.response.status)
									: 'Unable to save entry type to tag mappings.' /* TODO: localize */,
							);

							throw error;
						}

						await manageEntryTagMappingsStore.loadMappings();
					}}
				>
					<h3>Mappings{/* TODO: localize */}</h3>

					<br />
					<br />

					<SaveBtn submitting={manageEntryTagMappingsStore.submitting} />

					<table>
						<thead>
							<tr>
								<th>Entry type{/* TODO: localize */}</th>
								<th>Tag{/* TODO: localize */}</th>
								<th></th>
							</tr>
						</thead>
						<tbody>
							{manageEntryTagMappingsStore.mappings.map((mapping, index) => (
								<tr
									className={classNames(
										mapping.isNew && 'row-new',
										mapping.isDeleted && 'row-deleted',
									)}
									key={index}
								>
									<td>
										{mapping.entryType.entryType} - {mapping.entryType.subType}
									</td>
									<td>
										<a
											className="extLink"
											href={manageEntryTagMappingsStore.getTagUrl(mapping)}
											target="_blank"
											rel="noreferrer"
										>
											{mapping.tag.name}
										</a>
									</td>
									<td>
										<Button
											variant="danger"
											className="btn-small"
											onClick={mapping.deleteMapping}
											disabled={mapping.isDeleted}
										>
											Delete{/* TODO: localize */}
										</Button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
					<br />

					<SaveBtn submitting={manageEntryTagMappingsStore.submitting} />
				</form>
			</Layout>
		);
	},
);

export default AdminManageEntryTagMappings;