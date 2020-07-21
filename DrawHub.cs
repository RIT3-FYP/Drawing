using System;
using System.Collections.Generic;
using System.Drawing;
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;
using Newtonsoft.Json;

namespace Drawing
{
    public class User
    {
        public string Id { get; set; }
        public string Color { get; set; }
        public string Name { get; set; }
        public User(string id, string color, string name) => (Id, Color, Name) = (id, color, name);
    }
    public class DrawObject
    {
        public string Id { get; set; }
        public string Tag { get; set; }
        public string Color { get; set; }
        public int Size { get; set; }
        public Point Point1 { get; set; }
        public Point Point2 { get; set; }
        public string Fill { get; set; } = "none";

        public DrawObject(string tag, string id, string color, int size, Point p1, Point p2, string fill) => (Tag, Id, Color, Size, Point1, Point2, Fill) = (tag, id, color, size, p1, p2, fill);
        public DrawObject(string tag, string id, string color, int size, Point p1, Point p2) => (Tag, Id, Color, Size, Point1, Point2, Fill) = (tag, id, color, size, p1, p2, "none");


    }
    public class Point
    {
        public double X { get; set; }
        public double Y { get; set; }
    }


    public class Room
    {
        public string Id { get; set; } = Guid.NewGuid().ToString("N");
        public string Name { get; set; } = "ROOM" + Guid.NewGuid().ToString();
        public static List<User> users = new List<User>();
        public static List<DrawObject> drawObjects = new List<DrawObject>();
        public int NoOfUsers { get; set; }
        public bool IsEmpty => NoOfUsers == 0;
        public User GetUser(string id) => users.Find(r => r.Id == id);
        public void AddUser(User user) => users.Add(user);
        public List<User> getUserList() => users;
        public void RemoveUser(string id) => users.Remove(users.Find(r => r.Id == id));
        public DrawObject GetDraw(string id) => drawObjects.Find(r => r.Id == id);
        public void AddDraw(DrawObject o) => drawObjects.Add(o);
        public void RemoveDraw(string id) => drawObjects.Remove(drawObjects.Find(r => r.Id == id));
    }

    // Hub
    public class DrawHub : Hub
    {
        private static List<Room> rooms = new List<Room>();

        public string CreateRoom()
        {
            var room = new Room();
            rooms.Add(room);
            return room.Id;
        }


        // Class needed
        // public class DrawObject
        // {
        //     public string Id { get; set; }
        //     public string type { get; set; }
        //     public string Color { get; set; }
        //     public int Size { get; set; }
        //     public string Fill { get; set; }
        //     public List<Point> points { get; set; }
        // }

        // public class Command
        // {
        //     public string Name { get; set; }
        //     public object[] Param { get; set; }
        //     // public Command(string name, object[] param){
        //     //     Name = name;
        //     //     Param = param;
        //     // }
        //     public Command(string name, object[] param) => (Name, Param) = (name, param);

        // }


        // public async Task SendLine(Point a, Point b, int size, string color)
        // {
        //     commands.Add(new Command("drawLine", new Object[] { a, b, size, color }));
        //     await Clients.Others.SendAsync("ReceiveLine", a, b, size, color);
        // }

        // public async Task SendCurve(Point a, Point b, Point c, int size, string color)
        // {
        //     commands.Add(new Command("drawCurve", new Object[] { a, b, c, size, color }));
        //     await Clients.Others.SendAsync("ReceiveCurve", a, b, c, size, color);
        // }

        // public async Task SendImage(string url)
        // {
        //     commands.Clear();
        //     commands.Add(new Command("drawImage", new Object[] { url }));
        //     await Clients.Others.SendAsync("ReceiveImage", url);
        // }
        // public async Task SendClear()
        // {
        //     commands.Clear();
        //     await Clients.Others.SendAsync("ReceiveClear");
        // }
        // private static List<Command> commands = new List<Command>();

        public async Task StartDraw(string id, Point point, string color, string size, string fill)
        {
            // commands.Add(new Command("startDraw", new Object[] { id, point, color, size }));
            string roomId = Context.GetHttpContext().Request.Query["roomId"];
            Room room = rooms.Find(r => r.Id == roomId);
            if (room == null)
            {
                await Clients.Caller.SendAsync("Reject");
            }
            await Clients.OthersInGroup(roomId).SendAsync("StartDraw", id, point, color, size, fill);

            // await Clients.Others.SendAsync("StartDraw", id, point, color, size, fill);
        }
        public async Task Draw(string id, Point pointA, Point pointB)
        {
            // commands.Add(new Command("Draw", new Object[] { id, pointA, pointB }));
            string roomId = Context.GetHttpContext().Request.Query["roomId"];
            Room room = rooms.Find(r => r.Id == roomId);
            if (room == null)
            {
                await Clients.Caller.SendAsync("Reject");
            }
            await Clients.OthersInGroup(roomId).SendAsync("Draw", id, pointA, pointB);
            // await Clients.Others.SendAsync("Draw", id, pointA, pointB);
        }

