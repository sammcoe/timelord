using System;
using System.Diagnostics;
using System.Runtime.InteropServices;
using System.Text;

namespace RuntimeComponent
{
    public sealed class CoreAppHelper
    {
        public void ExtendViewIntoTitleBar(bool val)
        {
            var currentview = Windows.ApplicationModel.Core.CoreApplication.GetCurrentView();
            currentview.TitleBar.ExtendViewIntoTitleBar = val;

        }
        
        private enum ShowWindowEnum
        {
            Hide = 0,
            ShowNormal = 1, ShowMinimized = 2, ShowMaximized = 3,
            Maximize = 3, ShowNormalNoActivate = 4, Show = 5,
            Minimize = 6, ShowMinNoActivate = 7, ShowNoActivate = 8,
            Restore = 9, ShowDefault = 10, ForceMinimized = 11
        };
        
        [DllImport("USER32.DLL", CharSet = CharSet.Unicode)]
        private static extern IntPtr FindWindow(string lpClassName, string lpWindowName);

        [DllImport("USER32.DLL", CharSet = CharSet.Unicode, ExactSpelling = true)]
        private static extern bool SetForegroundWindow(IntPtr hWnd);

        [DllImport("USER32.DLL", CharSet = CharSet.Unicode, ExactSpelling = true)]
        private static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);

        [DllImport("user32.dll", CharSet = CharSet.Unicode, ExactSpelling = true)]
        static extern IntPtr GetForegroundWindow();

        [DllImport("user32.dll", CharSet = CharSet.Unicode)]
        static extern int GetWindowText(IntPtr hWnd, StringBuilder text, int count);

        public bool BringToFront(string title)
        {

            // Get a handle to the Calculator application.
            IntPtr handle = FindWindow(null, title);

            // Verify that Calculator is a running process.
            if (handle == IntPtr.Zero)
            {
                return false;
            }

            //the window is hidden so we restore it
            ShowWindow(handle, (int)ShowWindowEnum.ShowNormal);
            ShowWindow(handle, (int)ShowWindowEnum.Restore);
            
            // Make Calculator the foreground application
            return (SetForegroundWindow(handle));
        }

        public string GetActiveWindowTitle()
        {
            const int nChars = 256;
            StringBuilder Buff = new StringBuilder(nChars);
            IntPtr handle = GetForegroundWindow();

            if (GetWindowText(handle, Buff, nChars) > 0)
            {
                return Buff.ToString();
            }
            return null;
        }
    };
}
