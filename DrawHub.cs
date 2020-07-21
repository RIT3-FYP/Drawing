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
        public string Object { get; set; }
        // public DrawObject(string id,)
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
        private List<User> users { get; set; }
        private List<DrawObject> drawObjects { get; set; }
        public int NoOfUsers { get; set; }
        public bool IsEmpty => NoOfUsers == 0;
        public User GetUser(string id) => users.Find(r => r.Id == id);
        public List<User> getUserList() => users;
        public void AddUser(User user) => users.Add(user);
        public void RemoveUser(string id) => users.Remove(users.Find(r => r.Id == id));

        public DrawObject GetDraw(string id) => drawObjects.Find(r => r.Id == id);
        public List<DrawObject> getDrawList() => drawObjects;

        public void AddDraw(DrawObject o) => drawObjects.Add(o);
        public void RemoveDraw(string id) => drawObjects.Remove(drawObjects.Find(r => r.Id == id));

        public Room()
        {
            users = new List<User>();
            drawObjects = new List<DrawObject>();
        }
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
            room.RemoveDraw(id);
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
            room.getDrawList().Clear();
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
            await Clients.Group(roomId).SendAsync("UpdateUserCount", room.NoOfUsers);
        }

        public async Task UpdateCursor(Point cursorPos)
        {
            string id = Context.ConnectionId;
            string roomId = Context.GetHttpContext().Request.Query["roomId"];
            Room room = rooms.Find(r => r.Id == roomId);
            if (room == null)
            {
                await Clients.Caller.SendAsync("Reject");
            }

            await Clients.OthersInGroup(roomId).SendAsync("UpdateCursor", id, cursorPos);
        }

        public async Task InsertObjectIntoList(DrawObject o)
        {
            string roomId = Context.GetHttpContext().Request.Query["roomId"];

            Room room = rooms.Find(r => r.Id == roomId);
            if (room == null)
            {
                await Clients.Caller.SendAsync("Reject");
            }
            room.AddDraw(o);
        }
        public async Task UpdateObjectInList(DrawObject o)
        {
            string roomId = Context.GetHttpContext().Request.Query["roomId"];

            Room room = rooms.Find(r => r.Id == roomId);
            if (room == null)
            {
                await Clients.Caller.SendAsync("Reject");
            }
            if (room.GetDraw(o.Id) != null)
            {
                room.RemoveDraw(o.Id);
                room.AddDraw(o);
            }
        }


        // List and room connection

        public async Task Start()
        {
            string roomId = Context.GetHttpContext().Request.Query["roomId"];

            Room room = rooms.Find(r => r.Id == roomId);
            if (room == null)
            {
                await Clients.Caller.SendAsync("Reject");
            }
            if (room.getDrawList().Count != 0)
                await Clients.Caller.SendAsync("Refresh", JsonConvert.SerializeObject(room.getDrawList()));
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
            //'#'+(Math.random() * 0xFFFFFF << 0).toString(16).padStart(6, '0');
            string randomColor = Color.FromArgb(rnd.Next(256), rnd.Next(256), rnd.Next(256)).ToString();
            User newUser = new User(id, randomColor, name);

            await Groups.AddToGroupAsync(id, roomId);
            //here
            room.AddUser(newUser);
            await Clients.Group(roomId).SendAsync("Left", $"<b>{name}</b> joined");
            room.NoOfUsers++;
            await UpdateUserList();
            await Start();



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
            await Clients.Group(roomId).SendAsync("UserLeft", id);

            if (room.IsEmpty)
            {
                rooms.Remove(room);
                await UpdateList();
            }
        }
    }
}