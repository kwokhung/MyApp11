using System;
using System.Linq;
using System.Management;
using System.Threading.Tasks;

public class Startup
{
    public async Task<object> Invoke(dynamic input)
    {
        ObjectQuery winQuery = new ObjectQuery("SELECT * FROM Win32_LogicalDisk");

        ManagementObjectSearcher searcher = new ManagementObjectSearcher(winQuery);

        Object[] disks = new Object[] { };

        foreach (ManagementObject item in searcher.Get())
        {
            Console.WriteLine("Name = " + item["Name"]);
            Console.WriteLine("Size = {0:#,###.##} bytes", item["Size"]);
            Console.WriteLine("Size = {0:#,###.##} GB", (double)Convert.ToInt64(item["Size"]) / 1024 / 1024 / 1024);
            Console.WriteLine("FreeSpace = {0:#,###.##} bytes", item["FreeSpace"]);
            Console.WriteLine("FreeSpace = {0:#,###.##} GB", (double)Convert.ToInt64(item["FreeSpace"]) / 1024 / 1024 / 1024);

            disks = disks.Concat(new[]
            {
                new
                {
                    name = item["Name"],
                    size = item["Size"],
                    freeSpace = item["FreeSpace"]
                }
            }).ToArray();
        }

        winQuery = new ObjectQuery("Select * from Win32_Process");

        searcher = new ManagementObjectSearcher(winQuery);

        Object[] processes = new Object[] { };

        foreach (ManagementObject item in searcher.Get())
        {
            Console.WriteLine("Name = " + item["Name"]);
            Console.WriteLine("ProcessId = " + item["ProcessId"]);

            String[] outputFields = new String[2];
            item.InvokeMethod("GetOwner", (Object[])outputFields);
            Console.WriteLine("User = " + outputFields[1] + "\\" + outputFields[0]);
            Console.WriteLine("CreationDate = " + item["CreationDate"]);
            Console.WriteLine("Priority = " + item["Priority"]);
            Console.WriteLine("WorkingSetSize = {0:#,###.##} KB", (double)Convert.ToInt64(item["WorkingSetSize"]) / 1024);

            processes = processes.Concat(new[]
            {
                new
                {
                    name = item["Name"],
                    processId = item["ProcessId"],
                    user = outputFields[1] + "\\" + outputFields[0],
                    creationDate = item["CreationDate"],
                    priority = item["Priority"],
                    workingSetSize = item["WorkingSetSize"],
                }
            }).ToArray();
        }

        return new
        {
            data = new
            {
                who = input.data.who,
                OSVersion = Environment.OSVersion.ToString(),
                MachineName = Environment.MachineName,
                UserName = Environment.UserName,
                UserDomainName = Environment.UserDomainName,
                disks = disks,
                processes = processes
            }
        };
    }
}
