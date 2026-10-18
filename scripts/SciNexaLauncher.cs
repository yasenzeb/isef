using System;
using System.Diagnostics;
using System.IO;
using System.Windows.Forms;

namespace SciNexa
{
    static class Program
    {
        [STAThread]
        static void Main()
        {
            try
            {
                string baseDir = AppDomain.CurrentDomain.BaseDirectory;
                string scriptPath = Path.Combine(baseDir, "scripts", "offline_server.ps1");

                // If not found in current directory (e.g. user copied exe to Desktop), search common project locations and drives
                if (!File.Exists(scriptPath))
                {
                    string fallback = @"D:\isef\scripts\offline_server.ps1";
                    if (File.Exists(fallback))
                    {
                        scriptPath = fallback;
                    }
                    else
                    {
                        // Search all removable & fixed drives
                        DriveInfo[] drives = DriveInfo.GetDrives();
                        foreach (DriveInfo drive in drives)
                        {
                            if (drive.IsReady)
                            {
                                string candidate1 = Path.Combine(drive.RootDirectory.FullName, "isef", "scripts", "offline_server.ps1");
                                string candidate2 = Path.Combine(drive.RootDirectory.FullName, "scinexa", "scripts", "offline_server.ps1");
                                string candidate3 = Path.Combine(drive.RootDirectory.FullName, "scripts", "offline_server.ps1");

                                if (File.Exists(candidate1)) { scriptPath = candidate1; break; }
                                if (File.Exists(candidate2)) { scriptPath = candidate2; break; }
                                if (File.Exists(candidate3)) { scriptPath = candidate3; break; }
                            }
                        }
                    }
                }

                if (!File.Exists(scriptPath))
                {
                    MessageBox.Show(
                        "تعذر العثور على ملفات تشغيل ساي نكسا (offline_server.ps1).\nيرجى التأكد من تشغيل البرنامج من داخل مجلد المشروع أو وجود مجلد المشروع على الجهاز أو الفلاشة.",
                        "SciNexa Platform Launcher",
                        MessageBoxButtons.OK,
                        MessageBoxIcon.Warning
                    );
                    return;
                }

                ProcessStartInfo psi = new ProcessStartInfo();
                psi.FileName = "powershell.exe";
                psi.Arguments = "-WindowStyle Hidden -ExecutionPolicy Bypass -File \"" + scriptPath + "\"";
                psi.WorkingDirectory = Path.GetDirectoryName(Path.GetDirectoryName(scriptPath));
                psi.CreateNoWindow = true;
                psi.UseShellExecute = false;
                psi.WindowStyle = ProcessWindowStyle.Hidden;

                Process.Start(psi);
            }
            catch (Exception ex)
            {
                MessageBox.Show("حدث خطأ أثناء تشغيل ساي نكسا:\n" + ex.Message, "SciNexa Launcher", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }
    }
}