        public async Task StartRect(string id, Point point, string color, string size, string fill)
        {
            string roomId = Context.GetHttpContext().Request.Query["roomId"];
            Room room = rooms.Find(r => r.Id == roomId);
            if (room == null)
            {
                await Clients.Caller.SendAsync("Reject");
            }
            await Clients.OthersInGroup(roomId).SendAsync("StartRect", id, point, color, size, fill);
        }
        public async Task DrawRect(string id, Point point, Point box)
        {
            string roomId = Context.GetHttpContext().Request.Query["roomId"];
            Room room = rooms.Find(r => r.Id == roomId);
            if (room == null)
            {
                await Clients.Caller.SendAsync("Reject");
            }
            await Clients.OthersInGroup(roomId).SendAsync("DrawRect", id, point, box);
        }
        public async Task StartCircle(string id, Point point, string color, string size, string fill)
        {
            string roomId = Context.GetHttpContext().Request.Query["roomId"];
            Room room = rooms.Find(r => r.Id == roomId);
            if (room == null)
            {
                await Clients.Caller.SendAsync("Reject");
            }
            await Clients.OthersInGroup(roomId).SendAsync("StartCircle", id, point, color, size, fill);
        }
        public async Task DrawCircle(string id, Point point, Point box)
        {
            string roomId = Context.GetHttpContext().Request.Query["roomId"];
            Room room = rooms.Find(r => r.Id == roomId);
            if (room == null)
            {
                await Clients.Caller.SendAsync("Reject");
            }
            await Clients.OthersInGroup(roomId).SendAsync("DrawCircle", id, point, box);
        }

        public async Task DrawLine(string id, Point point1, Point point2, string color, string size)
        {
            string roomId = Context.GetHttpContext().Request.Query["roomId"];
            Room room = rooms.Find(r => r.Id == roomId);
            if (room == null)
            {
                await Clients.Caller.SendAsync("Reject");
            }
            await Clients.OthersInGroup(roomId).SendAsync("DrawLine", id, point1, point2, color, size);
        }
        public async Task PushPoint(Point point)
        {
            string roomId = Context.GetHttpContext().Request.Query["roomId"];
            Room room = rooms.Find(r => r.Id == roomId);
            if (room == null)
            {
                await Clients.Caller.SendAsync("Reject");
            }
            await Clients.OthersInGroup(roomId).SendAsync("PushPoint", point);
        }
        public async Task PopPoint(Point point)
        {
            string roomId = Context.GetHttpContext().Request.Query["roomId"];
            Room room = rooms.Find(r => r.Id == roomId);
            if (room == null)
            {
                await Clients.Caller.SendAsync("Reject");
            }
            await Clients.OthersInGroup(roomId).SendAsync("PopPoint", point);
        }

        public async Task RemoveObject(string id)
        {
            string roomId = Context.GetHttpContext().Request.Query["roomId"];
            Room room = rooms.Find(r => r.Id == roomId);
            if (room == null)
            {
                await Clients.Caller.SendAsync("Reject");
            }
            await Clients.OthersInGroup(roomId).SendAsync("RemoveObject", id);
        }
        public async Task RemoveAllObject()
        {
            string roomId = Context.GetHttpContext().Request.Query["roomId"];
            Room room = rooms.Find(r => r.Id == roomId);
            if (room == null)
            {
                await Clients.Caller.SendAsync("Reject");
            }
            await Clients.OthersInGroup(roomId).SendAsync("RemoveAllObject");
        }
        public async Task Create(string obj)
        {
            string roomId = Context.GetHttpContext().Request.Query["roomId"];
            Room room = rooms.Find(r => r.Id == roomId);
            if (room == null)
            {
                await Clients.Caller.SendAsync("Reject");
            }
            await Clients.OthersInGroup(roomId).SendAsync("Create", obj);
        }
        public async Task MoveObject(string id, Object obj)
        {
            string roomId = Context.GetHttpContext().Request.Query["roomId"];
            Room room = rooms.Find(r => r.Id == roomId);
            if (room == null)
            {
                await Clients.Caller.SendAsync("Reject");
            }
            await Clients.OthersInGroup(roomId).SendAsync("MoveObject", id, obj);
        }

