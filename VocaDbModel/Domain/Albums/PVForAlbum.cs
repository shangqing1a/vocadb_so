#nullable disable

using VocaDb.Model.DataContracts.PVs;
using VocaDb.Model.Domain.PVs;

namespace VocaDb.Model.Domain.Albums
{
	public class PVForAlbum : PV, IEntryWithIntId
	{
		private Album album;

		public PVForAlbum() { }

		public PVForAlbum(Album album, PVContract contract)
			: base(contract)
		{
			Album = album;
		}

		public virtual Album Album
		{
			get => album;
			set
			{
				ParamIs.NotNull(() => value);
				album = value;
			}
		}

		public virtual bool Equals(PVForAlbum another)
		{
			if (another == null)
				return false;

			if (ReferenceEquals(this, another))
				return true;

			if (Id == 0)
				return false;

			return this.Id == another.Id;
		}

		public override bool Equals(object obj)
		{
			return Equals(obj as PVForAlbum);
		}

		public override int GetHashCode()
		{
			return base.GetHashCode();
		}

		public override void OnDelete()
		{
			Album.PVs.Remove(this);
		}

		public override string ToString()
		{
			return $"PV '{PVId}' [{Id}] for {Album}";
		}
	}
}
