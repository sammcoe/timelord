namespace RuntimeComponent
{
	public sealed class CoreAppHelper
	{
		public void ExtendViewIntoTitleBar(bool val)
		{
			var currentview = Windows.ApplicationModel.Core.CoreApplication.GetCurrentView();
			currentview.TitleBar.ExtendViewIntoTitleBar = val;
		}
	};
}