        public async Task InsertImage(string id, string url, Point point1, Point point2)
        {
            string roomId = Context.GetHttpContext().Request.Query["roomId"];
            Room room = rooms.Find(r => r.Id == roomId);
            if (room == null)
            {
                await Clients.Caller.SendAsync("Reject");
            }
            await Clients.OthersInGroup(roomId).SendAsync("InsertImage", id, url, point1, point2);
        }

        public async Task UpdateUserList()
        {
            string roomId = Context.GetHttpContext().Request.Query["roomId"];
            Room room = rooms.Find(r => r.Id == roomId);
            if (room == null)
            {
                await Clients.Caller.SendAsync("Reject");
            }

            await Clients.Group(roomId).SendAsync("UpdateUserList", JsonConvert.SerializeObject(room.getUserList()));
            await Clients.Group(roomId).SendAsync("UpdateUserCount",room.NoOfUsers);
        }


        // public async Task InsertObjectIntoList(DrawObject o)
        // {
        //     string roomId = Context.GetHttpContext().Request.Query["roomId"];

        //     Room room = rooms.Find(r => r.Id == roomId);
        //     if (room == null)
        //     {
        //         await Clients.Caller.SendAsync("Reject");
        //     }
        //     // room.draw
        //     await Clients.Group(roomId).SendAsync("Start");
        // }
        // public async Task DeleteObjectInList(DrawObject o)
        // {
        //     string roomId = Context.GetHttpContext().Request.Query["roomId"];

        //     Room room = rooms.Find(r => r.Id == roomId);
        //     if (room == null)
        //     {
        //         await Clients.Caller.SendAsync("Reject");
        //     }
        //     // room.draw
        //     await Clients.Group(roomId).SendAsync("Start");
        // }
        // List and room connection

        public async Task Start()
        {
            string roomId = Context.GetHttpContext().Request.Query["roomId"];

            Room room = rooms.Find(r => r.Id == roomId);
            if (room == null)
            {
                await Clients.Caller.SendAsync("Reject");
            }

            await Clients.Group(roomId).SendAsync("Start");
        }

        // Update Room List
        private async Task UpdateList(string id = null)
        {
            var list = rooms;

            if (id == null)
            {
                await Clients.All.SendAsync("UpdateList", list);
            }
            else
            {
                await Clients.Client(id).SendAsync("UpdateList", list);
            }
        }

        public override async Task OnConnectedAsync()
        {
            string page = Context.GetHttpContext().Request.Query["page"];

            switch (page)
            {
                case "list": await ListConnected(); break;
                case "draw": await RoomConnected(); break;
            }

            await base.OnConnectedAsync();
        }

        private async Task ListConnected()
        {
            string id = Context.ConnectionId;
            await UpdateList(id);
        }

        private async Task RoomConnected()
        {
            Random rnd = new Random();

            string id = Context.ConnectionId;
            string name = Context.GetHttpContext().Request.Query["name"];
            string roomId = Context.GetHttpContext().Request.Query["roomId"];

            Room room = rooms.Find(r => r.Id == roomId);
            if (room == null)
            {
                await Clients.Caller.SendAsync("Reject");
                return;
            }
            string randomColor = Color.FromArgb(rnd.Next(256), rnd.Next(256), rnd.Next(256)).ToString();
            User newUser = new User(id, randomColor, name);
            
            await Groups.AddToGroupAsync(id, roomId);
            //here
            room.AddUser(newUser);
            await Clients.Group(roomId).SendAsync("Left", $"<b>{name}</b> joined");
            room.NoOfUsers++;
            await UpdateUserList();



            //await Clients.Group(roomId).SendAsync("Ready", newUser);

            await UpdateList();
        }

        public override async Task OnDisconnectedAsync(Exception exception)
        {
            string page = Context.GetHttpContext().Request.Query["page"];

            switch (page)
            {
                case "list": ListDisconnected(); break;
                case "draw": await RoomDisconnected(); break;
            }

            await base.OnDisconnectedAsync(exception);
        }

        private void ListDisconnected()
        {
            // Nothing
        }

        private async Task RoomDisconnected()
        {
            string id = Context.ConnectionId;
            string roomId = Context.GetHttpContext().Request.Query["roomId"];

            Room room = rooms.Find(r => r.Id == roomId);
            if (room == null)
            {
                await Clients.Caller.SendAsync("Reject");
                return;
            }
            room.RemoveUser(id);
            room.NoOfUsers--;
            await UpdateUserList();
            string username = Context.GetHttpContext().Request.Query["name"];
            await Clients.OthersInGroup(roomId).SendAsync("Left", $"<b>{username}</b> left");
            

            if (room.IsEmpty)
            {
                rooms.Remove(room);
                await UpdateList();
            }
        }
    }
}