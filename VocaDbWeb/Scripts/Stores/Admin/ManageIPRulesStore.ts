import {
	AdminRepository,
	IPRuleContract,
} from '@/Repositories/AdminRepository';
import _ from 'lodash';
import { action, makeObservable, observable, runInAction } from 'mobx';
import moment from 'moment';

class IPRule {
	@observable public address: string;
	public readonly created: string;
	public readonly id: number;
	@observable public notes: string;

	public constructor(data: IPRuleContract) {
		makeObservable(this);

		this.address = data.address!;
		this.created = data.created!;
		this.id = data.id!;
		this.notes = data.notes!;
	}
}

export class ManageIPRulesStore {
	@observable public bannedIPs: string[] = [];
	@observable public newAddress = '';
	@observable public rules: IPRule[] = [];
	@observable public submitting = false;

	public constructor(private readonly adminRepo: AdminRepository) {
		makeObservable(this);

		adminRepo.getIPRules({}).then((data) =>
			runInAction(() => {
				this.rules = _.chain(data)
					.sortBy('created')
					.reverse()
					.map((r) => new IPRule(r))
					.value();
			}),
		);

		adminRepo.getTempBannedIps({}).then((result) => this.setBannedIPs(result));
	}

	@action public setBannedIPs = (value: string[]): void => {
		this.bannedIPs = value;
	};

	@action public add = (addr: string): void => {
		this.rules.unshift(
			new IPRule({
				address: addr,
				notes: '',
				created: new Date().toISOString(),
			}),
		);
		this.newAddress = '';
	};

	@action public deleteOldRules = (): void => {
		const cutOff = moment().subtract(1, 'years').toDate();

		const toBeRemoved = this.rules.filter((r) => new Date(r.created) < cutOff);
		_.pull(this.rules, ...toBeRemoved);
	};

	@action public remove = (rule: IPRule): void => {
		_.pull(this.rules, rule);
	};

	@action public save = async (): Promise<void> => {
		try {
			this.submitting = true;

			await this.adminRepo.saveIPRules({ ipRules: this.rules });
		} finally {
			runInAction(() => {
				this.submitting = false;
			});
		}
	};
}