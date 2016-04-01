using System;
using System.IO;
using System.ComponentModel;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.InteropServices;
using System.Text;
using System.Threading.Tasks;

namespace RuntimeComponent
{
    public sealed class CoreAppHelper
    {
        public void ExtendViewIntoTitleBar(bool val)
        {
            var currentview = Windows.ApplicationModel.Core.CoreApplication.GetCurrentView();
            currentview.TitleBar.ExtendViewIntoTitleBar = val;

        }

        [DllImport("USER32.DLL", CharSet = CharSet.Unicode)]
        private static extern IntPtr FindWindow(string lpClassName, string lpWindowName);

        [DllImport("USER32.DLL", CharSet = CharSet.Unicode)]
        private static extern bool SetForegroundWindow(IntPtr hWnd);

        public bool BringToFront(string title)
        {
            // Get a handle to the Calculator application.
            IntPtr handle = FindWindow(null, title);

            // Verify that Calculator is a running process.
            if (handle == IntPtr.Zero)
            {
                return false;
            }

            // Make Calculator the foreground application
            return(SetForegroundWindow(handle));
        }
    };
}
