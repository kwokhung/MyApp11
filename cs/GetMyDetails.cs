using System;
using System.Linq;
using System.Management;
using System.Threading.Tasks;

public class Startup
{
    public async Task<object> Invoke(dynamic input)
    {
        ObjectQuery winQuery = new ObjectQuery("Select * From Win32_ComputerSystem");

        ManagementObjectSearcher searcher = new ManagementObjectSearcher(winQuery);

        Object[] computerSystems = new Object[] { };

        foreach (ManagementObject item in searcher.Get())
        {
            computerSystems = computerSystems.Concat(new[]
            {
                new
                {
                    name = item["Name"],
                    description = item["Description"],
                    domain = item["Domain"],
                    manufacturer = item["Manufacturer"],
                    systemType = item["SystemType"],
                    totalPhysicalMemory = item["TotalPhysicalMemory"],
                    status = item["Status"]
                }
            }).ToArray();
        }

        winQuery = new ObjectQuery("Select * From Win32_OperatingSystem");

        searcher = new ManagementObjectSearcher(winQuery);

        Object[] operatingSystems = new Object[] { };

        foreach (ManagementObject item in searcher.Get())
        {
            operatingSystems = operatingSystems.Concat(new[]
            {
                new
                {
                    caption = item["Caption"],
                    version = item["Version"],
                    csdVersion = item["CSDVersion"],
                    osArchitecture = item["OSArchitecture"],
                    manufacturer = item["Manufacturer"],
                    freePhysicalMemory = item["FreePhysicalMemory"],
                    freeVirtualMemory = item["FreeVirtualMemory"],
                    localDateTime = ManagementDateTimeConverter.ToDateTime(item["LocalDateTime"].ToString()).ToString("yyyyMMddHHmmss"),
                    status = item["Status"]
                }
            }).ToArray();
        }

        winQuery = new ObjectQuery("Select * From Win32_LogicalDisk Where DriveType = 3");

        searcher = new ManagementObjectSearcher(winQuery);

        Object[] disks = new Object[] { };

        foreach (ManagementObject item in searcher.Get())
        {
            /*Console.WriteLine("Name = " + item["Name"]);
            Console.WriteLine("Size = {0:#,###.##} bytes", item["Size"]);
            Console.WriteLine("Size = {0:#,###.##} GB", (double)Convert.ToInt64(item["Size"]) / 1024 / 1024 / 1024);
            Console.WriteLine("FreeSpace = {0:#,###.##} bytes", item["FreeSpace"]);
            Console.WriteLine("FreeSpace = {0:#,###.##} GB", (double)Convert.ToInt64(item["FreeSpace"]) / 1024 / 1024 / 1024);*/

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

        winQuery = new ObjectQuery("Select * From Win32_Process Where Name Like 'SQL%'");

        searcher = new ManagementObjectSearcher(winQuery);

        Object[] processes = new Object[] { };

        foreach (ManagementObject item in searcher.Get())
        {
            /*Console.WriteLine("Name = " + item["Name"]);
            Console.WriteLine("ProcessId = " + item["ProcessId"]);*/

            String[] outputFields = new String[2];
            item.InvokeMethod("GetOwner", (Object[])outputFields);
            /*Console.WriteLine("User = " + outputFields[1] + "\\" + outputFields[0]);
            Console.WriteLine("CreationDate = " + item["CreationDate"]);
            Console.WriteLine("Priority = " + item["Priority"]);
            Console.WriteLine("WorkingSetSize = {0:#,###.##} KB", (double)Convert.ToInt64(item["WorkingSetSize"]) / 1024);*/

            processes = processes.Concat(new[]
            {
                new
                {
                    name = item["Name"],
                    processId = item["ProcessId"],
                    user = outputFields[1] + "\\" + outputFields[0],
                    creationDate = ManagementDateTimeConverter.ToDateTime(item["CreationDate"].ToString()).ToString("yyyyMMddHHmmss"),
                    priority = item["Priority"],
                    workingSetSize = item["WorkingSetSize"],
                }
            }).ToArray();
        }

        winQuery = new ObjectQuery("Select * From Win32_Service Where Name Like 'SQL%'");

        searcher = new ManagementObjectSearcher(winQuery);

        Object[] services = new Object[] { };

        foreach (ManagementObject item in searcher.Get())
        {
            services = services.Concat(new[]
            {
                new
                {
                    name = item["Name"],
                    caption = item["Caption"],
                    displayName = item["DisplayName"],
                    description = item["Description"],
                    pathName = item["PathName"],
                    startMode = item["StartMode"],
                    started = item["Started"],
                    startName = item["StartName"],
                    state = item["State"],
                    processId = item["ProcessId"],
                    exitCode = item["ExitCode"],
                    status = item["Status"],
                }
            }).ToArray();
        }

        return new
        {
            data = new
            {
                who = input.data.who,
                computerSystem = computerSystems[0],
                operatingSystem = operatingSystems[0],
                disks = disks,
                processes = processes,
                services = services
            }
        };
    }
}
