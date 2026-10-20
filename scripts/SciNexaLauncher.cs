using System;
using System.Diagnostics;
using System.IO;
using System.Net;
using System.Text;
using System.Threading;
using System.Windows.Forms;

namespace SciNexa
{
    static class Program
    {
        private static HttpListener listener;
        private static Thread serverThread;
        private static string distFolder;
        private static int port = 5173;

        [STAThread]
        static void Main()
        {
            try
            {
                string baseDir = AppDomain.CurrentDomain.BaseDirectory;
                
                // 1. Locate dist folder
                distFolder = Path.Combine(baseDir, "dist");
                if (!Directory.Exists(distFolder))
                {
                    // Check if run directly inside dist
                    if (File.Exists(Path.Combine(baseDir, "index.html")) && Directory.Exists(Path.Combine(baseDir, "assets")))
                    {
                        distFolder = baseDir;
                    }
                    else
                    {
                        // Check common locations
                        string fallback = @"D:\isef\dist";
                        if (Directory.Exists(fallback))
                        {
                            distFolder = fallback;
                        }
                        else
                        {
                            foreach (DriveInfo drive in DriveInfo.GetDrives())
                            {
                                if (drive.IsReady)
                                {
                                    string c1 = Path.Combine(drive.RootDirectory.FullName, "isef", "dist");
                                    string c2 = Path.Combine(drive.RootDirectory.FullName, "scinexa", "dist");
                                    string c3 = Path.Combine(drive.RootDirectory.FullName, "dist");
                                    if (Directory.Exists(c1)) { distFolder = c1; break; }
                                    if (Directory.Exists(c2)) { distFolder = c2; break; }
                                    if (Directory.Exists(c3)) { distFolder = c3; break; }
                                }
                            }
                        }
                    }
                }

                if (!Directory.Exists(distFolder) || !File.Exists(Path.Combine(distFolder, "index.html")))
                {
                    MessageBox.Show(
                        "تعذر العثور على مجلد ملفات ساي نكسا (dist\\index.html).\nيرجى التأكد من تشغيل البرنامج من داخل مجلد المشروع أو وجود مجلد dist بجانب البرنامج على الفلاشة.",
                        "SciNexa Offline Launcher",
                        MessageBoxButtons.OK,
                        MessageBoxIcon.Warning
                    );
                    return;
                }

                // 2. Start Built-in Zero-Dependency Embedded HTTP Server
                listener = new HttpListener();
                bool started = false;
                for (int p = 5173; p <= 5185; p++)
                {
                    try
                    {
                        listener = new HttpListener();
                        listener.Prefixes.Add("http://localhost:" + p + "/");
                        listener.Start();
                        port = p;
                        started = true;
                        break;
                    }
                    catch
                    {
                        try { listener.Close(); } catch {}
                    }
                }

                if (!started)
                {
                    MessageBox.Show("تعذر فتح منفذ محلي لتشغيل السيرفر المدمج.", "SciNexa Server Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
                    return;
                }

                // Start Server Worker Thread
                serverThread = new Thread(ServerWorker);
                serverThread.IsBackground = true;
                serverThread.Start();

                // 3. Launch Default Browser seamlessly
                string url = "http://localhost:" + port + "/";
                Process.Start(new ProcessStartInfo
                {
                    FileName = url,
                    UseShellExecute = true
                });

                // Keep app alive in background
                Application.Run();
            }
            catch (Exception ex)
            {
                MessageBox.Show("حدث خطأ أثناء تشغيل ساي نكسا:\n" + ex.Message, "SciNexa Launcher", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }

        private static void ServerWorker()
        {
            while (listener != null && listener.IsListening)
            {
                try
                {
                    HttpListenerContext context = listener.GetContext();
                    ThreadPool.QueueUserWorkItem((ctx) => ProcessRequest((HttpListenerContext)ctx), context);
                }
                catch
                {
                    break;
                }
            }
        }

        private static void ProcessRequest(HttpListenerContext context)
        {
            HttpListenerRequest request = context.Request;
            HttpListenerResponse response = context.Response;

            try
            {
                string rawPath = request.Url.LocalPath.TrimStart('/');
                if (string.IsNullOrEmpty(rawPath))
                {
                    rawPath = "index.html";
                }

                string decodedPath = Uri.UnescapeDataString(rawPath).Replace('/', Path.DirectorySeparatorChar);
                string filePath = Path.Combine(distFolder, decodedPath);

                if (File.Exists(filePath))
                {
                    response.ContentType = GetMimeType(Path.GetExtension(filePath));
                    byte[] bytes = File.ReadAllBytes(filePath);
                    response.ContentLength64 = bytes.Length;
                    response.OutputStream.Write(bytes, 0, bytes.Length);
                }
                else
                {
                    // SPA Fallback: route any navigation back to index.html
                    string spaIndex = Path.Combine(distFolder, "index.html");
                    if (File.Exists(spaIndex))
                    {
                        response.ContentType = "text/html; charset=utf-8";
                        byte[] bytes = File.ReadAllBytes(spaIndex);
                        response.ContentLength64 = bytes.Length;
                        response.OutputStream.Write(bytes, 0, bytes.Length);
                    }
                    else
                    {
                        response.StatusCode = 404;
                    }
                }
            }
            catch
            {
                try { response.StatusCode = 500; } catch {}
            }
            finally
            {
                try { response.OutputStream.Close(); } catch {}
            }
        }

        private static string GetMimeType(string ext)
        {
            if (string.IsNullOrEmpty(ext)) return "application/octet-stream";
            ext = ext.ToLower();
            switch (ext)
            {
                case ".html": case ".htm": return "text/html; charset=utf-8";
                case ".js": case ".mjs": return "application/javascript; charset=utf-8";
                case ".css": return "text/css; charset=utf-8";
                case ".json": return "application/json; charset=utf-8";
                case ".png": return "image/png";
                case ".jpg": case ".jpeg": return "image/jpeg";
                case ".webp": return "image/webp";
                case ".svg": return "image/svg+xml";
                case ".ico": return "image/x-icon";
                case ".glb": return "model/gltf-binary";
                case ".gltf": return "model/gltf+json";
                case ".wasm": return "application/wasm";
                case ".pdf": return "application/pdf";
                case ".txt": return "text/plain; charset=utf-8";
                default: return "application/octet-stream";
            }
        }
    }
}
