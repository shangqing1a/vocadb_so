using System.Collections.Generic;
using System.Linq;
using VocaDb.Model.Database.Repositories;
using VocaDb.Model.DataContracts;
using VocaDb.Model.Domain;
using VocaDb.Model.Domain.Globalization;
using VocaDb.Model.Domain.ReleaseEvents;
using VocaDb.Model.Helpers;
using VocaDb.Model.Service.Exceptions;

namespace VocaDb.Model.Database.Queries.Partial {

	/// <summary>
	/// Handles updating event names.
	/// </summary>
	/// <remarks>
	/// Event names are unique. In addition, event names can be inherited from series.
	/// Because of the order in which NHibernate saves cascaded collections, we need to make sure
	/// that there's no duplicate event names at any point.
	/// </remarks>
	public class UpdateEventNamesQuery {

		public void CheckDuplicateName(IDatabaseContext ctx, string[] names, int eventId) {

			var duplicateName = names
				.GroupBy(n => n, new KanaAndCaseInsensitiveStringComparer())
				.Where(n => n.Count() > 1)
				.Select(n => n.First())
				.FirstOrDefault();

			if (duplicateName != null) {
				throw new DuplicateEventNameException(duplicateName);
			}

			var duplicate = ctx.Query<EventName>()
				.FirstOrDefault(e => e.Entry.Id != eventId && names.Contains(e.Value));

			if (duplicate != null) {
				throw new DuplicateEventNameException(duplicate.Value);
			}

		}

		private bool SaveNames(IDatabaseContext ctx, ReleaseEvent ev, IEnumerable<ILocalizedString> names) {

			// Make sure deletions are flushed to database BEFORE new names are added, to make sure there's no duplicates
			var diff = ev.Names.SyncByContent(names, ev,
				deleted => {
					foreach (var name in deleted)
						ctx.Delete(name);
					ctx.Flush();
				}
			);

			foreach (var n in diff.Added)
				ctx.Save(n);

			return diff.Changed;

		}

		private IEnumerable<ILocalizedString> GetNames(IDatabaseContext ctx,
			IEntryWithIntId seriesLink, bool customName, int seriesNumber, string seriesSuffix, IEnumerable<ILocalizedString> nameContracts) {

			var series = ctx.NullSafeLoad<ReleaseEventSeries>(seriesLink);

			var names = series != null && !customName
				? series.Names.Select(seriesName =>
					new LocalizedStringContract(series.GetEventName(seriesNumber, seriesSuffix, seriesName.Value), seriesName.Language))
				: nameContracts;

			return names;

		}

		/// <summary>
		/// Synchronizes names for an event, including possible names inherited from the series.
		/// </summary>
		/// <param name="ctx">Database context. Cannot be null.</param>
		/// <param name="ev">Event to be updated. Cannot be null.</param>
		/// <param name="seriesLink">Linked series. Can be null.</param>
		/// <param name="customName">Whether event uses custom name.</param>
		/// <param name="seriesNumber">Series number.</param>
		/// <param name="seriesSuffix">Series suffix.</param>
		/// <param name="nameContracts">Given names for event.</param>
		/// <returns>True if the names were changed, otherwise false.</returns>
		/// <remarks>
		/// If series is specified and custom name setting is disabled, then event names are generated based on series names.
		/// If custom name is enabled or no series is specified, given names are used.
		/// Default name language is inherited from series as well, but that setting is not touched by this method.
		/// </remarks>
		public bool UpdateNames(IDatabaseContext ctx, ReleaseEvent ev, IEntryWithIntId seriesLink, 
			bool customName, int seriesNumber, string seriesSuffix, IEnumerable<ILocalizedString> nameContracts) {

			var names = GetNames(ctx, seriesLink, customName, seriesNumber, seriesSuffix, nameContracts).ToArray();
			var namesValues = names.Select(n => n.Value).ToArray();

			CheckDuplicateName(ctx, namesValues, ev.Id);
			var changed = SaveNames(ctx, ev, names);
			return changed;

		}

	}

}
